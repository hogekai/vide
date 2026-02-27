import type { Player } from "../../types.js";
import { iconVolumeHigh, iconVolumeLow, iconVolumeMute } from "../icons.js";
import type { UIComponent } from "../types.js";
import { el } from "../utils.js";

export function createVolume(): UIComponent {
	let root: HTMLDivElement | null = null;
	let muteBtn: HTMLButtonElement | null = null;
	let slider: HTMLDivElement | null = null;
	let player: Player | null = null;
	let dragging = false;
	let iconEl: SVGSVGElement | null = null;

	function setIcon(): void {
		if (!muteBtn || !player) return;
		if (iconEl) iconEl.remove();
		const muted = player.muted || player.volume === 0;
		if (muted) {
			iconEl = iconVolumeMute();
		} else if (player.volume < 0.5) {
			iconEl = iconVolumeLow();
		} else {
			iconEl = iconVolumeHigh();
		}
		muteBtn.appendChild(iconEl);
	}

	function syncUI(): void {
		if (!player || !root || !muteBtn) return;
		const muted = player.muted || player.volume === 0;
		if (muted) {
			root.classList.add("vide-volume--muted");
			muteBtn.setAttribute("aria-label", "Unmute");
		} else {
			root.classList.remove("vide-volume--muted");
			muteBtn.setAttribute("aria-label", "Mute");
		}
		const vol = player.muted ? 0 : player.volume;
		root.style.setProperty("--vide-volume", String(vol));
		if (slider) {
			slider.setAttribute("aria-valuenow", String(Math.round(vol * 100)));
		}
		setIcon();
	}

	function getRatio(e: PointerEvent): number {
		if (!slider) return 0;
		const rect = slider.getBoundingClientRect();
		if (rect.width === 0) return 0;
		return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
	}

	function onMuteClick(): void {
		if (!player) return;
		player.muted = !player.muted;
	}

	function onVolumeChange(): void {
		if (dragging) return;
		syncUI();
	}

	function onPointerDown(e: PointerEvent): void {
		if (!player || !slider) return;
		dragging = true;
		slider.setPointerCapture(e.pointerId);
		const vol = getRatio(e);
		player.volume = vol;
		if (player.muted && vol > 0) player.muted = false;
		syncUI();
	}

	function onPointerMove(e: PointerEvent): void {
		if (!dragging || !player) return;
		const vol = getRatio(e);
		player.volume = vol;
		if (player.muted && vol > 0) player.muted = false;
		syncUI();
	}

	function onPointerUp(e: PointerEvent): void {
		if (!dragging || !slider) return;
		dragging = false;
		slider.releasePointerCapture(e.pointerId);
	}

	return {
		mount(container: HTMLElement): void {
			root = el("div", "vide-volume");
			muteBtn = el("button", "vide-volume__button");
			muteBtn.type = "button";
			muteBtn.setAttribute("aria-label", "Mute");
			slider = el("div", "vide-volume__slider");
			slider.setAttribute("role", "slider");
			slider.setAttribute("aria-label", "Volume");
			slider.setAttribute("aria-valuemin", "0");
			slider.setAttribute("aria-valuemax", "100");
			slider.setAttribute("aria-valuenow", "100");
			const track = el("div", "vide-volume__track");
			const filled = el("div", "vide-volume__filled");
			slider.appendChild(track);
			slider.appendChild(filled);
			root.appendChild(muteBtn);
			root.appendChild(slider);
			container.appendChild(root);
		},
		connect(p: Player): void {
			player = p;
			if (!muteBtn || !slider) return;
			muteBtn.addEventListener("click", onMuteClick);
			slider.addEventListener("pointerdown", onPointerDown);
			slider.addEventListener("pointermove", onPointerMove);
			slider.addEventListener("pointerup", onPointerUp);
			player.el.addEventListener("volumechange", onVolumeChange);
			syncUI();
		},
		destroy(): void {
			if (muteBtn) muteBtn.removeEventListener("click", onMuteClick);
			if (slider) {
				slider.removeEventListener("pointerdown", onPointerDown);
				slider.removeEventListener("pointermove", onPointerMove);
				slider.removeEventListener("pointerup", onPointerUp);
			}
			if (player) {
				player.el.removeEventListener("volumechange", onVolumeChange);
				player = null;
			}
			if (root) {
				root.remove();
				root = null;
				muteBtn = null;
				slider = null;
				iconEl = null;
			}
		},
	};
}
