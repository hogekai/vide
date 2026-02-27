import type { UIComponent } from "../types.js";
import { el } from "../utils.js";

export function createFullscreen(): UIComponent {
	let button: HTMLButtonElement | null = null;
	let fsTarget: HTMLElement | null = null;

	function isFullscreen(): boolean {
		return document.fullscreenElement != null;
	}

	function onClick(): void {
		if (!fsTarget) return;
		if (isFullscreen()) {
			document.exitFullscreen().catch(() => {});
		} else {
			fsTarget.requestFullscreen().catch(() => {});
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
		mount(container: HTMLElement): void {
			// Walk up to find the .vide-ui root (or the container that holds it)
			// for fullscreen target — the mount container is the controls bar
			fsTarget = container.closest(".vide-ui")?.parentElement ?? container;
			button = el("button", "vide-fullscreen");
			button.type = "button";
			button.setAttribute("aria-label", "Fullscreen");
			container.appendChild(button);
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
			fsTarget = null;
		},
	};
}
