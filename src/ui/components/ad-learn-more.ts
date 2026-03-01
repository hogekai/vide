import type { Player } from "../../types.js";
import { iconExternalLink } from "../icons.js";
import type { AdUIStateRef, UIComponent } from "../types.js";
import { el } from "../utils.js";

function hostname(url: string): string {
	try {
		return new URL(url).hostname;
	} catch {
		return url;
	}
}

export function createAdLearnMore(adState: AdUIStateRef): UIComponent {
	let root: HTMLButtonElement | null = null;
	let titleEl: HTMLSpanElement | null = null;
	let urlEl: HTMLSpanElement | null = null;
	let player: Player | null = null;

	function onClick(): void {
		if (!player) return;
		const url = adState.current?.clickThrough;
		if (!url) return;
		// Forward click to video element so VAST plugin fires ad:click tracking
		player.el.click();
		window.open(url, "_blank");
		player.el.pause();
	}

	function update(): void {
		if (!root) return;
		const state = adState.current;
		const url = state?.clickThrough;

		// Hide entirely when no clickThrough
		root.style.display = url ? "" : "none";

		if (titleEl) {
			titleEl.textContent = state?.adTitle ?? "";
			titleEl.style.display = state?.adTitle ? "" : "none";
		}
		if (urlEl) {
			urlEl.textContent = url ? hostname(url) : "";
		}
	}

	return {
		mount(container: HTMLElement): void {
			root = el("button", "vide-ad-cta");
			root.type = "button";

			const icon = el("span", "vide-ad-cta__icon");
			icon.appendChild(iconExternalLink());
			root.appendChild(icon);

			const body = el("span", "vide-ad-cta__body");

			titleEl = el("span", "vide-ad-cta__title");
			titleEl.style.display = "none";
			body.appendChild(titleEl);

			urlEl = el("span", "vide-ad-cta__url");
			body.appendChild(urlEl);

			root.appendChild(body);
			container.appendChild(root);

			// Hidden by default until ad state arrives
			root.style.display = "none";
		},
		connect(p: Player): void {
			player = p;
			if (!root) return;
			root.addEventListener("click", onClick);

			p.on("ad:start", update);
			p.on("ad:end", update);
			p.on("ad:skip", update);
			update();
		},
		destroy(): void {
			if (root) {
				root.removeEventListener("click", onClick);
				root.remove();
				root = null;
			}
			if (player) {
				player.off("ad:start", update);
				player.off("ad:end", update);
				player.off("ad:skip", update);
			}
			player = null;
			titleEl = null;
			urlEl = null;
		},
	};
}
