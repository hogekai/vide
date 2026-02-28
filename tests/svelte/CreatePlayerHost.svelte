<script lang="ts">
import { getContext } from "svelte";
import type { Snippet } from "svelte";
import {
	type PlayerGetter,
	type RegisterFn,
	VIDE_PLAYER_KEY,
	VIDE_REGISTER_KEY,
} from "../../src/svelte/context.js";
import { createVidePlayer } from "../../src/svelte/create-vide-player.svelte.js";

interface Props {
	onCreated?: (result: {
		getPlayer: PlayerGetter;
		registerEl: RegisterFn;
	}) => void;
	children?: Snippet;
}

const { onCreated, children }: Props = $props();

createVidePlayer();
const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);
const registerEl = getContext<RegisterFn>(VIDE_REGISTER_KEY);

onCreated?.({ getPlayer, registerEl });
</script>

{#if children}
	{@render children()}
{/if}
