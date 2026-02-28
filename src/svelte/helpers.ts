/**
 * Inlined utilities and re-exports for the Svelte integration.
 *
 * svelte-package copies .svelte and .svelte.ts files as-is, preserving their
 * import specifiers.  Cross-entry imports like "../ui/state.js" break at
 * runtime because tsup bundles those source files into entry-point index files.
 *
 * This module re-exports what the Svelte layer needs from the bundled core
 * entry ("../index.js") and inlines the tiny UI helpers so that no Svelte
 * source file imports across entry-point boundaries.
 */

// ── Re-exports from the bundled core entry point ─────────────────────
export { createPlayer } from "../index.js";
export type {
	EventHandler,
	MediaElement,
	Player,
	PlayerEvent,
	PlayerEventMap,
	PlayerState,
	Plugin,
} from "../index.js";

// ── Inlined from src/ui/state.ts ─────────────────────────────────────
import type { PlayerState } from "../index.js";

export function stateToClass(state: PlayerState): string {
	return `vide-ui--${state.replace(":", "-")}`;
}

export function isAdState(state: PlayerState): boolean {
	return (
		state === "ad:loading" || state === "ad:playing" || state === "ad:paused"
	);
}

// ── Inlined from src/ui/utils.ts ─────────────────────────────────────

export function formatTime(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	const s = Math.floor(seconds);
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const sec = s % 60;
	const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
	const ss = String(sec).padStart(2, "0");
	return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
