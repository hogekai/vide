import type { Player, Plugin } from "../types.js";
import { createQuartileTracker, track } from "../vast/tracker.js";
import { createDashMonitor } from "./dash-monitor.js";
import { createHlsMonitor } from "./hls-monitor.js";
import type {
	AdBreakMetadata,
	AdTrackingMap,
	SsaiPluginOptions,
} from "./types.js";

export type {
	AdBreakMetadata,
	AdTrackingMap,
	MetadataParser,
	RawMetadata,
	SsaiPluginOptions,
} from "./types.js";
export { parseDateRange, parseId3Samples } from "./hls-monitor.js";
export { parseEventStream } from "./dash-monitor.js";

const DEFAULT_TOLERANCE = 0.5;

function getTracking(ab: AdBreakMetadata): AdTrackingMap {
	return ab.tracking ?? {};
}

/** Create an SSAI (Server-Side Ad Insertion) plugin for vide. */
export function ssai(options: SsaiPluginOptions = {}): Plugin {
	return {
		name: "ssai",
		setup(player: Player): () => void {
			const tolerance = options.tolerance ?? DEFAULT_TOLERANCE;
			const parser = options.parser;

			const adBreaks = new Map<string, AdBreakMetadata>();
			const started = new Set<string>();
			const ended = new Set<string>();
			const activeTrackers = new Map<string, (currentTime: number) => void>();
			const activeTracking = new Map<string, AdTrackingMap>();

			let monitorCleanup: (() => void) | null = null;
			let destroyed = false;

			function onMetadata(breaks: AdBreakMetadata[]): void {
				for (const ab of breaks) {
					if (!adBreaks.has(ab.id)) {
						adBreaks.set(ab.id, ab);
					}
				}
			}

			function tryAttach(): boolean {
				if (monitorCleanup) return true;

				const hlsInstance = player.getPluginData("hls") as
					| {
							on(e: string, h: (...args: unknown[]) => void): void;
							off(e: string, h: (...args: unknown[]) => void): void;
					  }
					| undefined;
				if (hlsInstance) {
					monitorCleanup = createHlsMonitor(hlsInstance, parser, onMetadata);
					return true;
				}

				const dashInstance = player.getPluginData("dash") as
					| {
							on(e: string, h: (e: unknown) => void): void;
							off(e: string, h: (e: unknown) => void): void;
					  }
					| undefined;
				if (dashInstance) {
					monitorCleanup = createDashMonitor(dashInstance, parser, onMetadata);
					return true;
				}

				return false;
			}

			function onTimeUpdate({
				currentTime,
			}: { currentTime: number; duration: number }): void {
				if (destroyed) return;

				// Detect ad:start
				for (const [id, ab] of adBreaks) {
					if (started.has(id)) continue;
					if (currentTime >= ab.startTime - tolerance) {
						started.add(id);

						const tracking = getTracking(ab);
						activeTracking.set(id, tracking);

						player.emit("ad:breakStart", { breakId: ab.id });
						player.emit("ad:start", { adId: ab.id });

						if (tracking.impression?.length) {
							track(tracking.impression);
						}

						// Create quartile tracker for timed ads
						if (ab.duration > 0) {
							const qt = createQuartileTracker(ab.duration, (event) => {
								const urls = tracking[event];
								if (urls?.length) track(urls);
								player.emit("ad:quartile", {
									adId: ab.id,
									quartile: event,
								});
							});
							activeTrackers.set(id, qt);
							// Fire initial quartile (start) at current position
							qt(currentTime - ab.startTime);
						}

						player.emit("ad:impression", { adId: ab.id });
					}
				}

				// Update quartile trackers for active ads
				for (const [id, qt] of activeTrackers) {
					if (ended.has(id)) continue;
					const ab = adBreaks.get(id);
					if (ab) qt(currentTime - ab.startTime);
				}

				// Detect ad:end
				for (const [id, ab] of adBreaks) {
					if (!started.has(id) || ended.has(id)) continue;
					const endTime = ab.startTime + ab.duration;
					if (ab.duration > 0 && currentTime >= endTime - tolerance) {
						// Flush remaining quartiles (complete) before cleanup.
						// Tolerance may trigger ad:end before pct reaches 1.0.
						const qt = activeTrackers.get(id);
						if (qt) qt(ab.duration);
						ended.add(id);
						activeTrackers.delete(id);
						activeTracking.delete(id);
						player.emit("ad:end", { adId: ab.id });
						player.emit("ad:breakEnd", { breakId: ab.id });
					}
				}
			}

			function onPause(): void {
				if (destroyed) return;
				for (const [id] of activeTrackers) {
					if (ended.has(id)) continue;
					const t = activeTracking.get(id);
					if (t?.pause?.length) track(t.pause);
				}
			}

			function onResume(): void {
				if (destroyed) return;
				for (const [id] of activeTrackers) {
					if (ended.has(id)) continue;
					const t = activeTracking.get(id);
					if (t?.resume?.length) track(t.resume);
				}
			}

			function onAdSkip({ adId }: { adId: string }): void {
				if (destroyed) return;
				const t = activeTracking.get(adId);
				if (t?.skip?.length) track(t.skip);
				activeTrackers.delete(adId);
				activeTracking.delete(adId);
				ended.add(adId);
				player.emit("ad:end", { adId });
				player.emit("ad:breakEnd", { breakId: adId });
			}

			player.on("timeupdate", onTimeUpdate);
			player.on("pause", onPause);
			player.on("play", onResume);
			player.on("ad:skip", onAdSkip);

			// Try immediately — instance may already exist
			tryAttach();

			// Deferred attach via statechange (handles async instance creation)
			function onStateChange(): void {
				if (monitorCleanup || destroyed) {
					player.off("statechange", onStateChange);
					return;
				}
				if (tryAttach()) {
					player.off("statechange", onStateChange);
				}
			}

			if (!monitorCleanup) {
				player.on("statechange", onStateChange);
			}

			return () => {
				destroyed = true;
				player.off("timeupdate", onTimeUpdate);
				player.off("pause", onPause);
				player.off("play", onResume);
				player.off("ad:skip", onAdSkip);
				player.off("statechange", onStateChange);
				activeTrackers.clear();
				activeTracking.clear();
				if (monitorCleanup) monitorCleanup();
			};
		},
	};
}
