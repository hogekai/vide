<script lang="ts">
import { getContext } from "svelte";
import type { Snippet } from "svelte";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "../context.js";
import IconVolumeHigh from "../icons/IconVolumeHigh.svelte";
import IconVolumeLow from "../icons/IconVolumeLow.svelte";
import IconVolumeMute from "../icons/IconVolumeMute.svelte";

interface Props {
	class?: string;
	children?: Snippet;
}

const { class: className, children }: Props = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);
let muted = $state(false);
let volume = $state(1);

$effect(() => {
	const p = getPlayer();
	if (!p) return;
	const sync = () => {
		muted = p.muted || p.volume === 0;
		volume = p.volume;
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
	{:else if muted}
		<IconVolumeMute />
	{:else if volume < 0.5}
		<IconVolumeLow />
	{:else}
		<IconVolumeHigh />
	{/if}
</button>
