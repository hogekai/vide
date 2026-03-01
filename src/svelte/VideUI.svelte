<script lang="ts">
import { getContext } from "svelte";
import type { Snippet } from "svelte";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "./context.js";
import { stateToClass } from "./helpers.js";
import type { PlayerState } from "./helpers.js";

interface Props {
	class?: string;
	children?: Snippet;
	onmount?: (el: HTMLDivElement) => void;
}

const { class: className, children, onmount }: Props = $props();

let rootEl: HTMLDivElement | undefined = $state();

$effect(() => {
	if (rootEl && onmount) onmount(rootEl);
});

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);
let stateClass = $state("");

$effect(() => {
	const p = getPlayer();
	if (!p) {
		stateClass = "";
		return;
	}
	stateClass = stateToClass(p.state);
	const handler = ({ to }: { from: PlayerState; to: PlayerState }) => {
		stateClass = stateToClass(to);
	};
	p.on("statechange", handler);
	return () => p.off("statechange", handler);
});
</script>

<div
	bind:this={rootEl}
	class={["vide-ui", stateClass, className].filter(Boolean).join(" ")}
	role="region"
	aria-label="Video player"
>
	{#if children}
		{@render children()}
	{/if}
</div>
