import type { PluginPlayer } from "../types.js";
import type {
	ImaAd,
	ImaAdEvent,
	ImaAdsManager,
	ImaNamespace,
} from "./types.js";

export interface BridgeOptions {
	player: PluginPlayer;
	adsManager: ImaAdsManager;
	ima: ImaNamespace;
}

/** Safely read clickThroughUrl — not all IMA Ad objects expose this method. */
function safeClickThrough(ad: ImaAd | null): string | undefined {
	if (!ad || typeof ad.getClickThroughUrl !== "function") return undefined;
	return ad.getClickThroughUrl() ?? undefined;
}

export function createImaBridge(options: BridgeOptions): () => void {
	const { player, adsManager, ima } = options;
	const setState = player.setState;
	const AdEvent = ima.AdEvent.Type;

	let currentAdId = "";
	let wasMuted = player.muted;
	let wasFullscreen = !!document.fullscreenElement;
	let contentResumed = false;

	// ── IMA Event Handlers ──────────────────────────────────

	function onContentPauseRequested(): void {
		contentResumed = false;
		setState("ad:loading");
		player.emit("ad:breakStart", { breakId: undefined, managedUI: true });
	}

	function onLoaded(event: ImaAdEvent): void {
		const ad = event.getAd();
		if (!ad) return;
		currentAdId = ad.getAdId();
		player.emit("ad:loaded", { adId: currentAdId });
	}

	function onStarted(event: ImaAdEvent): void {
		const ad = event.getAd();
		if (!ad) return;
		currentAdId = ad.getAdId();
		setState("ad:playing");

		player.emit("ad:start", {
			adId: currentAdId,
			clickThrough: safeClickThrough(ad),
			skipOffset:
				typeof ad.isSkippable === "function" && ad.isSkippable()
					? ad.getSkipTimeOffset()
					: undefined,
			duration:
				typeof ad.getDuration === "function" && ad.getDuration() > 0
					? ad.getDuration()
					: undefined,
			adTitle:
				typeof ad.getTitle === "function"
					? ad.getTitle() || undefined
					: undefined,
			managedUI: true,
		});
		player.emit("ad:impression", { adId: currentAdId });

		// Pod events
		if (typeof ad.getAdPodInfo === "function") {
			const podInfo = ad.getAdPodInfo();
			if (podInfo.getTotalAds() > 1) {
				if (podInfo.getAdPosition() === 1) {
					player.emit("ad:pod:start", {
						ads: Array.from({ length: podInfo.getTotalAds() }, (_, i) => ({
							id: `pod-${podInfo.getPodIndex()}-${i + 1}`,
						})),
						total: podInfo.getTotalAds(),
					});
				}
				player.emit("ad:pod:adstart", {
					ad: { id: currentAdId },
					index: podInfo.getAdPosition() - 1,
					total: podInfo.getTotalAds(),
				});
			}
		}
	}

	function onQuartile(
		quartile: "firstQuartile" | "midpoint" | "thirdQuartile",
	): void {
		player.emit("ad:quartile", { adId: currentAdId, quartile });
	}

	function onComplete(): void {
		player.emit("ad:quartile", { adId: currentAdId, quartile: "complete" });
		emitPodAdEnd();
		player.emit("ad:end", { adId: currentAdId });
	}

	function onPaused(): void {
		setState("ad:paused");
	}

	function onResumed(): void {
		setState("ad:playing");
	}

	function onSkipped(): void {
		emitPodAdEnd();
		player.emit("ad:skip", { adId: currentAdId });
		player.emit("ad:end", { adId: currentAdId });
	}

	function onClick(): void {
		const ad = adsManager.getCurrentAd();
		player.emit("ad:click", {
			clickThrough: safeClickThrough(ad),
			clickTracking: [], // IMA handles tracking internally
		});
	}

	function onVolumeChanged(): void {
		const volume = adsManager.getVolume();
		const nowMuted = volume === 0;
		if (nowMuted && !wasMuted) {
			player.emit("ad:mute", { adId: currentAdId });
		} else if (!nowMuted && wasMuted) {
			player.emit("ad:unmute", { adId: currentAdId });
		}
		wasMuted = nowMuted;
		player.emit("ad:volumeChange", { adId: currentAdId, volume });
	}

	function resumeContent(): void {
		if (contentResumed) return;
		contentResumed = true;
		setState("playing");
		player.emit("ad:breakEnd", { breakId: undefined });
		player.play().catch(() => {});
	}

	function onContentResumeRequested(): void {
		resumeContent();
	}

	function onAllAdsCompleted(): void {
		// Fallback: if CONTENT_RESUME_REQUESTED was not fired, resume here
		resumeContent();
	}

	// ── Fullscreen bridge ────────────────────────────────

	function onFullscreenChange(): void {
		const isFullscreen = !!document.fullscreenElement;
		if (isFullscreen !== wasFullscreen) {
			player.emit("ad:fullscreen", {
				adId: currentAdId,
				fullscreen: isFullscreen,
			});
			const viewMode = isFullscreen
				? ima.ViewMode.FULLSCREEN
				: ima.ViewMode.NORMAL;
			const el = player.el;
			adsManager.resize(el.clientWidth, el.clientHeight, viewMode);
		}
		wasFullscreen = isFullscreen;
	}

	// ── Resize observer ────────────────────────────────

	let resizeObserver: ResizeObserver | null = null;
	if (typeof ResizeObserver !== "undefined") {
		const resizeTarget = player.el.parentElement ?? player.el;
		resizeObserver = new ResizeObserver(() => {
			const viewMode = document.fullscreenElement
				? ima.ViewMode.FULLSCREEN
				: ima.ViewMode.NORMAL;
			adsManager.resize(
				player.el.clientWidth,
				player.el.clientHeight,
				viewMode,
			);
		});
		resizeObserver.observe(resizeTarget);
	}

	// ── Pod tracking helper ──────────────────────────────

	function emitPodAdEnd(): void {
		const ad = adsManager.getCurrentAd();
		if (!ad || typeof ad.getAdPodInfo !== "function") return;
		const podInfo = ad.getAdPodInfo();
		if (podInfo.getTotalAds() <= 1) return;
		player.emit("ad:pod:adend", {
			ad: { id: currentAdId },
			index: podInfo.getAdPosition() - 1,
			total: podInfo.getTotalAds(),
		});
		if (podInfo.getAdPosition() === podInfo.getTotalAds()) {
			player.emit("ad:pod:end", {
				completed: podInfo.getTotalAds(),
				skipped: 0,
				failed: 0,
			});
		}
	}

	// ── vide → IMA bridge ───────────────────────────────

	function onVideAdSkip(): void {
		adsManager.skip();
	}
	player.on("ad:skip", onVideAdSkip);

	// Forward play/pause/volume from UI controls to adsManager during ads.
	// IMA uses a separate video element for ads, so content video's native
	// play/pause events don't fire. We wrap player.play()/pause() instead.
	let adActive = false;
	function onAdStateChange({
		to,
	}: { from: string; to: string }): void {
		adActive = to.startsWith("ad:");
	}
	player.on("statechange", onAdStateChange);

	const originalPlay = player.play.bind(player);
	const originalPause = player.pause.bind(player);
	player.play = () => {
		if (adActive) {
			adsManager.resume();
			return Promise.resolve();
		}
		return originalPlay();
	};
	player.pause = () => {
		if (adActive) {
			adsManager.pause();
			return;
		}
		originalPause();
	};

	function onVideoVolumeChange(): void {
		if (!adActive) return;
		const vol = player.el.muted ? 0 : player.el.volume;
		adsManager.setVolume(vol);
	}
	player.el.addEventListener("volumechange", onVideoVolumeChange);

	// ── Wire up IMA listeners ───────────────────────────

	adsManager.addEventListener(
		AdEvent.CONTENT_PAUSE_REQUESTED,
		onContentPauseRequested as (e: ImaAdEvent) => void,
	);
	adsManager.addEventListener(AdEvent.LOADED, onLoaded);
	adsManager.addEventListener(AdEvent.STARTED, onStarted);
	adsManager.addEventListener(AdEvent.FIRST_QUARTILE, (() =>
		onQuartile("firstQuartile")) as (e: ImaAdEvent) => void);
	adsManager.addEventListener(AdEvent.MIDPOINT, (() =>
		onQuartile("midpoint")) as (e: ImaAdEvent) => void);
	adsManager.addEventListener(AdEvent.THIRD_QUARTILE, (() =>
		onQuartile("thirdQuartile")) as (e: ImaAdEvent) => void);
	adsManager.addEventListener(
		AdEvent.COMPLETE,
		onComplete as (e: ImaAdEvent) => void,
	);
	adsManager.addEventListener(
		AdEvent.PAUSED,
		onPaused as (e: ImaAdEvent) => void,
	);
	adsManager.addEventListener(
		AdEvent.RESUMED,
		onResumed as (e: ImaAdEvent) => void,
	);
	adsManager.addEventListener(
		AdEvent.SKIPPED,
		onSkipped as (e: ImaAdEvent) => void,
	);
	adsManager.addEventListener(
		AdEvent.CLICK,
		onClick as (e: ImaAdEvent) => void,
	);
	adsManager.addEventListener(AdEvent.IMPRESSION, (() =>
		player.emit("ad:impression", { adId: currentAdId })) as (
		e: ImaAdEvent,
	) => void);
	adsManager.addEventListener(
		AdEvent.VOLUME_CHANGED,
		onVolumeChanged as (e: ImaAdEvent) => void,
	);
	adsManager.addEventListener(
		AdEvent.VOLUME_MUTED,
		onVolumeChanged as (e: ImaAdEvent) => void,
	);
	adsManager.addEventListener(
		AdEvent.CONTENT_RESUME_REQUESTED,
		onContentResumeRequested as (e: ImaAdEvent) => void,
	);
	adsManager.addEventListener(
		AdEvent.ALL_ADS_COMPLETED,
		onAllAdsCompleted as (e: ImaAdEvent) => void,
	);

	document.addEventListener("fullscreenchange", onFullscreenChange);

	// ── Cleanup ──────────────────────────────────────────

	return () => {
		document.removeEventListener("fullscreenchange", onFullscreenChange);
		resizeObserver?.disconnect();
		player.off("ad:skip", onVideAdSkip);
		player.off("statechange", onAdStateChange);
		player.play = originalPlay;
		player.pause = originalPause;
		player.el.removeEventListener("volumechange", onVideoVolumeChange);
	};
}
