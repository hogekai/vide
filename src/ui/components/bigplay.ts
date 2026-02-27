import type { Player } from "../../types.js";
import { iconPlay } from "../icons.js";
import type { UIComponent } from "../types.js";
import { el } from "../utils.js";

export function createBigPlay(): UIComponent {
	let button: HTMLButtonElement | null = null;
	let player: Player | null = null;

	function onClick(): void {
		if (!player) return;
		if (player.state === "ended") {
			// ended can only transition to idle/loading, not playing directly.
			// Re-load triggers loadstart → loading → ready, then we auto-play.
			function onReady({ to }: { from: string; to: string }): void {
				if (to === "ready") {
					player?.off("statechange", onReady);
					player?.play().catch(() => {});
				}
			}
			player.on("statechange", onReady);
			player.el.currentTime = 0;
			player.el.load();
			return;
		}
		player.play().catch(() => {});
	}

	return {
		mount(container: HTMLElement): void {
			button = el("button", "vide-bigplay");
			button.type = "button";
			button.setAttribute("aria-label", "Play video");
			button.appendChild(iconPlay());
			container.appendChild(button);
		},
		connect(p: Player): void {
			player = p;
			if (!button) return;
			button.addEventListener("click", onClick);
		},
		destroy(): void {
			if (button) {
				button.removeEventListener("click", onClick);
				button.remove();
				button = null;
			}
			player = null;
		},
	};
}
