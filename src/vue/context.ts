import type { InjectionKey, ShallowRef } from "vue";
import { inject } from "vue";
import type { MediaElement, Player } from "../types.js";

export const VIDE_PLAYER_KEY: InjectionKey<ShallowRef<Player | null>> =
	Symbol("vide-player");

export const VIDE_REGISTER_KEY: InjectionKey<(el: MediaElement) => void> =
	Symbol("vide-register");

export function useVideContext(): ShallowRef<Player | null> {
	const player = inject(VIDE_PLAYER_KEY);
	if (!player) {
		throw new Error("useVideContext must be used within <VideVideo>");
	}
	return player;
}
