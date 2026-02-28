<script lang="ts">
import { getContext } from "svelte";
import type { Snippet } from "svelte";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "../context.js";
import IconPlay from "../icons/IconPlay.svelte";

interface Props {
	class?: string;
	children?: Snippet;
}

const { class: className, children }: Props = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);

function onClick() {
	const p = getPlayer();
	if (!p) return;
	if (p.state === "ended") {
		function onReady({ to }: { from: string; to: string }): void {
			if (to === "ready") {
				p.off("statechange", onReady);
				p.play().catch(() => {});
			}
		}
		p.on("statechange", onReady);
		p.el.currentTime = 0;
		p.el.load();
		return;
	}
	p.play().catch(() => {});
}
</script>

<button
	type="button"
	class={["vide-bigplay", className].filter(Boolean).join(" ")}
	aria-label="Play video"
	onclick={onClick}
>
	{#if children}
		{@render children()}
	{:else}
		<IconPlay />
	{/if}
</button>
