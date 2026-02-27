import type { Player } from "../../types.js";
import { isAdState } from "../state.js";
import type { AdUIStateRef, UIComponent } from "../types.js";
import { el } from "../utils.js";

export function createAdSkip(adState: AdUIStateRef): UIComponent {
	let button: HTMLButtonElement | null = null;
	let player: Player | null = null;

	function onClick(): void {
		if (!player || !adState.current) return;
		if (button?.classList.contains("vide-skip--disabled")) return;
		player.emit("ad:skip", { adId: adState.current.adId });
	}

	function onTimeUpdate(): void {
		if (!button || !player || !isAdState(player.state) || !adState.current)
			return;

		const { skipOffset } = adState.current;
		if (skipOffset === undefined) return;

		const current = player.el.currentTime;
		if (current >= skipOffset) {
			button.classList.remove("vide-skip--disabled");
			button.textContent = "Skip Ad";
		} else {
			button.classList.add("vide-skip--disabled");
			const remaining = Math.max(0, Math.ceil(skipOffset - current));
			button.textContent = `Skip in ${remaining}s`;
		}
	}

	return {
		mount(container: HTMLElement): void {
			button = el("button", "vide-skip vide-skip--disabled");
			button.type = "button";
			button.setAttribute("aria-label", "Skip ad");
			container.appendChild(button);
		},
		connect(p: Player): void {
			player = p;
			if (!button) return;
			button.addEventListener("click", onClick);
			player.on("timeupdate", onTimeUpdate);
		},
		destroy(): void {
			if (button) {
				button.removeEventListener("click", onClick);
				button.remove();
				button = null;
			}
			if (player) {
				player.off("timeupdate", onTimeUpdate);
				player = null;
			}
		},
	};
}
