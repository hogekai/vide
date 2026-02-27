import type { Player, Plugin } from "../types.js";
import { track } from "../vast/tracker.js";
import { createDashMonitor } from "./dash-monitor.js";
import { createHlsMonitor } from "./hls-monitor.js";
import type { AdBreakMetadata, SsaiPluginOptions } from "./types.js";

export type {
	AdBreakMetadata,
	MetadataParser,
	RawMetadata,
	SsaiPluginOptions,
} from "./types.js";
export { parseDateRange, parseId3Samples } from "./hls-monitor.js";
export { parseEventStream } from "./dash-monitor.js";

const DEFAULT_TOLERANCE = 0.5;

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

				for (const [id, ab] of adBreaks) {
					if (started.has(id)) continue;
					if (currentTime >= ab.startTime - tolerance) {
						started.add(id);
						player.emit("ad:breakStart", { breakId: ab.id });
						player.emit("ad:start", { adId: ab.id });
						if (ab.trackingUrls?.length) {
							track(ab.trackingUrls);
						}
						player.emit("ad:impression", { adId: ab.id });
					}
				}

				for (const [id, ab] of adBreaks) {
					if (!started.has(id) || ended.has(id)) continue;
					const endTime = ab.startTime + ab.duration;
					if (ab.duration > 0 && currentTime >= endTime - tolerance) {
						ended.add(id);
						player.emit("ad:end", { adId: ab.id });
						player.emit("ad:breakEnd", { breakId: ab.id });
					}
				}
			}

			player.on("timeupdate", onTimeUpdate);

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
				player.off("statechange", onStateChange);
				if (monitorCleanup) monitorCleanup();
			};
		},
	};
}
