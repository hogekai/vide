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

function onClick() {
	const p = getPlayer();
	if (!p) return;
	p.el.click();
	const url = adState.meta?.clickThrough;
	if (url) {
		window.open(url, "_blank");
		p.el.pause();
	} else {
		if (p.el.paused) {
			Promise.resolve(p.el.play()).catch(() => {});
		} else {
			p.el.pause();
		}
	}
}
</script>

{#if adState.active}
	<div
		class={["vide-ad-overlay", className].filter(Boolean).join(" ")}
		onclick={onClick}
		role="button"
		tabindex="-1"
	>
		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}
