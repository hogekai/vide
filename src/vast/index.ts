import type { Player, PlayerState, Plugin } from "../types.js";
import { fetchVast, parseVast } from "./parser.js";
import { createQuartileTracker, track } from "./tracker.js";
import type { VastAd, VastLinear, VastPluginOptions } from "./types.js";

export type {
	VastPluginOptions,
	VastProgressEvent,
	AdPlugin,
	ResolveOptions,
	AdVerification,
	AdCategory,
} from "./types.js";
export { parseVast, fetchVast, resolveVast } from "./parser.js";
export { track, getQuartile } from "./tracker.js";

/** Create a VAST ad plugin for vide. */
export function vast(options: VastPluginOptions): Plugin {
	return {
		name: "vast",
		setup(player: Player): () => void {
			let aborted = false;
			let adCleanup: (() => void) | null = null;

			const setState = (
				player as unknown as { _setState(s: PlayerState): void }
			)._setState;

			async function loadAndPlayAd(): Promise<void> {
				if (aborted) return;

				setState("ad:loading");

				try {
					const fetchOptions =
						options.timeout !== undefined
							? { timeout: options.timeout }
							: undefined;
					const xml = await fetchVast(options.tagUrl, fetchOptions);
					if (aborted) return;

					const response = parseVast(xml);
					if (response.ads.length === 0) {
						setState("playing");
						return;
					}

					// Find the first linear creative with media files
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

					if (!linear || !matchedAd) {
						setState("playing");
						return;
					}

					const adId = matchedAd.id;
					player.emit("ad:start", { adId });

					// --- Ad plugins lifecycle ---
					const adPluginCleanups: (() => void)[] = [];
					if (options.adPlugins) {
						for (const p of options.adPlugins(matchedAd)) {
							const c = p.setup(player, matchedAd);
							if (c) adPluginCleanups.push(c);
						}
					}

					// Fire impressions
					for (const ad of response.ads) {
						track(ad.impressions);
					}
					player.emit("ad:impression", { adId });

					// Select best media file (prefer mp4, highest bitrate)
					const mediaFile = selectMediaFile(linear.mediaFiles);
					if (!mediaFile) {
						player.emit("ad:error", {
							error: new Error("No suitable media file found"),
						});
						setState("playing");
						return;
					}

					// Play ad using the same video element
					const originalTime = player.el.currentTime;
					const prevSrc = player.src;

					// Set up quartile tracking
					const quartileTracker = createQuartileTracker(
						linear.duration,
						(event) => {
							if (!linear) return;
							const urls = linear.trackingEvents[event];
							if (urls) track(urls);
							player.emit("ad:quartile", { adId, quartile: event });
						},
					);

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
					let wasMuted =
						player.el.muted || player.el.volume === 0;

					// Fullscreen tracking
					let wasFullscreen = !!document.fullscreenElement;

					// --- Ad ended: restore content ---
					let adEnding = false;

					function cleanupAdPlugins(): void {
						for (const c of adPluginCleanups) c();
						adPluginCleanups.length = 0;
					}

					function endAd(): void {
						player.emit("ad:end", { adId });
						setState("playing");
						restoreContent();
					}

					function restoreContent(): void {
						function onReady({ to }: { to: string }): void {
							if (to !== "ready") return;
							player.off("statechange", onReady);
							player.el.currentTime = originalTime;
							player.el.play().catch(() => {
								player.el.muted = true;
								player.el.play().catch(() => {});
							});
						}
						player.on("statechange", onReady);
						player.src = prevSrc;
					}

					// --- ad:click: fire tracking, emit event ---
					function onAdClick(): void {
						if (!linear || adEnding) return;
						track(linear.clickTracking);
						player.emit("ad:click", {
							clickThrough: linear.clickThrough,
							clickTracking: linear.clickTracking,
						});
					}

					// --- ad:skip: fire tracking, end ad ---
					function onAdSkip(): void {
						if (!linear || adEnding) return;
						track(linear.trackingEvents.skip);
						adEnding = true;
						cleanup();
						cleanupAdPlugins();
						endAd();
					}

					// --- Pause / Resume tracking ---
					function onAdPause(): void {
						if (!linear || adEnding) return;
						if (player.state === "ad:playing") {
							track(linear.trackingEvents.pause);
							setState("ad:paused");
						}
					}

					function onAdPlay(): void {
						if (!linear || adEnding) return;
						if (player.state === "ad:paused") {
							track(linear.trackingEvents.resume);
							setState("ad:playing");
						}
					}

					// --- Time update: quartiles + progress ---
					function onAdTimeUpdate(): void {
						quartileTracker(player.el.currentTime);
						checkProgress(player.el.currentTime);
					}

					// --- Mute / Unmute tracking ---
					function onAdVolumeChange(): void {
						if (!linear || adEnding) return;
						const nowMuted =
							player.el.muted || player.el.volume === 0;
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

					// --- Fullscreen tracking ---
					function onAdFullscreenChange(): void {
						if (!linear || adEnding) return;
						const isFullscreen = !!document.fullscreenElement;
						if (isFullscreen && !wasFullscreen) {
							track(linear.trackingEvents.playerExpand);
							player.emit("ad:fullscreen", { adId, fullscreen: true });
						} else if (!isFullscreen && wasFullscreen) {
							track(linear.trackingEvents.playerCollapse);
							player.emit("ad:fullscreen", { adId, fullscreen: false });
						}
						wasFullscreen = isFullscreen;
					}

					function onAdError(): void {
						if (adEnding) return;
						adEnding = true;
						cleanup();
						cleanupAdPlugins();
						player.emit("ad:error", {
							error: new Error("Ad media playback failed"),
						});
						endAd();
					}

					function onAdEnded(): void {
						if (adEnding) return;
						adEnding = true;
						if (linear) quartileTracker(linear.duration);
						cleanup();
						cleanupAdPlugins();
						endAd();
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

					function cleanup(): void {
						player.el.removeEventListener("timeupdate", onAdTimeUpdate);
						player.el.removeEventListener("ended", onAdEnded);
						player.el.removeEventListener("error", onAdError);
						player.el.removeEventListener("canplay", onAdCanPlay);
						player.el.removeEventListener("pause", onAdPause);
						player.el.removeEventListener("play", onAdPlay);
						player.el.removeEventListener("click", onAdClick);
						player.el.removeEventListener(
							"volumechange",
							onAdVolumeChange,
						);
						document.removeEventListener(
							"fullscreenchange",
							onAdFullscreenChange,
						);
						player.off("ad:skip", onAdSkip);
					}

					player.el.addEventListener("canplay", onAdCanPlay);
					player.el.addEventListener("timeupdate", onAdTimeUpdate);
					player.el.addEventListener("ended", onAdEnded);
					player.el.addEventListener("error", onAdError);
					player.el.addEventListener("pause", onAdPause);
					player.el.addEventListener("play", onAdPlay);
					player.el.addEventListener("click", onAdClick);
					player.el.addEventListener("volumechange", onAdVolumeChange);
					document.addEventListener(
						"fullscreenchange",
						onAdFullscreenChange,
					);
					player.on("ad:skip", onAdSkip);
					adCleanup = cleanup;

					player.el.src = mediaFile.url;
					player.el.load();
				} catch (err) {
					if (aborted) return;
					player.emit("ad:error", {
						error: err instanceof Error ? err : new Error(String(err)),
					});
					setState("playing");
				}
			}

			// Start ad loading when content is ready to play
			function onStateChange({
				to,
			}: { from: PlayerState; to: PlayerState }): void {
				if (to === "ready" && !aborted) {
					player.off("statechange", onStateChange);
					loadAndPlayAd();
				}
			}

			// If already ready or playing, load ad immediately
			if (
				player.state === "ready" ||
				player.state === "playing" ||
				player.state === "paused"
			) {
				loadAndPlayAd();
			} else {
				player.on("statechange", onStateChange);
			}

			return () => {
				aborted = true;
				player.off("statechange", onStateChange);
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

	// Prefer mp4
	const mp4Files = files.filter((f) => f.mimeType === "video/mp4");
	const candidates = mp4Files.length > 0 ? mp4Files : files;

	// Pick highest bitrate
	return candidates.sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];
}
