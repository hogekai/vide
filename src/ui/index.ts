import type { Player, Plugin } from "../types.js";
import type { AdPlugin, VastAd } from "../vast/types.js";
import { uiAdPlugin } from "./ad-plugin.js";
import { createAdCountdown } from "./components/ad-countdown.js";
import { createAdLabel } from "./components/ad-label.js";
import { createAdOverlay } from "./components/ad-overlay.js";
import { createAdSkip } from "./components/ad-skip.js";
import { createAutohide } from "./components/autohide.js";
import { createBigPlay } from "./components/bigplay.js";
import { createClickPlay } from "./components/clickplay.js";
import { createErrorDisplay } from "./components/error.js";
import { createFullscreen } from "./components/fullscreen.js";
import { createKeyboard } from "./components/keyboard.js";
import { createLoader } from "./components/loader.js";
import { createPlayButton } from "./components/play.js";
import { createPoster } from "./components/poster.js";
import { createProgress } from "./components/progress.js";
import { createTimeDisplay } from "./components/time.js";
import { createVolume } from "./components/volume.js";
import { connectStateClasses } from "./state.js";
import type { UIComponent, UIComponentName, UiPluginOptions } from "./types.js";
import { createAdUIState } from "./utils.js";

export type {
	UIComponent,
	UIComponentName,
	UiPluginOptions,
	AdUIState,
	AdUIStateRef,
} from "./types.js";

export {
	createPlayButton,
	createProgress,
	createTimeDisplay,
	createVolume,
	createFullscreen,
	createLoader,
	createErrorDisplay,
	createBigPlay,
	createPoster,
	createAdCountdown,
	createAdSkip,
	createAdOverlay,
	createAdLabel,
	createKeyboard,
	createClickPlay,
	createAutohide,
};

export { connectStateClasses, stateToClass, isAdState } from "./state.js";
export { formatTime, createAdUIState } from "./utils.js";
export { uiAdPlugin } from "./ad-plugin.js";

/** UI plugin return type, with getAdPlugin() for VAST/VMAP integration. */
export interface UiPlugin extends Plugin {
	/** Returns an adPlugins callback for use with vast() or vmap() options. */
	getAdPlugin(): (ad: VastAd) => AdPlugin[];
}

function mountAndConnect(
	comp: UIComponent,
	container: HTMLElement,
	player: Player,
): void {
	comp.mount(container);
	comp.connect(player);
}

/** Create the UI convenience plugin. Mounts all components (minus excluded). */
export function ui(options: UiPluginOptions): UiPlugin {
	const adUIStateRef = createAdUIState();
	const excluded = new Set<UIComponentName>(options.exclude);

	return {
		name: "ui",
		setup(player: Player): () => void {
			const root = document.createElement("div");
			root.className = "vide-ui";
			root.setAttribute("role", "region");
			root.setAttribute("aria-label", "Video player");
			options.container.appendChild(root);

			const all: UIComponent[] = [];

			function add(
				name: UIComponentName,
				comp: UIComponent,
				container: HTMLElement,
			): void {
				if (excluded.has(name)) return;
				mountAndConnect(comp, container, player);
				all.push(comp);
			}

			// State overlays → mount into root
			add("loader", createLoader(), root);
			add("error", createErrorDisplay(), root);
			add("bigplay", createBigPlay(), root);
			if (options.poster) {
				add("poster", createPoster({ src: options.poster }), root);
			}

			// Click-to-play overlay
			add("clickplay", createClickPlay(excluded), root);

			// Ad layer
			const hasAnyAd =
				!excluded.has("ad-overlay") ||
				!excluded.has("ad-label") ||
				!excluded.has("ad-countdown") ||
				!excluded.has("ad-skip");

			if (hasAnyAd) {
				const adContainer = document.createElement("div");
				adContainer.className = "vide-ad";
				root.appendChild(adContainer);

				add("ad-overlay", createAdOverlay(), adContainer);
				add("ad-label", createAdLabel(), adContainer);
				add("ad-countdown", createAdCountdown(adUIStateRef), adContainer);
				add("ad-skip", createAdSkip(adUIStateRef), adContainer);
			}

			// Controls bar
			const controls = document.createElement("div");
			controls.className = "vide-controls";
			controls.addEventListener("click", (e) => e.stopPropagation());
			root.appendChild(controls);

			add("play", createPlayButton(), controls);
			add("progress", createProgress(), controls);
			add("time", createTimeDisplay(), controls);
			add("volume", createVolume(), controls);
			add("fullscreen", createFullscreen(), controls);

			// Behavioral components
			add("autohide", createAutohide(), root);
			add("keyboard", createKeyboard({ excluded }), root);

			const stateCleanup = connectStateClasses(root, player);

			return () => {
				for (const comp of all) comp.destroy();
				stateCleanup();
				root.remove();
			};
		},
		getAdPlugin(): (ad: VastAd) => AdPlugin[] {
			return () => [uiAdPlugin(adUIStateRef)];
		},
	};
}
