import type { Player } from "../../types.js";
import type { UIComponent } from "../types.js";
import { el } from "../utils.js";

export function createAdOverlay(): UIComponent {
	let root: HTMLDivElement | null = null;
	let player: Player | null = null;

	function onClick(): void {
		if (!player) return;
		// Forward click to video element so VAST plugin fires ad:click tracking
		player.el.click();
		// Toggle play/pause on the ad video
		if (player.el.paused) {
			Promise.resolve(player.el.play()).catch(() => {});
		} else {
			player.el.pause();
		}
	}

	return {
		mount(container: HTMLElement): void {
			root = el("div", "vide-ad-overlay");
			container.appendChild(root);
		},
		connect(p: Player): void {
			player = p;
			if (!root) return;
			root.addEventListener("click", onClick);
		},
		destroy(): void {
			if (root) {
				root.removeEventListener("click", onClick);
				root.remove();
				root = null;
			}
			player = null;
		},
	};
}
