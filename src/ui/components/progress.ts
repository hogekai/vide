import type { Player, PlayerState } from "../../types.js";
import { isAdState } from "../state.js";
import type { UIComponent } from "../types.js";
import { el } from "../utils.js";

export function createProgress(): UIComponent {
	let root: HTMLDivElement | null = null;
	let bar: HTMLDivElement | null = null;
	let buffered: HTMLDivElement | null = null;
	let handle: HTMLDivElement | null = null;
	let player: Player | null = null;
	let dragging = false;

	function getRatio(e: PointerEvent): number {
		if (!root) return 0;
		const rect = root.getBoundingClientRect();
		if (rect.width === 0) return 0;
		return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
	}

	function updateBar(ratio: number): void {
		if (!root) return;
		root.style.setProperty("--vide-progress", String(ratio));
	}

	function updateBuffered(): void {
		if (!player || !buffered) return;
		const video = player.el;
		if (video.buffered.length > 0 && video.duration > 0) {
			const end = video.buffered.end(video.buffered.length - 1);
			const ratio = end / video.duration;
			buffered.style.setProperty(
				"--vide-progress-buffered",
				String(Math.min(1, ratio)),
			);
		}
	}

	function onTimeUpdate(): void {
		if (dragging || !player) return;
		const { currentTime, duration } = player.el;
		if (duration > 0) {
			updateBar(currentTime / duration);
		}
		updateBuffered();
		if (root) {
			root.setAttribute("aria-valuenow", String(Math.floor(currentTime)));
			if (Number.isFinite(duration)) {
				root.setAttribute("aria-valuemax", String(Math.floor(duration)));
			}
		}
	}

	function onPointerDown(e: PointerEvent): void {
		if (!player || !root || isAdState(player.state)) return;
		dragging = true;
		root.classList.add("vide-progress--dragging");
		root.setPointerCapture(e.pointerId);
		updateBar(getRatio(e));
	}

	function onPointerMove(e: PointerEvent): void {
		if (!dragging) return;
		updateBar(getRatio(e));
	}

	function onPointerUp(e: PointerEvent): void {
		if (!dragging || !player) return;
		dragging = false;
		if (root) {
			root.classList.remove("vide-progress--dragging");
			root.releasePointerCapture(e.pointerId);
		}
		const ratio = getRatio(e);
		const duration = player.el.duration;
		if (Number.isFinite(duration) && duration > 0) {
			player.currentTime = ratio * duration;
		}
	}

	function onStateChange({ to }: { from: PlayerState; to: PlayerState }): void {
		if (!root) return;
		if (isAdState(to)) {
			root.classList.add("vide-progress--disabled");
		} else {
			root.classList.remove("vide-progress--disabled");
		}
	}

	return {
		mount(container: HTMLElement): void {
			root = el("div", "vide-progress");
			root.setAttribute("role", "slider");
			root.setAttribute("aria-label", "Seek");
			root.setAttribute("aria-valuemin", "0");
			root.setAttribute("aria-valuemax", "0");
			root.setAttribute("aria-valuenow", "0");
			buffered = el("div", "vide-progress__buffered");
			bar = el("div", "vide-progress__bar");
			handle = el("div", "vide-progress__handle");
			root.appendChild(buffered);
			root.appendChild(bar);
			root.appendChild(handle);
			container.appendChild(root);
		},
		connect(p: Player): void {
			player = p;
			if (!root) return;
			player.on("timeupdate", onTimeUpdate);
			player.on("statechange", onStateChange);
			root.addEventListener("pointerdown", onPointerDown);
			root.addEventListener("pointermove", onPointerMove);
			root.addEventListener("pointerup", onPointerUp);
		},
		destroy(): void {
			if (root) {
				root.removeEventListener("pointerdown", onPointerDown);
				root.removeEventListener("pointermove", onPointerMove);
				root.removeEventListener("pointerup", onPointerUp);
				root.remove();
				root = null;
				bar = null;
				buffered = null;
				handle = null;
			}
			if (player) {
				player.off("timeupdate", onTimeUpdate);
				player.off("statechange", onStateChange);
				player = null;
			}
		},
	};
}
