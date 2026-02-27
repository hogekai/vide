import type { UIComponent } from "../types.js";
import { el } from "../utils.js";

export function createFullscreen(): UIComponent {
	let button: HTMLButtonElement | null = null;
	let container: HTMLElement | null = null;

	function isFullscreen(): boolean {
		return document.fullscreenElement != null;
	}

	function onClick(): void {
		if (!container) return;
		if (isFullscreen()) {
			document.exitFullscreen().catch(() => {});
		} else {
			container.requestFullscreen().catch(() => {});
		}
	}

	function onFullscreenChange(): void {
		if (!button) return;
		if (isFullscreen()) {
			button.classList.add("vide-fullscreen--active");
			button.setAttribute("aria-label", "Exit fullscreen");
		} else {
			button.classList.remove("vide-fullscreen--active");
			button.setAttribute("aria-label", "Fullscreen");
		}
	}

	return {
		mount(c: HTMLElement): void {
			container = c;
			button = el("button", "vide-fullscreen");
			button.type = "button";
			button.setAttribute("aria-label", "Fullscreen");
			c.appendChild(button);
		},
		connect(): void {
			if (!button) return;
			button.addEventListener("click", onClick);
			document.addEventListener("fullscreenchange", onFullscreenChange);
		},
		destroy(): void {
			if (button) {
				button.removeEventListener("click", onClick);
				button.remove();
				button = null;
			}
			document.removeEventListener("fullscreenchange", onFullscreenChange);
			container = null;
		},
	};
}
