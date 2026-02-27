import type { Player, PlayerState } from "../types.js";

/** Convert a PlayerState to a CSS modifier class on the vide-ui root. */
export function stateToClass(state: PlayerState): string {
	return `vide-ui--${state.replace(":", "-")}`;
}

/** Whether the given state is an ad state. */
export function isAdState(state: PlayerState): boolean {
	return (
		state === "ad:loading" || state === "ad:playing" || state === "ad:paused"
	);
}

/**
 * Subscribe to statechange and toggle CSS modifier classes on the root element.
 * Returns a cleanup function.
 */
export function connectStateClasses(
	root: HTMLElement,
	player: Player,
): () => void {
	root.classList.add(stateToClass(player.state));

	function onStateChange({
		from,
		to,
	}: { from: PlayerState; to: PlayerState }): void {
		root.classList.remove(stateToClass(from));
		root.classList.add(stateToClass(to));
	}

	player.on("statechange", onStateChange);
	return () => player.off("statechange", onStateChange);
}
