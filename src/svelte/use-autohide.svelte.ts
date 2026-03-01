import type { PlayerGetter } from "./context.js";
import { isAdState } from "./helpers.js";
import type { PlayerState } from "./helpers.js";

const IDLE_DELAY = 3000;

export function useAutohide(
	getContainer: () => HTMLElement | null,
	getPlayer: PlayerGetter,
): void {
	let timer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		const root = getContainer();
		const player = getPlayer();
		if (!root || !player) return;

		function shouldStayVisible(): boolean {
			if (!player) return true;
			const s = player.state;
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
		player.on("statechange", onStateChange);
		startTimer();

		return () => {
			clearTimer();
			root.removeEventListener("mousemove", onActivity);
			root.removeEventListener("touchstart", onActivity);
			root.removeEventListener("keydown", onActivity);
			root.classList.remove("vide-ui--autohide");
			player.off("statechange", onStateChange);
		};
	});
}
