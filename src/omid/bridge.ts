import type { AdQuartile, Player, PlayerState } from "../types.js";
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
	// These fire immediately because the OMID bridge initialises asynchronously
	// and may miss PlayerEventMap events that fire before subscription.
	session.adEvents.loaded(session.vastProperties);
	session.adEvents.impressionOccurred();
	session.mediaEvents.start(adDuration, player.el.muted ? 0 : player.el.volume);

	// --- Quartile tracking via PlayerEventMap ---
	function onAdQuartile(data: { adId: string; quartile: AdQuartile }): void {
		if (!active) return;
		if (data.quartile === "firstQuartile") session.mediaEvents.firstQuartile();
		else if (data.quartile === "midpoint") session.mediaEvents.midpoint();
		else if (data.quartile === "thirdQuartile")
			session.mediaEvents.thirdQuartile();
		// 'start' and 'complete' are dispatched separately
	}

	// --- Player event handlers ---

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

	// --- Volume & fullscreen via PlayerEventMap ---

	function onAdVolumeChange(data: { volume: number }): void {
		if (!active) return;
		session.mediaEvents.volumeChange(data.volume);
	}

	function onAdFullscreen(data: { fullscreen: boolean }): void {
		if (!active) return;
		const state: OmidVideoPlayerState = data.fullscreen
			? "fullscreen"
			: "normal";
		session.mediaEvents.playerStateChange(state);
	}

	// --- Subscribe ---
	player.on("ad:quartile", onAdQuartile);
	player.on("statechange", onStateChange);
	player.on("ad:end", onAdEnd);
	player.on("ad:skip", onAdSkip);
	player.on("ad:error", onAdError);
	player.on("destroy", onDestroy);
	player.on("ad:volumeChange", onAdVolumeChange);
	player.on("ad:fullscreen", onAdFullscreen);

	// --- Cleanup ---
	return () => {
		active = false;
		player.off("ad:quartile", onAdQuartile);
		player.off("statechange", onStateChange);
		player.off("ad:end", onAdEnd);
		player.off("ad:skip", onAdSkip);
		player.off("ad:error", onAdError);
		player.off("destroy", onDestroy);
		player.off("ad:volumeChange", onAdVolumeChange);
		player.off("ad:fullscreen", onAdFullscreen);
	};
}
