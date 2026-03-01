<script lang="ts">
import { getContext } from "svelte";
import type { Snippet } from "svelte";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "../context.js";
import { useAdState } from "../use-ad-state.svelte.js";

interface Props {
	class?: string;
	children?: Snippet;
	showTitle?: boolean;
}

const { class: className, children, showTitle = false }: Props = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);
const adState = useAdState(getPlayer);

function onClick() {
	const p = getPlayer();
	if (!p || !adState.meta?.clickThrough) return;
	p.el.click();
	window.open(adState.meta.clickThrough, "_blank");
	p.el.pause();
}
</script>

{#if adState.active && adState.meta?.clickThrough}
	<button
		type="button"
		class={["vide-ad-cta", className].filter(Boolean).join(" ")}
		onclick={onClick}
	>
		{#if showTitle && adState.meta.adTitle}
			<span class="vide-ad-cta__title">{adState.meta.adTitle}</span>
		{/if}
		{#if children}
			{@render children()}
		{:else}
			Learn More
		{/if}
	</button>
{/if}
