import { setContext } from "svelte";
import {
	type PlayerGetter,
	type RegisterFn,
	VIDE_PLAYER_KEY,
	VIDE_REGISTER_KEY,
} from "./context.js";
import { createPlayer } from "./helpers.js";
import type { MediaElement, Player } from "./helpers.js";

export function createVidePlayer(): PlayerGetter {
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

	return getPlayer;
}
