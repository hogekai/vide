<script lang="ts">
import { getContext, onDestroy, onMount } from "svelte";
import type { Snippet } from "svelte";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "../context.js";

interface Props {
	class?: string;
	target?: HTMLElement | null;
	children?: Snippet;
}

const { class: className, target = null, children }: Props = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);
let active = $state(false);

function onChange() {
	active =
		document.fullscreenElement != null ||
		// biome-ignore lint/suspicious/noExplicitAny: webkit prefix
		(document as any).webkitFullscreenElement != null;
}

onMount(() => {
	document.addEventListener("fullscreenchange", onChange);
	document.addEventListener("webkitfullscreenchange", onChange);
});

onDestroy(() => {
	document.removeEventListener("fullscreenchange", onChange);
	document.removeEventListener("webkitfullscreenchange", onChange);
});

function onClick() {
	const p = getPlayer();
	const fsTarget = target ?? p?.el.parentElement;
	if (!fsTarget) return;
	if (document.fullscreenElement) {
		document.exitFullscreen().catch(() => {});
	} else {
		fsTarget.requestFullscreen().catch(() => {});
	}
}
</script>

<button
	type="button"
	class={className}
	aria-label={active ? "Exit fullscreen" : "Fullscreen"}
	data-fullscreen={active || undefined}
	onclick={onClick}
>
	{#if children}
		{@render children()}
	{/if}
</button>
