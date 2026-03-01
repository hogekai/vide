<script lang="ts">
import { getContext } from "svelte";
import type { Snippet } from "svelte";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "../context.js";
import { useAdState } from "../use-ad-state.svelte.js";

interface Props {
	class?: string;
	children?: Snippet;
}

const { class: className, children }: Props = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);
const adState = useAdState(getPlayer);
</script>

{#if adState.active}
	<div class={["vide-ad-label", className].filter(Boolean).join(" ")}>
		{#if children}
			{@render children()}
		{:else}
			Ad
		{/if}
	</div>
{/if}
