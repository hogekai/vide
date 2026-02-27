import type { Player, PlayerState, Plugin } from "../types.js";
import { parseVast, resolveVast } from "../vast/parser.js";
import { createQuartileTracker, track } from "../vast/tracker.js";
import type { VastAd, VastLinear, VastResponse } from "../vast/types.js";
import { parseVmap } from "./parser.js";
import { createScheduler } from "./scheduler.js";
import type { AdBreak, VmapPluginOptions } from "./types.js";

export type {
	VmapPluginOptions,
	VmapResponse,
	AdBreak,
	AdBreakTimeOffset,
	AdBreakTrackingEvents,
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

				// Fire breakStart tracking
				track(adBreak.trackingEvents.breakStart);
				player.emit("ad:breakStart", { breakId: adBreak.breakId });

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
					let matchedAd: VastAd | null = null;
					for (const ad of response.ads) {
						for (const creative of ad.creatives) {
							if (creative.linear && creative.linear.mediaFiles.length > 0) {
								linear = creative.linear;
								matchedAd = ad;
								break;
							}
						}
						if (linear) break;
					}

					if (!linear || !matchedAd) return;

					const adId = matchedAd.id;
					setState("ad:loading");
					player.emit("ad:start", { adId });

					// --- Ad plugins lifecycle ---
					const adPluginCleanups: (() => void)[] = [];
					if (options.adPlugins) {
						for (const p of options.adPlugins(matchedAd)) {
							const c = p.setup(player, matchedAd);
							if (c) adPluginCleanups.push(c);
						}
					}

					function cleanupAdPlugins(): void {
						for (const c of adPluginCleanups) c();
						adPluginCleanups.length = 0;
					}

					for (const ad of response.ads) {
						track(ad.impressions);
					}
					player.emit("ad:impression", { adId });

					const mediaFile = selectMediaFile(linear.mediaFiles);
					if (!mediaFile) {
						player.emit("ad:error", {
							error: new Error("No suitable media file found"),
						});
						cleanupAdPlugins();
						setState("playing");
						return;
					}

					const originalTime = player.el.currentTime;
					const originalPaused = player.el.paused;
					const prevSrc = player.el.src;

					const tracker = createQuartileTracker(linear.duration, (event) => {
						if (!linear) return;
						const urls = linear.trackingEvents[event];
						if (urls) track(urls);
						player.emit("ad:quartile", { adId, quartile: event });
					});

					// Progress tracking (offset-based, each fires once)
					const firedProgress = new Set<number>();
					function checkProgress(currentTime: number): void {
						if (!linear) return;
						for (const p of linear.trackingEvents.progress) {
							if (!firedProgress.has(p.offset) && currentTime >= p.offset) {
								firedProgress.add(p.offset);
								track([p.url]);
							}
						}
					}

					// Mute/unmute tracking
					let wasMuted = player.el.muted || player.el.volume === 0;

					// Fullscreen tracking
					let wasFullscreen = !!document.fullscreenElement;

					await new Promise<void>((resolve) => {
						function onAdTimeUpdate(): void {
							tracker(player.el.currentTime);
							checkProgress(player.el.currentTime);
						}

						function onAdVolumeChange(): void {
							if (!linear) return;
							const nowMuted = player.el.muted || player.el.volume === 0;
							if (nowMuted && !wasMuted) {
								track(linear.trackingEvents.mute);
								player.emit("ad:mute", { adId });
							} else if (!nowMuted && wasMuted) {
								track(linear.trackingEvents.unmute);
								player.emit("ad:unmute", { adId });
							}
							wasMuted = nowMuted;
							player.emit("ad:volumeChange", {
								adId,
								volume: player.el.muted ? 0 : player.el.volume,
							});
						}

						function onAdFullscreenChange(): void {
							if (!linear) return;
							const isFullscreen = !!document.fullscreenElement;
							if (isFullscreen && !wasFullscreen) {
								track(linear.trackingEvents.playerExpand);
								player.emit("ad:fullscreen", {
									adId,
									fullscreen: true,
								});
							} else if (!isFullscreen && wasFullscreen) {
								track(linear.trackingEvents.playerCollapse);
								player.emit("ad:fullscreen", {
									adId,
									fullscreen: false,
								});
							}
							wasFullscreen = isFullscreen;
						}

						function onAdEnded(): void {
							if (linear) tracker(linear.duration);
							cleanup();
							cleanupAdPlugins();
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
							player.el.removeEventListener("timeupdate", onAdTimeUpdate);
							player.el.removeEventListener("ended", onAdEnded);
							player.el.removeEventListener("canplay", onAdCanPlay);
							player.el.removeEventListener("volumechange", onAdVolumeChange);
							document.removeEventListener(
								"fullscreenchange",
								onAdFullscreenChange,
							);
							adCleanup = null;
						}

						function onAdCanPlay(): void {
							player.el.removeEventListener("canplay", onAdCanPlay);
							if (!linear) return;
							track(linear.trackingEvents.loaded);
							track(linear.trackingEvents.creativeView);
							player.emit("ad:loaded", { adId });
							setState("ad:playing");
							player.el.play().catch(() => {
								player.el.muted = true;
								player.el.play().catch(() => {});
							});
						}

						player.el.addEventListener("canplay", onAdCanPlay);
						player.el.addEventListener("timeupdate", onAdTimeUpdate);
						player.el.addEventListener("ended", onAdEnded);
						player.el.addEventListener("volumechange", onAdVolumeChange);
						document.addEventListener("fullscreenchange", onAdFullscreenChange);
						adCleanup = cleanup;

						player.el.src = mediaFile.url;
						player.el.load();
					});
				} catch (err) {
					if (!aborted) {
						track(adBreak.trackingEvents.error);
						player.emit("ad:error", {
							error: err instanceof Error ? err : new Error(String(err)),
						});
					}
				} finally {
					// Fire breakEnd tracking
					track(adBreak.trackingEvents.breakEnd);
					player.emit("ad:breakEnd", { breakId: adBreak.breakId });
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
