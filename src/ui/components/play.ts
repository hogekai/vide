import type { Player, PlayerState } from "../../types.js";
import { iconPause, iconPlay } from "../icons.js";
import type { UIComponent } from "../types.js";
import { el } from "../utils.js";

export function createPlayButton(): UIComponent {
	let button: HTMLButtonElement | null = null;
	let player: Player | null = null;
	let iconEl: SVGSVGElement | null = null;

	function setIcon(playing: boolean): void {
		if (!button) return;
		if (iconEl) iconEl.remove();
		iconEl = playing ? iconPause() : iconPlay();
		button.appendChild(iconEl);
	}

	function onClick(): void {
		if (!player) return;
		if (player.state === "playing") {
			player.pause();
		} else {
			player.play().catch(() => {});
		}
	}

	function onStateChange({ to }: { from: PlayerState; to: PlayerState }): void {
		if (!button) return;
		if (to === "playing") {
			button.classList.add("vide-play--playing");
			button.classList.remove("vide-play--paused");
			button.setAttribute("aria-label", "Pause");
			setIcon(true);
		} else if (to === "paused" || to === "ready" || to === "ended") {
			button.classList.remove("vide-play--playing");
			button.classList.add("vide-play--paused");
			button.setAttribute("aria-label", "Play");
			setIcon(false);
		}
	}

	return {
		mount(container: HTMLElement): void {
			button = el("button", "vide-play vide-play--paused");
			button.type = "button";
			button.setAttribute("aria-label", "Play");
			setIcon(false);
			container.appendChild(button);
		},
		connect(p: Player): void {
			player = p;
			if (!button) return;
			button.addEventListener("click", onClick);
			player.on("statechange", onStateChange);
		},
		destroy(): void {
			if (button) {
				button.removeEventListener("click", onClick);
				button.remove();
				button = null;
				iconEl = null;
			}
			if (player) {
				player.off("statechange", onStateChange);
				player = null;
			}
		},
	};
}
