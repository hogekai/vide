import type { Player } from "../../types.js";
import { isAdState } from "../state.js";
import type { AdUIStateRef, UIComponent } from "../types.js";
import { el } from "../utils.js";

export function createAdCountdown(adState: AdUIStateRef): UIComponent {
	let root: HTMLDivElement | null = null;
	let player: Player | null = null;

	function onTimeUpdate(): void {
		if (!root || !player || !isAdState(player.state)) return;

		const duration =
			adState.current?.duration ??
			(Number.isFinite(player.el.duration) ? player.el.duration : 0);
		const current = player.el.currentTime;
		const remaining = Math.max(0, Math.ceil(duration - current));
		root.textContent = `${remaining}s`;
	}

	return {
		mount(container: HTMLElement): void {
			root = el("div", "vide-ad-countdown");
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
			}
			if (player) {
				player.off("timeupdate", onTimeUpdate);
				player = null;
			}
		},
	};
}
