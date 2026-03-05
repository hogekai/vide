import type { MediaElement, PlayerState } from "./types.js";

export const transitions: Record<PlayerState, PlayerState[]> = {
	idle: ["loading", "playing", "error"],
	loading: ["ready", "playing", "error"],
	ready: ["playing", "loading", "ad:loading", "ended", "error"],
	playing: ["paused", "buffering", "loading", "ad:loading", "ended", "error"],
	paused: ["playing", "loading", "ad:loading", "ended", "error"],
	buffering: ["playing", "loading", "error"],
	"ad:loading": ["ad:playing", "playing", "error"],
	"ad:playing": ["ad:paused", "ad:loading", "playing", "error"],
	"ad:paused": ["ad:playing", "ad:loading", "playing", "error"],
	ended: ["idle", "loading", "ad:loading", "error"],
	error: ["idle", "loading"],
};

export function canTransition(from: PlayerState, to: PlayerState): boolean {
	return transitions[from].includes(to);
}

export function inferInitialState(el: MediaElement): PlayerState {
	if (el.readyState >= 3) {
		if (!el.paused) return "playing";
		return "ready";
	}
	if (el.readyState >= 1) return "loading";
	return "idle";
}

export function isAdState(state: PlayerState): boolean {
	return (
		state === "ad:loading" || state === "ad:playing" || state === "ad:paused"
	);
}
