import type { Player, PlayerState } from "../../types.js";
import { iconSkipForward } from "../icons.js";
import { isAdState } from "../state.js";
import type { AdUIStateRef, UIComponent } from "../types.js";
import { el } from "../utils.js";

export function createAdSkip(adState: AdUIStateRef): UIComponent {
	let button: HTMLButtonElement | null = null;
	let label: HTMLSpanElement | null = null;
	let player: Player | null = null;

	function onClick(): void {
		if (!player || !adState.current) return;
		if (button?.classList.contains("vide-skip--disabled")) return;
		player.emit("ad:skip", { adId: adState.current.adId });
	}

	function onTimeUpdate(): void {
		if (!button || !label || !player || !isAdState(player.state)) return;

		// Hide button entirely if no ad data or ad is non-skippable
		if (!adState.current || adState.current.skipOffset === undefined) {
			button.style.display = "none";
			return;
		}

		button.style.display = "";
		const { skipOffset } = adState.current;
		const current = player.el.currentTime;
		if (current >= skipOffset) {
			button.classList.remove("vide-skip--disabled");
			label.textContent = "Skip Ad";
		} else {
			button.classList.add("vide-skip--disabled");
			const remaining = Math.max(0, Math.ceil(skipOffset - current));
			label.textContent = `Skip in ${remaining}s`;
		}
	}

	function onStateChange({ to }: { from: PlayerState; to: PlayerState }): void {
		if (!button || !label) return;
		// Reset button when leaving ad state
		if (!isAdState(to)) {
			button.style.display = "none";
			button.classList.add("vide-skip--disabled");
			label.textContent = "";
		}
	}

	return {
		mount(container: HTMLElement): void {
			button = el("button", "vide-skip vide-skip--disabled");
			button.type = "button";
			button.setAttribute("aria-label", "Skip ad");
			button.style.display = "none";
			label = el("span", "vide-skip__label");
			button.appendChild(label);
			button.appendChild(iconSkipForward());
			container.appendChild(button);
		},
		connect(p: Player): void {
			player = p;
			if (!button) return;
			button.addEventListener("click", onClick);
			player.on("timeupdate", onTimeUpdate);
			player.on("statechange", onStateChange);
		},
		destroy(): void {
			if (button) {
				button.removeEventListener("click", onClick);
				button.remove();
				button = null;
				label = null;
			}
			if (player) {
				player.off("timeupdate", onTimeUpdate);
				player.off("statechange", onStateChange);
				player = null;
			}
		},
	};
}
