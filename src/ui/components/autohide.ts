import type { Player, PlayerState } from "../../types.js";
import { isAdState } from "../state.js";
import type { UIComponent } from "../types.js";

const IDLE_DELAY = 3000;

export function createAutohide(): UIComponent {
	let root: HTMLElement | null = null;
	let player: Player | null = null;
	let timer: ReturnType<typeof setTimeout> | null = null;

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
		if (!root) return;
		root.classList.remove("vide-ui--idle");
	}

	function startTimer(): void {
		clearTimer();
		if (shouldStayVisible()) return;
		timer = setTimeout(() => {
			if (root) root.classList.add("vide-ui--idle");
		}, IDLE_DELAY);
	}

	function clearTimer(): void {
		if (timer !== null) {
			clearTimeout(timer);
			timer = null;
		}
	}

	function onActivity(): void {
		showControls();
		startTimer();
	}

	function onStateChange({ to }: { from: PlayerState; to: PlayerState }): void {
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

	return {
		mount(container: HTMLElement): void {
			root = container.closest(".vide-ui") ?? container;
		},
		connect(p: Player): void {
			player = p;
			if (!root) return;
			root.addEventListener("mousemove", onActivity);
			root.addEventListener("touchstart", onActivity);
			root.addEventListener("keydown", onActivity);
			player.on("statechange", onStateChange);
			startTimer();
		},
		destroy(): void {
			clearTimer();
			if (root) {
				root.removeEventListener("mousemove", onActivity);
				root.removeEventListener("touchstart", onActivity);
				root.removeEventListener("keydown", onActivity);
				root.classList.remove("vide-ui--idle");
				root = null;
			}
			if (player) {
				player.off("statechange", onStateChange);
				player = null;
			}
		},
	};
}
