import type { AdUIState, AdUIStateRef } from "./types.js";

/** Format seconds as M:SS or H:MM:SS. Returns "0:00" for NaN/negative. */
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

/** Create a DOM element with a class name. */
export function el<K extends keyof HTMLElementTagNameMap>(
	tag: K,
	className: string,
): HTMLElementTagNameMap[K] {
	const element = document.createElement(tag);
	element.className = className;
	return element;
}

/** Create a shared mutable holder for ad UI state. */
export function createAdUIState(): AdUIStateRef {
	const ref: AdUIStateRef = {
		current: null,
		set(state: AdUIState) {
			ref.current = state;
		},
		clear() {
			ref.current = null;
		},
	};
	return ref;
}
