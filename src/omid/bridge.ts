import type { Player, PlayerState } from "../types.js";
import { createQuartileTracker } from "../vast/tracker.js";
import type { OmidSession } from "./session.js";
import type { OmidVideoPlayerState } from "./types.js";

/**
 * Connect a vide Player to an OmidSession, translating player events
 * into OM SDK method calls.
 *
 * Must only be called after `session.waitForStart()` resolves true.
 * Returns a cleanup function that removes all event subscriptions.
 */
export function createOmidBridge(
	player: Player,
	session: OmidSession,
	adDuration: number,
): () => void {
	let active = true;

	// --- Immediate dispatches ---
	session.adEvents.loaded(session.vastProperties);
	session.adEvents.impressionOccurred();
	session.mediaEvents.start(adDuration, player.el.muted ? 0 : player.el.volume);

	// --- Quartile tracking ---
	const trackQuartile = createQuartileTracker(adDuration, (event) => {
		if (!active) return;
		if (event === "firstQuartile") session.mediaEvents.firstQuartile();
		else if (event === "midpoint") session.mediaEvents.midpoint();
		else if (event === "thirdQuartile") session.mediaEvents.thirdQuartile();
		// 'start' and 'complete' are dispatched separately
	});

	// --- Player event handlers ---

	function onTimeUpdate(data: { currentTime: number }): void {
		if (!active) return;
		trackQuartile(data.currentTime);
	}

	function onStateChange(data: {
		from: PlayerState;
		to: PlayerState;
	}): void {
		if (!active) return;

		if (data.to === "ad:paused") {
			session.mediaEvents.pause();
		} else if (data.to === "ad:playing" && data.from === "ad:paused") {
			session.mediaEvents.resume();
		}
	}

	function onAdEnd(): void {
		if (!active) return;
		active = false;
		session.mediaEvents.complete();
		session.finish();
	}

	function onAdSkip(): void {
		if (!active) return;
		active = false;
		session.mediaEvents.skipped();
		session.finish();
	}

	function onAdError(): void {
		if (!active) return;
		active = false;
		session.error("Ad playback error");
		session.finish();
	}

	function onDestroy(): void {
		if (!active) return;
		active = false;
		session.finish();
	}

	// --- HTMLVideoElement direct listeners ---

	function onVolumeChange(): void {
		if (!active) return;
		session.mediaEvents.volumeChange(player.el.muted ? 0 : player.el.volume);
	}

	function onFullscreenChange(): void {
		if (!active) return;
		const state: OmidVideoPlayerState = document.fullscreenElement
			? "fullscreen"
			: "normal";
		session.mediaEvents.playerStateChange(state);
	}

	// --- Subscribe ---
	player.on("timeupdate", onTimeUpdate);
	player.on("statechange", onStateChange);
	player.on("ad:end", onAdEnd);
	player.on("ad:skip", onAdSkip);
	player.on("ad:error", onAdError);
	player.on("destroy", onDestroy);
	player.el.addEventListener("volumechange", onVolumeChange);
	document.addEventListener("fullscreenchange", onFullscreenChange);

	// --- Cleanup ---
	return () => {
		active = false;
		player.off("timeupdate", onTimeUpdate);
		player.off("statechange", onStateChange);
		player.off("ad:end", onAdEnd);
		player.off("ad:skip", onAdSkip);
		player.off("ad:error", onAdError);
		player.off("destroy", onDestroy);
		player.el.removeEventListener("volumechange", onVolumeChange);
		document.removeEventListener("fullscreenchange", onFullscreenChange);
	};
}
