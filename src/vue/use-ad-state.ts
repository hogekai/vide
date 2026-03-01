import { type Ref, type ShallowRef, ref, shallowRef } from "vue";
import type { AdMeta, Player, PlayerEventMap } from "../types.js";
import { useVideEvent } from "./use-vide-event.js";

export interface AdState {
	active: Ref<boolean>;
	meta: ShallowRef<AdMeta | null>;
}

export function useAdState(player: ShallowRef<Player | null>): AdState {
	const active = ref(false);
	const meta = shallowRef<AdMeta | null>(null);

	useVideEvent(player, "ad:start", (data: PlayerEventMap["ad:start"]) => {
		active.value = true;
		meta.value = {
			adId: data.adId,
			clickThrough: data.clickThrough,
			skipOffset: data.skipOffset,
			duration: data.duration,
			adTitle: data.adTitle,
			adStartTime: Date.now(),
		};
	});

	useVideEvent(player, "ad:end", () => {
		active.value = false;
		meta.value = null;
	});

	useVideEvent(player, "ad:skip", () => {
		active.value = false;
		meta.value = null;
	});

	return { active, meta };
}
