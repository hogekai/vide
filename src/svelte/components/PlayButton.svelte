<script lang="ts">
import { getContext } from "svelte";
import type { Snippet } from "svelte";
import type { PlayerState } from "../../types.js";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "../context.js";
import IconPause from "../icons/IconPause.svelte";
import IconPlay from "../icons/IconPlay.svelte";

interface Props {
	class?: string;
	children?: Snippet;
}

const { class: className, children }: Props = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);
let playing = $state(false);

$effect(() => {
	const p = getPlayer();
	if (!p) return;
	const handler = ({ to }: { from: PlayerState; to: PlayerState }) => {
		if (to === "playing" || to === "ad:playing") {
			playing = true;
		} else if (
			to === "paused" ||
			to === "ready" ||
			to === "ended" ||
			to === "ad:paused"
		) {
			playing = false;
		}
	};
	p.on("statechange", handler);
	return () => p.off("statechange", handler);
});

function onClick() {
	const p = getPlayer();
	if (!p) return;
	if (p.state === "playing" || p.state === "ad:playing") {
		p.pause();
	} else {
		p.play().catch(() => {});
	}
}
</script>

<button
	type="button"
	class={className}
	aria-label={playing ? "Pause" : "Play"}
	data-playing={playing || undefined}
	onclick={onClick}
>
	{#if children}
		{@render children()}
	{:else if playing}
		<IconPause />
	{:else}
		<IconPlay />
	{/if}
</button>
