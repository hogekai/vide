import { type RefObject, useEffect, useRef } from "react";
import type { Player, PlayerState } from "../types.js";
import { isAdState } from "../ui/state.js";

const IDLE_DELAY = 3000;

export function useAutohide(
	containerRef: RefObject<HTMLElement | null>,
	player: Player | null,
): void {
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		const root = containerRef.current;
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
			root!.classList.remove("vide-ui--autohide");
		}

		function clearTimer(): void {
			if (timerRef.current !== null) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		}

		function startTimer(): void {
			clearTimer();
			if (shouldStayVisible()) return;
			timerRef.current = setTimeout(() => {
				root!.classList.add("vide-ui--autohide");
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
	}, [containerRef, player]);
}
