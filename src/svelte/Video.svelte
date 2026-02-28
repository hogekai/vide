<script lang="ts">
import { getContext, onMount } from "svelte";
import type { Snippet } from "svelte";
import type { MediaElement } from "../types.js";
import { type RegisterFn, VIDE_REGISTER_KEY } from "./context.js";

interface Props {
	src?: string;
	class?: string;
	children?: Snippet;
	[key: string]: unknown;
}

const { class: className, children, ...videoAttrs }: Props = $props();
let videoEl: HTMLVideoElement;

const registerEl = getContext<RegisterFn>(VIDE_REGISTER_KEY);

onMount(() => {
	if (videoEl && registerEl) {
		registerEl(videoEl as MediaElement);
	}
});
</script>

<div class={className}>
	<video bind:this={videoEl} {...videoAttrs}></video>
	{#if children}
		{@render children()}
	{/if}
</div>
