import { useState } from "react";
import type { AdMeta, Player, PlayerEventMap } from "../types.js";
import { useVideEvent } from "./use-vide-event.js";

export interface AdState {
	active: boolean;
	meta: AdMeta | null;
}

export function useAdState(player: Player | null): AdState {
	const [state, setState] = useState<AdState>({ active: false, meta: null });

	useVideEvent(player, "ad:start", (data: PlayerEventMap["ad:start"]) => {
		setState({
			active: true,
			meta: {
				adId: data.adId,
				clickThrough: data.clickThrough,
				skipOffset: data.skipOffset,
				duration: data.duration,
				adTitle: data.adTitle,
				adStartTime: Date.now(),
			},
		});
	});

	useVideEvent(player, "ad:end", () => {
		setState({ active: false, meta: null });
	});

	useVideEvent(player, "ad:skip", () => {
		setState({ active: false, meta: null });
	});

	return state;
}
