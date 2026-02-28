import { iconFullscreenEnter, iconFullscreenExit } from "../icons.js";
import type { UIComponent } from "../types.js";
import { el } from "../utils.js";

export function createFullscreen(): UIComponent {
	let button: HTMLButtonElement | null = null;
	let fsTarget: HTMLElement | null = null;
	let iconEl: SVGSVGElement | null = null;

	function isFullscreen(): boolean {
		return (
			document.fullscreenElement != null ||
			// biome-ignore lint/suspicious/noExplicitAny: webkit vendor prefix
			(document as any).webkitFullscreenElement != null
		);
	}

	function setIcon(active: boolean): void {
		if (!button) return;
		if (iconEl) iconEl.remove();
		iconEl = active ? iconFullscreenExit() : iconFullscreenEnter();
		button.appendChild(iconEl);
	}

	function onClick(): void {
		if (!fsTarget) return;
		if (isFullscreen()) {
			if (typeof document.exitFullscreen === "function") {
				document.exitFullscreen().catch(() => {});
				// biome-ignore lint/suspicious/noExplicitAny: webkit vendor prefix
			} else if (typeof (document as any).webkitExitFullscreen === "function") {
				// biome-ignore lint/suspicious/noExplicitAny: webkit vendor prefix
				(document as any).webkitExitFullscreen();
			}
		} else {
			if (typeof fsTarget.requestFullscreen === "function") {
				fsTarget.requestFullscreen().catch(() => {});
			} else if (
				// biome-ignore lint/suspicious/noExplicitAny: webkit vendor prefix
				typeof (fsTarget as any).webkitRequestFullscreen === "function"
			) {
				// biome-ignore lint/suspicious/noExplicitAny: webkit vendor prefix
				(fsTarget as any).webkitRequestFullscreen();
			} else {
				// biome-ignore lint/suspicious/noExplicitAny: webkit vendor prefix
				const video = fsTarget.querySelector("video") as any;
				video?.webkitEnterFullscreen?.();
			}
		}
	}

	function onFullscreenChange(): void {
		if (!button) return;
		const active = isFullscreen();
		if (active) {
			button.classList.add("vide-fullscreen--active");
			button.setAttribute("aria-label", "Exit fullscreen");
		} else {
			button.classList.remove("vide-fullscreen--active");
			button.setAttribute("aria-label", "Fullscreen");
		}
		setIcon(active);
	}

	return {
		mount(container: HTMLElement): void {
			// Walk up to find the .vide-ui root (or the container that holds it)
			// for fullscreen target — the mount container is the controls bar
			fsTarget = container.closest(".vide-ui")?.parentElement ?? container;
			button = el("button", "vide-fullscreen");
			button.type = "button";
			button.setAttribute("aria-label", "Fullscreen");
			setIcon(false);
			container.appendChild(button);
		},
		connect(): void {
			if (!button) return;
			button.addEventListener("click", onClick);
			document.addEventListener("fullscreenchange", onFullscreenChange);
			document.addEventListener("webkitfullscreenchange", onFullscreenChange);
		},
		destroy(): void {
			if (button) {
				button.removeEventListener("click", onClick);
				button.remove();
				button = null;
				iconEl = null;
			}
			document.removeEventListener("fullscreenchange", onFullscreenChange);
			document.removeEventListener(
				"webkitfullscreenchange",
				onFullscreenChange,
			);
			fsTarget = null;
		},
	};
}
