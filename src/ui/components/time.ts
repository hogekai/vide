import type { Player } from "../../types.js";
import type { UIComponent } from "../types.js";
import { el, formatTime } from "../utils.js";

export function createTimeDisplay(): UIComponent {
	let root: HTMLDivElement | null = null;
	let currentEl: HTMLSpanElement | null = null;
	let durationEl: HTMLSpanElement | null = null;
	let player: Player | null = null;

	function onTimeUpdate({
		currentTime,
		duration,
	}: { currentTime: number; duration: number }): void {
		if (currentEl) currentEl.textContent = formatTime(currentTime);
		if (durationEl) durationEl.textContent = formatTime(duration);
	}

	return {
		mount(container: HTMLElement): void {
			root = el("div", "vide-time");
			currentEl = el("span", "vide-time__current");
			const sep = el("span", "vide-time__separator");
			durationEl = el("span", "vide-time__duration");
			currentEl.textContent = "0:00";
			sep.textContent = "/";
			durationEl.textContent = "0:00";
			root.appendChild(currentEl);
			root.appendChild(sep);
			root.appendChild(durationEl);
			container.appendChild(root);
		},
		connect(p: Player): void {
			player = p;
			player.on("timeupdate", onTimeUpdate);
		},
		destroy(): void {
			if (root) {
				root.remove();
				root = null;
				currentEl = null;
				durationEl = null;
			}
			if (player) {
				player.off("timeupdate", onTimeUpdate);
				player = null;
			}
		},
	};
}
