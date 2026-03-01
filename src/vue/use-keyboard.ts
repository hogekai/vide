import { type Ref, type ShallowRef, onScopeDispose, watch } from "vue";
import type { Player } from "../types.js";
import { isAdState } from "../ui/state.js";

export interface UseKeyboardOptions {
	disableSeek?: boolean;
	disableVolume?: boolean;
	disableFullscreen?: boolean;
}

export function useKeyboard(
	containerRef: Ref<HTMLElement | null>,
	player: ShallowRef<Player | null>,
	options: UseKeyboardOptions = {},
): void {
	let cleanup: (() => void) | undefined;

	watch(
		[containerRef, player],
		([root, p]) => {
			cleanup?.();
			cleanup = undefined;
			if (!root || !p) return;

			root.setAttribute("tabindex", "0");

			function onKeyDown(e: KeyboardEvent): void {
				if (!p) return;

				const hasSeek = !options.disableSeek;
				const hasVolume = !options.disableVolume;
				const hasFullscreen = !options.disableFullscreen;
				const inAd = isAdState(p.state);

				switch (e.key) {
					case " ":
					case "k":
					case "K":
						e.preventDefault();
						if (p.state === "playing" || p.state === "ad:playing") {
							p.pause();
						} else {
							p.play().catch(() => {});
						}
						break;

					case "ArrowLeft":
						if (!hasSeek || inAd) return;
						e.preventDefault();
						p.currentTime = Math.max(0, p.el.currentTime - 5);
						break;

					case "ArrowRight":
						if (!hasSeek || inAd) return;
						e.preventDefault();
						p.currentTime = Math.min(p.el.duration || 0, p.el.currentTime + 5);
						break;

					case "ArrowUp":
						if (!hasVolume) return;
						e.preventDefault();
						p.volume = Math.min(1, p.volume + 0.1);
						if (p.muted) p.muted = false;
						break;

					case "ArrowDown":
						if (!hasVolume) return;
						e.preventDefault();
						p.volume = Math.max(0, p.volume - 0.1);
						break;

					case "m":
					case "M":
						if (!hasVolume) return;
						e.preventDefault();
						p.muted = !p.muted;
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
							const duration = p.el.duration;
							if (Number.isFinite(duration) && duration > 0) {
								p.currentTime = pct * duration;
							}
						}
						break;
				}
			}

			root.addEventListener("keydown", onKeyDown);

			cleanup = () => {
				root.removeEventListener("keydown", onKeyDown);
				root.removeAttribute("tabindex");
			};
		},
		{ immediate: true },
	);

	onScopeDispose(() => {
		cleanup?.();
	});
}
