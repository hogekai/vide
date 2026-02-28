import type { Player, PlayerState, Plugin } from "../types.js";
import {
	VAST_NO_ADS,
	VAST_WRAPPER_TIMEOUT,
	VAST_XML_PARSE_ERROR,
} from "../vast/error-codes.js";
import { parseVast, resolveVast } from "../vast/parser.js";
import { playSingleAd } from "../vast/playback.js";
import { classifyAds, playPod, playWaterfall } from "../vast/pod.js";
import { track, trackError } from "../vast/tracker.js";
import type { VastResponse } from "../vast/types.js";
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
			let adAbort: (() => void) | null = null;

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

					let classified = classifyAds(response.ads);
					if (classified.ads.length === 0) return;

					// VMAP spec: when allowMultipleAds is false, only play the first ad
					if (adBreak.adSource.allowMultipleAds === false) {
						classified = {
							type: "single",
							ads: [classified.ads[0]],
							standalonePool: [],
						};
					}

					// Save content state
					const originalTime = player.el.currentTime;
					const originalPaused = player.el.paused;
					const prevSrc = player.el.src;

					function onAdsDone(): void {
						if (aborted) return;
						setState("playing");
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

					switch (classified.type) {
						case "single": {
							const { promise, abort } = playSingleAd({
								player,
								ad: classified.ads[0].ad,
								linear: classified.ads[0].linear,
								source: "vmap",
								adPlugins: options.adPlugins,
								onFinish: onAdsDone,
							});
							adAbort = abort;
							await promise;
							break;
						}
						case "pod": {
							await playPod(player, classified.ads, {
								source: "vmap",
								adPlugins: options.adPlugins,
								onFinish: onAdsDone,
								standalonePool: classified.standalonePool,
							});
							break;
						}
						case "waterfall": {
							const result = await playWaterfall(player, classified.ads, {
								source: "vmap",
								adPlugins: options.adPlugins,
								onFinish: onAdsDone,
							});
							if (!result) {
								trackError(response.errors, VAST_NO_ADS);
								player.emit("ad:error", {
									error: new Error("All waterfall ads failed"),
									source: "vmap",
									vastErrorCode: VAST_NO_ADS,
								});
								onAdsDone();
							}
							break;
						}
					}
				} catch (err) {
					if (!aborted) {
						const error = err instanceof Error ? err : new Error(String(err));
						const vastErrorCode =
							error.name === "AbortError"
								? VAST_WRAPPER_TIMEOUT
								: VAST_XML_PARSE_ERROR;
						track(adBreak.trackingEvents.error);
						player.emit("ad:error", {
							error,
							source: "vmap",
							vastErrorCode,
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
						source: "vmap",
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
				if (adAbort) {
					adAbort();
				}
			};
		},
	};
}
