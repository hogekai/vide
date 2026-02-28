<script lang="ts">
import { setContext } from "svelte";
import type { Snippet } from "svelte";
import {
	type PlayerGetter,
	type RegisterFn,
	VIDE_PLAYER_KEY,
	VIDE_REGISTER_KEY,
} from "../../src/svelte/context.js";

interface Props {
	getPlayer: PlayerGetter;
	registerEl?: RegisterFn;
	children?: Snippet;
}

const { getPlayer, registerEl = () => {}, children }: Props = $props();

setContext(VIDE_PLAYER_KEY, getPlayer);
setContext(VIDE_REGISTER_KEY, registerEl);
</script>

{#if children}
	{@render children()}
{/if}
