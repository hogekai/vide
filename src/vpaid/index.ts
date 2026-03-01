import type { Player } from "../types.js";
import type { AdPlugin, VastAd } from "../vast/types.js";
import { loadVpaidScript } from "./loader.js";
import type { VpaidPluginOptions } from "./types.js";
import { createVpaidWrapper } from "./wrapper.js";

export type { VpaidPluginOptions, VpaidAdUnit, VpaidEvent } from "./types.js";

export function vpaid(options: VpaidPluginOptions): AdPlugin {
	return {
		name: "vpaid",
		setup(player: Player, ad: VastAd) {
			const vpaidFile = ad.creatives
				.flatMap((c) => c.linear?.mediaFiles ?? [])
				.find(
					(f) =>
						f.apiFramework === "VPAID" &&
						f.mimeType === "application/javascript",
				);

			if (!vpaidFile) return;

			const linear = ad.creatives.find((c) => c.linear)?.linear;
			if (!linear) return;

			const loadTimeout = options.loadTimeout ?? 10_000;
			const handshakeTimeout = options.handshakeTimeout ?? 5_000;
			const initTimeout = options.initTimeout ?? 8_000;
			const startTimeout = options.startTimeout ?? 5_000;
			const stopTimeout = options.stopTimeout ?? 5_000;
			const useFriendlyIframe = options.useFriendlyIframe ?? true;

			const slot = document.createElement("div");
			slot.style.cssText =
				"position:absolute;top:0;left:0;width:100%;height:100%;display:none;pointer-events:auto;z-index:1;";
			options.container.appendChild(slot);

			const videoSlot = document.createElement("video");
			videoSlot.style.cssText = "width:100%;height:100%;";
			slot.appendChild(videoSlot);

			let wrapper: ReturnType<typeof createVpaidWrapper> | null = null;

			loadVpaidScript(vpaidFile.url, loadTimeout, useFriendlyIframe)
				.then(({ adUnit, destroy: scriptCleanup }) => {
					wrapper = createVpaidWrapper(
						player,
						adUnit,
						{ handshakeTimeout, initTimeout, startTimeout, stopTimeout },
						ad,
						linear,
						slot,
						videoSlot,
						scriptCleanup,
					);
					return wrapper.start();
				})
				.catch((err) => {
					player.emit("ad:error", {
						error: err instanceof Error ? err : new Error(String(err)),
						source: "vpaid",
						vastErrorCode: 901,
					});
					slot.remove();
				});

			return () => {
				if (wrapper) {
					wrapper.destroy();
				} else {
					slot.remove();
				}
			};
		},
	};
}
