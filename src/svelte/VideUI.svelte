<script lang="ts">
import { getContext } from "svelte";
import type { Snippet } from "svelte";
import type { PlayerState } from "../../types.js";
import { stateToClass } from "../../ui/state.js";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "./context.js";

interface Props {
	class?: string;
	children?: Snippet;
	el?: HTMLDivElement;
}

const { class: className, children, el = $bindable() }: Props = $props();

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
	bind:this={el}
	class={["vide-ui", stateClass, className].filter(Boolean).join(" ")}
	role="region"
	aria-label="Video player"
>
	{#if children}
		{@render children()}
	{/if}
</div>
