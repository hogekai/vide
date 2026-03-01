import { type Ref, type ShallowRef, onScopeDispose, watch } from "vue";
import type { Player, PlayerState } from "../types.js";
import { isAdState } from "../ui/state.js";

const IDLE_DELAY = 3000;

export function useAutohide(
	containerRef: Ref<HTMLElement | null>,
	player: ShallowRef<Player | null>,
): void {
	let timer: ReturnType<typeof setTimeout> | null = null;
	let cleanup: (() => void) | undefined;

	watch(
		[containerRef, player],
		([root, p]) => {
			cleanup?.();
			cleanup = undefined;
			if (!root || !p) return;

			function shouldStayVisible(): boolean {
				if (!p) return true;
				const s = p.state;
				return (
					s === "paused" ||
					s === "ended" ||
					s === "idle" ||
					s === "ready" ||
					isAdState(s)
				);
			}

			function showControls(): void {
				root?.classList.remove("vide-ui--autohide");
			}

			function clearTimer(): void {
				if (timer !== null) {
					clearTimeout(timer);
					timer = null;
				}
			}

			function startTimer(): void {
				clearTimer();
				if (shouldStayVisible()) return;
				timer = setTimeout(() => {
					root?.classList.add("vide-ui--autohide");
				}, IDLE_DELAY);
			}

			function onActivity(): void {
				showControls();
				startTimer();
			}

			function onStateChange({
				to,
			}: { from: PlayerState; to: PlayerState }): void {
				if (
					to === "paused" ||
					to === "ended" ||
					to === "idle" ||
					to === "ready" ||
					isAdState(to)
				) {
					clearTimer();
					showControls();
				} else {
					startTimer();
				}
			}

			root.addEventListener("mousemove", onActivity);
			root.addEventListener("touchstart", onActivity);
			root.addEventListener("keydown", onActivity);
			p.on("statechange", onStateChange);
			startTimer();

			cleanup = () => {
				clearTimer();
				root.removeEventListener("mousemove", onActivity);
				root.removeEventListener("touchstart", onActivity);
				root.removeEventListener("keydown", onActivity);
				root.classList.remove("vide-ui--autohide");
				p.off("statechange", onStateChange);
			};
		},
		{ immediate: true },
	);

	onScopeDispose(() => {
		cleanup?.();
	});
}
