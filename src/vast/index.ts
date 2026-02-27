import type { Player, PlayerState, Plugin } from "../types.js";
import { fetchVast, parseVast } from "./parser.js";
import { createQuartileTracker, track } from "./tracker.js";
import type { VastLinear, VastPluginOptions } from "./types.js";

export type {
	VastPluginOptions,
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
			let quartileCleanup: (() => void) | null = null;

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
					let adId = "";
					for (const ad of response.ads) {
						for (const creative of ad.creatives) {
							if (creative.linear && creative.linear.mediaFiles.length > 0) {
								linear = creative.linear;
								adId = ad.id;
								break;
							}
						}
						if (linear) break;
					}

					if (!linear) {
						setState("playing");
						return;
					}

					player.emit("ad:start", { adId });

					// Fire impressions
					for (const ad of response.ads) {
						track(ad.impressions);
					}

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
					const originalPaused = player.el.paused;
					const prevSrc = player.el.src;

					// Set up quartile tracking
					const tracker = createQuartileTracker(linear.duration, (event) => {
						if (!linear) return;
						const urls = linear.trackingEvents[event];
						if (urls) {
							track(urls);
						}
					});

					function onAdTimeUpdate(): void {
						tracker(player.el.currentTime);
					}

					function onAdEnded(): void {
						cleanup();
						if (!linear) return;
						track(linear.trackingEvents.complete);
						player.emit("ad:end", { adId });

						// Restore original content
						player.el.src = prevSrc;
						player.el.load();
						player.el.currentTime = originalTime;
						if (!originalPaused) {
							player.el.play().catch(() => {
								player.el.muted = true;
								player.el.play().catch(() => {});
							});
						}
					}

					function cleanup(): void {
						player.el.removeEventListener("timeupdate", onAdTimeUpdate);
						player.el.removeEventListener("ended", onAdEnded);
						player.el.removeEventListener("canplay", onAdCanPlay);
					}

					function onAdCanPlay(): void {
						player.el.removeEventListener("canplay", onAdCanPlay);
						if (!linear) return;
						setState("ad:playing");
						track(linear.trackingEvents.start);
						player.el.play().catch(() => {
							player.el.muted = true;
							player.el.play().catch(() => {});
						});
					}

					player.el.addEventListener("canplay", onAdCanPlay);
					player.el.addEventListener("timeupdate", onAdTimeUpdate);
					player.el.addEventListener("ended", onAdEnded);
					quartileCleanup = cleanup;

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
				// TODO: This listener is cleaned up in the returned cleanup function,
				// but leaks if destroy() is never called by the consumer.
				player.on("statechange", onStateChange);
			}

			return () => {
				aborted = true;
				player.off("statechange", onStateChange);
				if (quartileCleanup) {
					quartileCleanup();
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
