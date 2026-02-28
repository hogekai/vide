import type { Player, PlayerState, Plugin } from "../types.js";
import { fetchVast, parseVast } from "./parser.js";
import { playSingleAd } from "./playback.js";
import { classifyAds, playPod, playWaterfall } from "./pod.js";
import type { VastPluginOptions } from "./types.js";

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
export { selectMediaFile } from "./media.js";
export { playSingleAd } from "./playback.js";
export type { PlaySingleAdOptions, SingleAdResult } from "./playback.js";
export { classifyAds, playPod, playWaterfall } from "./pod.js";
export type { ClassifiedAds, PlayableAd, PodResult } from "./pod.js";

/** Create a VAST ad plugin for vide. */
export function vast(options: VastPluginOptions): Plugin {
	return {
		name: "vast",
		setup(player: Player): () => void {
			let aborted = false;
			let adAbort: (() => void) | null = null;

			const setState = (
				player as unknown as { _setState(s: PlayerState): void }
			)._setState;

			async function loadAndPlayAd(): Promise<void> {
				if (aborted) return;

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

					const classified = classifyAds(response.ads);
					if (classified.ads.length === 0) {
						setState("playing");
						return;
					}

					// Save content state for restoration after ads
					const originalTime = player.el.currentTime;
					const prevSrc = player.src;

					// Detach any active source handler (e.g. hls.js) before
					// loading the ad MP4 directly on the video element.
					player.src = "";

					// Synchronous callback to restore state + content.
					// Must run in the same stack frame as the ad's ended/error/skip
					// event so that player.state updates are visible synchronously.
					function onAdsDone(): void {
						if (aborted) return;
						setState("playing");
						restoreContent(player, prevSrc, originalTime);
					}

					switch (classified.type) {
						case "single": {
							const { promise, abort } = playSingleAd({
								player,
								ad: classified.ads[0].ad,
								linear: classified.ads[0].linear,
								source: "vast",
								adPlugins: options.adPlugins,
								onFinish: onAdsDone,
							});
							adAbort = abort;
							await promise;
							break;
						}
						case "pod": {
							await playPod(player, classified.ads, {
								source: "vast",
								adPlugins: options.adPlugins,
								onFinish: onAdsDone,
								standalonePool: classified.standalonePool,
							});
							break;
						}
						case "waterfall": {
							const result = await playWaterfall(player, classified.ads, {
								source: "vast",
								adPlugins: options.adPlugins,
								onFinish: onAdsDone,
							});
							if (!result) {
								player.emit("ad:error", {
									error: new Error("All waterfall ads failed"),
									source: "vast",
								});
								onAdsDone();
							}
							break;
						}
					}
				} catch (err) {
					if (aborted) return;
					player.emit("ad:error", {
						error: err instanceof Error ? err : new Error(String(err)),
						source: "vast",
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
				if (adAbort) {
					adAbort();
				}
			};
		},
	};
}

function restoreContent(
	player: Player,
	prevSrc: string,
	originalTime: number,
): void {
	function onReady({ to }: { from: string; to: string }): void {
		if (to !== "ready") return;
		player.off("statechange", onReady);
		if (originalTime > 0) {
			player.el.currentTime = originalTime;
		}
		player.play().catch(() => {
			player.el.muted = true;
			player.play().catch(() => {});
		});
	}
	player.on("statechange", onReady);
	player.src = prevSrc;
}
