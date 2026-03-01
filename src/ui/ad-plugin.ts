import type { Player } from "../types.js";
import type { AdPlugin, VastAd } from "../vast/types.js";
import type { AdUIStateRef } from "./types.js";

/** Create an AdPlugin that bridges VAST ad data into the UI's shared ad state. */
export function uiAdPlugin(stateRef: AdUIStateRef): AdPlugin {
	return {
		name: "ui-ad",
		setup(_player: Player, ad: VastAd): (() => void) | undefined {
			const linear = ad.creatives.find((c) => c.linear)?.linear;
			if (!linear) return;

			stateRef.set({
				adId: ad.id,
				skipOffset: linear.skipOffset,
				clickThrough: linear.clickThrough,
				duration: linear.duration,
				adTitle: ad.adTitle,
			});

			return () => {
				stateRef.clear();
			};
		},
	};
}
