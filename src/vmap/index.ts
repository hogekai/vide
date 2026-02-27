import type { Player, PlayerState, Plugin } from "../types.js";
import { parseVast, resolveVast } from "../vast/parser.js";
import { createQuartileTracker, track } from "../vast/tracker.js";
import type { VastLinear, VastResponse } from "../vast/types.js";
import { parseVmap } from "./parser.js";
import { createScheduler } from "./scheduler.js";
import type { AdBreak, VmapPluginOptions } from "./types.js";

export type {
	VmapPluginOptions,
	VmapResponse,
	AdBreak,
	AdBreakTimeOffset,
	AdSource,
} from "./types.js";
export { parseVmap } from "./parser.js";
export { createScheduler } from "./scheduler.js";

/** Create a VMAP ad plugin for vide. */
export function vmap(options: VmapPluginOptions): Plugin {
	return {
		name: "vmap",
		setup(player: Player): () => void {
			let aborted = false;
			let schedulerRef: ReturnType<typeof createScheduler> | null = null;
			let adCleanup: (() => void) | null = null;

			const setState = (
				player as unknown as { _setState(s: PlayerState): void }
			)._setState;

			async function playAdForBreak(adBreak: AdBreak): Promise<void> {
				if (aborted || !adBreak.adSource) return;
				if (schedulerRef) schedulerRef.pause();

				try {
					let response: VastResponse;
					if (adBreak.adSource.vastData) {
						response = parseVast(adBreak.adSource.vastData);
					} else if (adBreak.adSource.vastUrl) {
						response = await resolveVast(
							adBreak.adSource.vastUrl,
							options.vastOptions,
						);
					} else {
						return;
					}

					if (aborted || response.ads.length === 0) return;

					let linear: VastLinear | null = null;
					let adId = "";
					for (const ad of response.ads) {
						for (const creative of ad.creatives) {
							if (
								creative.linear &&
								creative.linear.mediaFiles.length > 0
							) {
								linear = creative.linear;
								adId = ad.id;
								break;
							}
						}
						if (linear) break;
					}

					if (!linear) return;

					setState("ad:loading");
					player.emit("ad:start", { adId });

					for (const ad of response.ads) {
						track(ad.impressions);
					}

					const mediaFile = selectMediaFile(linear.mediaFiles);
					if (!mediaFile) {
						player.emit("ad:error", {
							error: new Error("No suitable media file found"),
						});
						setState("playing");
						return;
					}

					const originalTime = player.el.currentTime;
					const originalPaused = player.el.paused;
					const prevSrc = player.el.src;

					const tracker = createQuartileTracker(
						linear.duration,
						(event) => {
							if (!linear) return;
							const urls = linear.trackingEvents[event];
							if (urls) track(urls);
						},
					);

					await new Promise<void>((resolve) => {
						function onAdTimeUpdate(): void {
							tracker(player.el.currentTime);
						}

						function onAdEnded(): void {
							cleanup();
							if (linear) track(linear.trackingEvents.complete);
							player.emit("ad:end", { adId });

							player.el.src = prevSrc;
							player.el.load();
							player.el.currentTime = originalTime;
							if (!originalPaused) {
								player.el.play().catch(() => {
									player.el.muted = true;
									player.el.play().catch(() => {});
								});
							}
							resolve();
						}

						function cleanup(): void {
							player.el.removeEventListener(
								"timeupdate",
								onAdTimeUpdate,
							);
							player.el.removeEventListener("ended", onAdEnded);
							player.el.removeEventListener(
								"canplay",
								onAdCanPlay,
							);
							adCleanup = null;
						}

						function onAdCanPlay(): void {
							player.el.removeEventListener(
								"canplay",
								onAdCanPlay,
							);
							if (!linear) return;
							setState("ad:playing");
							track(linear.trackingEvents.start);
							player.el.play().catch(() => {
								player.el.muted = true;
								player.el.play().catch(() => {});
							});
						}

						player.el.addEventListener("canplay", onAdCanPlay);
						player.el.addEventListener(
							"timeupdate",
							onAdTimeUpdate,
						);
						player.el.addEventListener("ended", onAdEnded);
						adCleanup = cleanup;

						player.el.src = mediaFile.url;
						player.el.load();
					});
				} finally {
					if (schedulerRef) schedulerRef.resume();
				}
			}

			async function init(): Promise<void> {
				if (aborted) return;

				try {
					const fetchTimeout = options.timeout ?? 10_000;
					const controller = new AbortController();
					const timer = setTimeout(() => controller.abort(), fetchTimeout);

					let vmapXml: string;
					try {
						const res = await fetch(options.url, {
							signal: controller.signal,
						});
						if (!res.ok) throw new Error(`VMAP fetch failed: ${res.status}`);
						vmapXml = await res.text();
					} finally {
						clearTimeout(timer);
					}

					if (aborted) return;

					const vmapResponse = parseVmap(vmapXml);
					if (vmapResponse.adBreaks.length === 0) return;

					const scheduler = createScheduler(
						player,
						vmapResponse.adBreaks,
						(adBreak) => playAdForBreak(adBreak),
					);

					schedulerRef = scheduler;
					scheduler.start();
				} catch (err) {
					if (aborted) return;
					player.emit("ad:error", {
						error: err instanceof Error ? err : new Error(String(err)),
					});
				}
			}

			function onStateChange({
				to,
			}: { from: PlayerState; to: PlayerState }): void {
				if (to === "ready" && !aborted) {
					player.off("statechange", onStateChange);
					init();
				}
			}

			if (
				player.state === "ready" ||
				player.state === "playing" ||
				player.state === "paused"
			) {
				init();
			} else {
				// TODO: Same leak contract as VAST plugin — relies on destroy() being called.
				player.on("statechange", onStateChange);
			}

			return () => {
				aborted = true;
				player.off("statechange", onStateChange);
				if (schedulerRef) {
					schedulerRef.destroy();
				}
				if (adCleanup) {
					adCleanup();
				}
			};
		},
	};
}

function selectMediaFile(
	files: { url: string; mimeType: string; bitrate?: number | undefined }[],
): { url: string; mimeType: string } | null {
	if (files.length === 0) return null;

	const mp4Files = files.filter((f) => f.mimeType === "video/mp4");
	const candidates = mp4Files.length > 0 ? mp4Files : files;

	return candidates.sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];
}
