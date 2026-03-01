import { type RefObject, useEffect } from "react";
import type { Player } from "../types.js";
import { isAdState } from "../ui/state.js";

export interface UseKeyboardOptions {
	disableSeek?: boolean;
	disableVolume?: boolean;
	disableFullscreen?: boolean;
}

export function useKeyboard(
	containerRef: RefObject<HTMLElement | null>,
	player: Player | null,
	options: UseKeyboardOptions = {},
): void {
	useEffect(() => {
		const root = containerRef.current;
		if (!root || !player) return;

		root.setAttribute("tabindex", "0");

		function onKeyDown(e: KeyboardEvent): void {
			if (!player) return;

			const hasSeek = !options.disableSeek;
			const hasVolume = !options.disableVolume;
			const hasFullscreen = !options.disableFullscreen;
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
					if (!hasSeek || inAd) return;
					e.preventDefault();
					player.currentTime = Math.max(0, player.el.currentTime - 5);
					break;

				case "ArrowRight":
					if (!hasSeek || inAd) return;
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
						const target =
							(root?.closest(".vide-ui") as HTMLElement | null) ?? root;
						target?.requestFullscreen().catch(() => {});
					}
					break;

				default:
					if (
						e.key.length === 1 &&
						e.key >= "0" &&
						e.key <= "9" &&
						hasSeek &&
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

		root.addEventListener("keydown", onKeyDown);

		return () => {
			root.removeEventListener("keydown", onKeyDown);
			root.removeAttribute("tabindex");
		};
	}, [
		containerRef,
		player,
		options.disableSeek,
		options.disableVolume,
		options.disableFullscreen,
	]);
}
