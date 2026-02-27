import type { Player } from "../../types.js";
import { isAdState } from "../state.js";
import type { UIComponent, UIComponentName } from "../types.js";

export interface KeyboardConfig {
	excluded: Set<UIComponentName>;
}

export function createKeyboard(config: KeyboardConfig): UIComponent {
	let root: HTMLElement | null = null;
	let player: Player | null = null;
	const { excluded } = config;

	function onKeyDown(e: KeyboardEvent): void {
		if (!player) return;

		const hasVolume = !excluded.has("volume");
		const hasProgress = !excluded.has("progress");
		const hasFullscreen = !excluded.has("fullscreen");
		const inAd = isAdState(player.state);

		switch (e.key) {
			case " ":
			case "k":
			case "K":
				e.preventDefault();
				if (player.state === "playing" || player.state === "ad:playing") {
					player.pause();
				} else {
					player.play().catch(() => {});
				}
				break;

			case "ArrowLeft":
				if (!hasProgress || inAd) return;
				e.preventDefault();
				player.currentTime = Math.max(0, player.el.currentTime - 5);
				break;

			case "ArrowRight":
				if (!hasProgress || inAd) return;
				e.preventDefault();
				player.currentTime = Math.min(
					player.el.duration || 0,
					player.el.currentTime + 5,
				);
				break;

			case "ArrowUp":
				if (!hasVolume) return;
				e.preventDefault();
				player.volume = Math.min(1, player.volume + 0.1);
				if (player.muted) player.muted = false;
				break;

			case "ArrowDown":
				if (!hasVolume) return;
				e.preventDefault();
				player.volume = Math.max(0, player.volume - 0.1);
				break;

			case "m":
			case "M":
				if (!hasVolume) return;
				e.preventDefault();
				player.muted = !player.muted;
				break;

			case "f":
			case "F":
				if (!hasFullscreen) return;
				e.preventDefault();
				if (document.fullscreenElement != null) {
					document.exitFullscreen().catch(() => {});
				} else {
					const target = root?.closest(".vide-ui")?.parentElement ?? root;
					if (target?.requestFullscreen) {
						target.requestFullscreen().catch(() => {});
					}
				}
				break;

			default:
				// 0-9 percentage seek
				if (
					e.key.length === 1 &&
					e.key >= "0" &&
					e.key <= "9" &&
					hasProgress &&
					!inAd
				) {
					e.preventDefault();
					const pct = Number.parseInt(e.key, 10) / 10;
					const duration = player.el.duration;
					if (Number.isFinite(duration) && duration > 0) {
						player.currentTime = pct * duration;
					}
				}
				break;
		}
	}

	return {
		mount(container: HTMLElement): void {
			root = container.closest(".vide-ui") ?? container;
			root.setAttribute("tabindex", "0");
		},
		connect(p: Player): void {
			player = p;
			if (!root) return;
			root.addEventListener("keydown", onKeyDown);
		},
		destroy(): void {
			if (root) {
				root.removeEventListener("keydown", onKeyDown);
				root.removeAttribute("tabindex");
				root = null;
			}
			player = null;
		},
	};
}
