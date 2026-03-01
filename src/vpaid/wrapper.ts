import type { Player } from "../types.js";
import { track } from "../vast/tracker.js";
import type { VastAd, VastLinear } from "../vast/types.js";
import type { VpaidAdUnit, VpaidEvent } from "./types.js";

export interface VpaidWrapper {
	start(): Promise<void>;
	destroy(): void;
}

export interface VpaidWrapperOptions {
	handshakeTimeout: number;
	initTimeout: number;
	startTimeout: number;
	stopTimeout: number;
}

export function createVpaidWrapper(
	player: Player,
	adUnit: VpaidAdUnit,
	options: VpaidWrapperOptions,
	ad: VastAd,
	linear: VastLinear,
	slot: HTMLElement,
	videoSlot: HTMLVideoElement,
	scriptCleanup: () => void,
): VpaidWrapper {
	let destroyed = false;
	const eventCleanups: (() => void)[] = [];

	function on(event: VpaidEvent, fn: (...args: unknown[]) => void): void {
		adUnit.subscribe(fn, event);
		eventCleanups.push(() => {
			try {
				adUnit.unsubscribe(fn, event);
			} catch (_) {
				/* ad unit may already be destroyed */
			}
		});
	}

	function waitForEvent(
		event: VpaidEvent,
		timeout: number,
		label: string,
	): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const timer = setTimeout(() => {
				try {
					adUnit.unsubscribe(handler, event);
					adUnit.unsubscribe(errorHandler, "AdError");
				} catch (_) {
					/* ignore */
				}
				reject(new Error(`VPAID timeout: ${label} (waiting for ${event})`));
			}, timeout);

			const handler = (): void => {
				clearTimeout(timer);
				try {
					adUnit.unsubscribe(handler, event);
					adUnit.unsubscribe(errorHandler, "AdError");
				} catch (_) {
					/* ignore */
				}
				resolve();
			};

			const errorHandler = (message?: unknown): void => {
				clearTimeout(timer);
				try {
					adUnit.unsubscribe(handler, event);
					adUnit.unsubscribe(errorHandler, "AdError");
				} catch (_) {
					/* ignore */
				}
				reject(
					new Error(`VPAID AdError during ${label}: ${message ?? "unknown"}`),
				);
			};

			adUnit.subscribe(handler, event);
			adUnit.subscribe(errorHandler, "AdError");
		});
	}

	function destroy(): void {
		if (destroyed) return;
		destroyed = true;

		for (const cleanup of eventCleanups) cleanup();
		eventCleanups.length = 0;

		try {
			adUnit.stopAd();
		} catch (_) {
			/* best effort */
		}

		slot.remove();
		scriptCleanup();
	}

	function wireEvents(): void {
		const adId = ad.id;
		const tracking = linear.trackingEvents;

		on(
			"AdClickThru",
			(url?: unknown, _id?: unknown, playerHandles?: unknown) => {
				track(linear.clickTracking);
				const clickThrough =
					(typeof url === "string" && url) || linear.clickThrough;
				player.emit("ad:click", {
					clickThrough,
					clickTracking: linear.clickTracking,
				});
				if (playerHandles && clickThrough) {
					window.open(clickThrough, "_blank");
				}
			},
		);

		on("AdPaused", () => {
			track(tracking.pause);
		});

		on("AdPlaying", () => {
			track(tracking.resume);
		});

		on("AdSkipped", () => {
			track(tracking.skip);
			player.emit("ad:skip", { adId });
			destroy();
		});

		on("AdVolumeChange", () => {
			const volume = adUnit.adVolume;
			if (volume === 0) {
				track(tracking.mute);
				player.emit("ad:mute", { adId });
			}
			player.emit("ad:volumeChange", { adId, volume });
		});

		on("AdError", (message?: unknown) => {
			player.emit("ad:error", {
				error: new Error(`VPAID AdError: ${message ?? "unknown"}`),
				source: "vpaid",
				vastErrorCode: 901,
			});
		});

		on("AdLog", (message?: unknown) => {
			console.debug("[vide:vpaid] ad:", message);
		});

		on("AdStopped", () => {
			destroy();
		});
	}

	async function start(): Promise<void> {
		let version: string;
		try {
			version = adUnit.handshakeVersion("2.0");
		} catch (err) {
			throw new Error(`VPAID handshake failed: ${err}`);
		}

		if (!version.startsWith("2.")) {
			throw new Error(`VPAID version mismatch: expected 2.x, got ${version}`);
		}

		wireEvents();

		const rect = player.el.getBoundingClientRect();
		const width = Math.round(rect.width);
		const height = Math.round(rect.height);

		// Create promise BEFORE calling initAd so synchronous AdLoaded is caught
		const adLoadedPromise = waitForEvent(
			"AdLoaded",
			options.initTimeout,
			"initAd",
		);

		try {
			adUnit.initAd(
				width,
				height,
				"normal",
				-1,
				{
					AdParameters: linear.adParameters ?? "",
				},
				{
					slot,
					videoSlot,
					videoSlotCanAutoPlay: true,
				},
			);
		} catch (err) {
			throw new Error(`VPAID initAd failed: ${err}`);
		}

		await adLoadedPromise;

		if (destroyed) throw new Error("VPAID wrapper destroyed during init");

		try {
			adUnit.adVolume = player.muted ? 0 : player.volume;
		} catch (_) {
			/* some ad units don't support setting volume */
		}

		// Create promise BEFORE calling startAd so synchronous AdStarted is caught
		const adStartedPromise = waitForEvent(
			"AdStarted",
			options.startTimeout,
			"startAd",
		);

		try {
			adUnit.startAd();
		} catch (err) {
			throw new Error(`VPAID startAd failed: ${err}`);
		}

		await adStartedPromise;

		if (destroyed) throw new Error("VPAID wrapper destroyed during start");

		slot.style.display = "";
	}

	return { start, destroy };
}
