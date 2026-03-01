import type { Player } from "../../types.js";
import type { UIComponent } from "../types.js";
import { el } from "../utils.js";

export function createErrorDisplay(): UIComponent {
	let root: HTMLDivElement | null = null;
	let messageEl: HTMLSpanElement | null = null;
	let player: Player | null = null;

	function onError({ message }: { code: number; message: string }): void {
		if (messageEl) messageEl.textContent = message;
	}

	return {
		mount(container: HTMLElement): void {
			root = el("div", "vide-error");
			root.setAttribute("role", "alert");
			messageEl = el("span", "vide-error__message");
			root.appendChild(messageEl);
			container.appendChild(root);
		},
		connect(p: Player): void {
			player = p;
			player.on("error", onError);
		},
		destroy(): void {
			if (root) {
				root.remove();
				root = null;
				messageEl = null;
			}
			if (player) {
				player.off("error", onError);
				player = null;
			}
		},
	};
}
