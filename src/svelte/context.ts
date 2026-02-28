import { getContext } from "svelte";
import type { MediaElement, Player } from "./helpers.js";

export const VIDE_PLAYER_KEY = Symbol("vide-player");
export const VIDE_REGISTER_KEY = Symbol("vide-register");

export type PlayerGetter = () => Player | null;
export type RegisterFn = (el: MediaElement) => void;

export function useVideContext(): PlayerGetter {
	const getter = getContext<PlayerGetter>(VIDE_PLAYER_KEY);
	if (!getter) {
		throw new Error("useVideContext must be used within <VideVideo>");
	}
	return getter;
}
