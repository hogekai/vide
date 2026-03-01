<script lang="ts">
import { getContext, onMount } from "svelte";
import { type RegisterFn, VIDE_REGISTER_KEY } from "./context.js";
import type { MediaElement } from "./helpers.js";

interface Props {
	src?: string;
	class?: string;
	[key: string]: unknown;
}

const { ...videoAttrs }: Props = $props();
let videoEl: HTMLVideoElement;

const registerEl = getContext<RegisterFn>(VIDE_REGISTER_KEY);

onMount(() => {
	if (videoEl && registerEl) {
		registerEl(videoEl as MediaElement);
	}
});
</script>

<video bind:this={videoEl} {...videoAttrs}></video>
