import type { AdMeta, PlayerEventMap } from "./helpers.js";
import type { PlayerGetter } from "./context.js";

export interface AdState {
	readonly active: boolean;
	readonly meta: AdMeta | null;
}

export function useAdState(getPlayer: PlayerGetter): AdState {
	let active = $state(false);
	let meta = $state<AdMeta | null>(null);

	$effect(() => {
		const p = getPlayer();
		if (!p) return;

		const onStart = (data: PlayerEventMap["ad:start"]) => {
			active = true;
			meta = {
				adId: data.adId,
				clickThrough: data.clickThrough,
				skipOffset: data.skipOffset,
				duration: data.duration,
				adTitle: data.adTitle,
				adStartTime: Date.now(),
			};
		};

		const onEnd = () => {
			active = false;
			meta = null;
		};

		p.on("ad:start", onStart);
		p.on("ad:end", onEnd);
		p.on("ad:skip", onEnd);

		return () => {
			p.off("ad:start", onStart);
			p.off("ad:end", onEnd);
			p.off("ad:skip", onEnd);
		};
	});

	return {
		get active() {
			return active;
		},
		get meta() {
			return meta;
		},
	};
}
