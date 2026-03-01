<script lang="ts">
import { getContext } from "svelte";
import type { Snippet } from "svelte";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "../context.js";
import IconExternalLink from "../icons/IconExternalLink.svelte";
import { useAdState } from "../use-ad-state.svelte.js";

function hostname(url: string): string {
	try {
		return new URL(url).hostname;
	} catch {
		return url;
	}
}

interface Props {
	class?: string;
	children?: Snippet;
}

const { class: className, children }: Props = $props();

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
		{#if children}
			{@render children()}
		{:else}
			<span class="vide-ad-cta__icon">
				<IconExternalLink />
			</span>
			<span class="vide-ad-cta__body">
				{#if adState.meta.adTitle}
					<span class="vide-ad-cta__title">{adState.meta.adTitle}</span>
				{/if}
				<span class="vide-ad-cta__url">{hostname(adState.meta.clickThrough)}</span>
			</span>
		{/if}
	</button>
{/if}
