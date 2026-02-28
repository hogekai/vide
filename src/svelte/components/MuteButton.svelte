<script lang="ts">
import { getContext } from "svelte";
import type { Snippet } from "svelte";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "../context.js";

interface Props {
	class?: string;
	children?: Snippet;
}

const { class: className, children }: Props = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);
let muted = $state(false);

$effect(() => {
	const p = getPlayer();
	if (!p) return;
	const sync = () => {
		muted = p.muted || p.volume === 0;
	};
	p.el.addEventListener("volumechange", sync);
	sync();
	return () => {
		p.el.removeEventListener("volumechange", sync);
	};
});

function onClick() {
	const p = getPlayer();
	if (!p) return;
	p.muted = !p.muted;
}
</script>

<button
	type="button"
	class={className}
	aria-label={muted ? "Unmute" : "Mute"}
	data-muted={muted || undefined}
	onclick={onClick}
>
	{#if children}
		{@render children()}
	{/if}
</button>
