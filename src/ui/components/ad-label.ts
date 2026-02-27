import type { Player } from "../../types.js";
import type { UIComponent } from "../types.js";
import { el } from "../utils.js";

export function createAdLabel(): UIComponent {
	let root: HTMLDivElement | null = null;

	return {
		mount(container: HTMLElement): void {
			root = el("div", "vide-ad-label");
			root.textContent = "Ad";
			container.appendChild(root);
		},
		connect(_player: Player): void {
			// Visibility is CSS-driven via vide-ui--ad-* state classes
		},
		destroy(): void {
			if (root) {
				root.remove();
				root = null;
			}
		},
	};
}
