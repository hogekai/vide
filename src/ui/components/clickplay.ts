import type { Player } from "../../types.js";
import { isAdState } from "../state.js";
import type { UIComponent, UIComponentName } from "../types.js";
import { el } from "../utils.js";

const DBLCLICK_DELAY = 200;

export function createClickPlay(excluded: Set<UIComponentName>): UIComponent {
	let root: HTMLDivElement | null = null;
	let player: Player | null = null;
	let clickTimer: ReturnType<typeof setTimeout> | null = null;
	let fsTarget: HTMLElement | null = null;

	function togglePlay(): void {
		if (!player) return;
		if (player.state === "playing" || player.state === "ad:playing") {
			player.pause();
		} else {
			player.play().catch(() => {});
		}
	}

	function toggleFullscreen(): void {
		if (!fsTarget || excluded.has("fullscreen")) return;
		if (document.fullscreenElement != null) {
			document.exitFullscreen().catch(() => {});
		} else if (fsTarget.requestFullscreen) {
			fsTarget.requestFullscreen().catch(() => {});
		}
	}

	function onClick(): void {
		if (!player) return;

		// During ad states, just toggle play/pause (no ad:click — that's for CTA/overlay)
		if (isAdState(player.state)) {
			togglePlay();
			return;
		}

		// Distinguish single click from double click
		if (clickTimer !== null) {
			// Second click within DBLCLICK_DELAY → double click
			clearTimeout(clickTimer);
			clickTimer = null;
			toggleFullscreen();
			return;
		}

		clickTimer = setTimeout(() => {
			clickTimer = null;
			togglePlay();
		}, DBLCLICK_DELAY);
	}

	return {
		mount(container: HTMLElement): void {
			root = el("div", "vide-clickplay");
			root.setAttribute("role", "presentation");
			fsTarget = container.closest(".vide-ui")?.parentElement ?? container;
			container.appendChild(root);
		},
		connect(p: Player): void {
			player = p;
			if (!root) return;
			root.addEventListener("click", onClick);
		},
		destroy(): void {
			if (clickTimer !== null) {
				clearTimeout(clickTimer);
				clickTimer = null;
			}
			if (root) {
				root.removeEventListener("click", onClick);
				root.remove();
				root = null;
			}
			player = null;
			fsTarget = null;
		},
	};
}
