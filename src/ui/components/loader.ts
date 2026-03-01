import type { Player } from "../../types.js";
import type { UIComponent } from "../types.js";
import { el } from "../utils.js";

export function createLoader(): UIComponent {
	let root: HTMLDivElement | null = null;

	return {
		mount(container: HTMLElement): void {
			root = el("div", "vide-loader");
			root.setAttribute("role", "status");
			root.setAttribute("aria-label", "Loading");
			const spinner = el("div", "vide-loader__spinner");
			root.appendChild(spinner);
			container.appendChild(root);
		},
		connect(_player: Player): void {
			// Visibility is CSS-driven via vide-ui--loading / vide-ui--buffering
		},
		destroy(): void {
			if (root) {
				root.remove();
				root = null;
			}
		},
	};
}
