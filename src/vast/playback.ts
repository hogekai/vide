import type { PluginPlayer } from "../types.js";
import {
	VAST_MEDIA_DISPLAY_ERROR,
	VAST_MEDIA_NOT_FOUND,
	VAST_MEDIA_UNSUPPORTED,
} from "./error-codes.js";
import { selectMediaFile } from "./media.js";
import { createQuartileTracker, track, trackError } from "./tracker.js";
import type { AdPlugin, VastAd, VastLinear } from "./types.js";

export interface PlaySingleAdOptions {
	player: PluginPlayer;
	ad: VastAd;
	linear: VastLinear;
	source: "vast" | "vmap";
	adPlugins?: ((ad: VastAd) => AdPlugin[]) | undefined;
	/** Called synchronously when the ad finishes, before the Promise resolves. */
	onFinish?: ((result: SingleAdResult) => void) | undefined;
}

export interface SingleAdResult {
	outcome: "completed" | "skipped" | "error";
	errorPhase?: "load" | "playback";
	adId: string;
}

/**
 * Play a single ad creative. Returns a Promise that resolves when the ad
 * finishes (completed, skipped, or error), plus an abort function.
 *
 * Does NOT call setState("playing") on completion — caller's responsibility.
 * Does NOT save/restore content src — caller's responsibility.
 */
export function playSingleAd(options: PlaySingleAdOptions): {
	promise: Promise<SingleAdResult>;
	abort: () => void;
} {
	const { player, ad, linear, source } = options;
	const adId = ad.id;

	const setState = player.setState;

	let resolvePromise: (result: SingleAdResult) => void = () => {};
	const promise = new Promise<SingleAdResult>((resolve) => {
		resolvePromise = resolve;
	});

	// --- Ad plugins lifecycle (before ad:start so state is ready for listeners) ---
	const adPluginCleanups: (() => void)[] = [];
	if (options.adPlugins) {
		for (const p of options.adPlugins(ad)) {
			const c = p.setup(player, ad);
			if (c) adPluginCleanups.push(c);
		}
	}

	setState("ad:loading");
	player.emit("ad:start", {
		adId,
		clickThrough: linear.clickThrough,
		skipOffset: linear.skipOffset,
		duration: linear.duration,
		adTitle: ad.adTitle,
	});

	// Emit companion ads if present in any creative
	for (const creative of ad.creatives) {
		if (creative.companionAds && creative.companionAds.companions.length > 0) {
			player.emit("ad:companions", {
				adId,
				required: creative.companionAds.required,
				companions: creative.companionAds.companions,
			});
			break;
		}
	}

	// Emit nonlinear ads if present in any creative
	for (const creative of ad.creatives) {
		if (creative.nonLinearAds && creative.nonLinearAds.nonLinears.length > 0) {
			player.emit("ad:nonlinears", {
				adId,
				nonLinears: creative.nonLinearAds.nonLinears,
				trackingEvents: creative.nonLinearAds.trackingEvents,
			});
			break;
		}
	}

	// Fire impressions for this ad only
	track(ad.impressions);
	player.emit("ad:impression", { adId });

	// Select best media file
	const mediaFile = selectMediaFile(linear.mediaFiles);
	if (!mediaFile) {
		cleanupAdPlugins();
		trackError(ad.errors, VAST_MEDIA_UNSUPPORTED);
		player.emit("ad:error", {
			error: new Error("No suitable media file found"),
			source,
			vastErrorCode: VAST_MEDIA_UNSUPPORTED,
		});
		player.emit("ad:end", { adId });
		resolvePromise({ outcome: "error", errorPhase: "load", adId });
		return { promise, abort: () => {} };
	}

	// Quartile tracking
	const quartileTracker = createQuartileTracker(linear.duration, (event) => {
		const urls = linear.trackingEvents[event];
		if (urls) track(urls);
		player.emit("ad:quartile", { adId, quartile: event });
	});

	// Progress tracking (offset-based, each fires once)
	const firedProgress = new Set<number>();
	function checkProgress(currentTime: number): void {
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

	let adEnding = false;
	let canPlayFired = false;

	function cleanupAdPlugins(): void {
		for (const c of adPluginCleanups) c();
		adPluginCleanups.length = 0;
	}

	function finish(outcome: SingleAdResult["outcome"]): void {
		player.emit("ad:end", { adId });
		const result: SingleAdResult =
			outcome === "error"
				? { outcome, errorPhase: canPlayFired ? "playback" : "load", adId }
				: { outcome, adId };
		if (options.onFinish) options.onFinish(result);
		resolvePromise(result);
	}

	// --- ad:click ---
	function onAdClick(): void {
		if (adEnding) return;
		track(linear.clickTracking);
		player.emit("ad:click", {
			clickThrough: linear.clickThrough,
			clickTracking: linear.clickTracking,
		});
	}

	// --- ad:skip ---
	function onAdSkip(): void {
		if (adEnding) return;
		track(linear.trackingEvents.skip);
		adEnding = true;
		cleanup();
		cleanupAdPlugins();
		finish("skipped");
	}

	// --- Pause / Resume ---
	function onAdPause(): void {
		if (adEnding) return;
		if (player.state === "ad:playing") {
			track(linear.trackingEvents.pause);
			setState("ad:paused");
		}
	}

	function onAdPlay(): void {
		if (adEnding) return;
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

	// --- Mute / Unmute ---
	function onAdVolumeChange(): void {
		if (adEnding) return;
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

	// --- Fullscreen ---
	function onAdFullscreenChange(): void {
		if (adEnding) return;
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
		const vastErrorCode = canPlayFired
			? VAST_MEDIA_DISPLAY_ERROR
			: VAST_MEDIA_NOT_FOUND;
		trackError(ad.errors, vastErrorCode);
		player.emit("ad:error", {
			error: new Error("Ad media playback failed"),
			source,
			vastErrorCode,
		});
		finish("error");
	}

	function onAdEnded(): void {
		if (adEnding) return;
		adEnding = true;
		quartileTracker(linear.duration);
		cleanup();
		cleanupAdPlugins();
		finish("completed");
	}

	function onAdCanPlay(): void {
		player.el.removeEventListener("canplay", onAdCanPlay);
		canPlayFired = true;
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
		player.el.removeEventListener("volumechange", onAdVolumeChange);
		document.removeEventListener("fullscreenchange", onAdFullscreenChange);
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
	document.addEventListener("fullscreenchange", onAdFullscreenChange);
	player.on("ad:skip", onAdSkip);

	player.el.src = mediaFile.url;
	player.el.load();

	return {
		promise,
		abort: () => {
			if (!adEnding) {
				adEnding = true;
				cleanup();
				cleanupAdPlugins();
			}
		},
	};
}
