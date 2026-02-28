<script lang="ts">
import { getContext } from "svelte";
import type { Snippet } from "svelte";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "./context.js";

interface Props {
	class?: string;
	children?: Snippet;
}

const { class: className, children }: Props = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);
</script>

{#if getPlayer()}
	<div class={["vide-controls", className].filter(Boolean).join(" ")}>
		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}
