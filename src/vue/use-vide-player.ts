import { type ShallowRef, onScopeDispose, provide, shallowRef } from "vue";
import { createPlayer } from "../core.js";
import type { MediaElement, Player } from "../types.js";
import { VIDE_PLAYER_KEY, VIDE_REGISTER_KEY } from "./context.js";

export function useVidePlayer(): ShallowRef<Player | null> {
	const player = shallowRef<Player | null>(null);

	const registerEl = (el: MediaElement) => {
		if (player.value) {
			player.value.destroy();
			player.value = null;
		}
		player.value = createPlayer(el);
	};

	provide(VIDE_PLAYER_KEY, player);
	provide(VIDE_REGISTER_KEY, registerEl);

	onScopeDispose(() => {
		player.value?.destroy();
		player.value = null;
	});

	return player;
}
