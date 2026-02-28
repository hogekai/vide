import { setContext } from "svelte";
import { createPlayer } from "../core.js";
import type { MediaElement, Player } from "../types.js";
import {
	type PlayerGetter,
	type RegisterFn,
	VIDE_PLAYER_KEY,
	VIDE_REGISTER_KEY,
} from "./context.js";

export function createVidePlayer(): { readonly player: Player | null } {
	let player = $state<Player | null>(null);

	const registerEl: RegisterFn = (el: MediaElement) => {
		if (player) {
			player.destroy();
		}
		player = createPlayer(el);
	};

	$effect(() => {
		const p = player;
		return () => {
			p?.destroy();
		};
	});

	const getPlayer: PlayerGetter = () => player;
	setContext(VIDE_PLAYER_KEY, getPlayer);
	setContext(VIDE_REGISTER_KEY, registerEl);

	return {
		get player() {
			return player;
		},
	};
}
