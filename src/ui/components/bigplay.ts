import type { Player } from "../../types.js";
import type { UIComponent } from "../types.js";
import { el } from "../utils.js";

export function createBigPlay(): UIComponent {
	let button: HTMLButtonElement | null = null;
	let player: Player | null = null;

	function onClick(): void {
		if (!player) return;
		if (player.state === "ended") {
			player.currentTime = 0;
		}
		player.play().catch(() => {});
	}

	return {
		mount(container: HTMLElement): void {
			button = el("button", "vide-bigplay");
			button.type = "button";
			button.setAttribute("aria-label", "Play video");
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
