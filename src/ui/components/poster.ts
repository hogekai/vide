import type { Player } from "../../types.js";
import type { UIComponent } from "../types.js";
import { el } from "../utils.js";

export interface PosterOptions {
	src: string;
}

export function createPoster(options: PosterOptions): UIComponent {
	let root: HTMLDivElement | null = null;

	return {
		mount(container: HTMLElement): void {
			root = el("div", "vide-poster");
			const img = el("img", "vide-poster__image");
			img.src = options.src;
			img.alt = "";
			root.appendChild(img);
			container.appendChild(root);
		},
		connect(_player: Player): void {
			// Visibility is CSS-driven via vide-ui--idle / vide-ui--ready
		},
		destroy(): void {
			if (root) {
				root.remove();
				root = null;
			}
		},
	};
}
