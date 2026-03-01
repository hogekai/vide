<script lang="ts">
import { getContext } from "svelte";
import type { Snippet } from "svelte";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "../context.js";
import IconSkipForward from "../icons/IconSkipForward.svelte";
import { useAdState } from "../use-ad-state.svelte.js";

interface Props {
	class?: string;
	children?: Snippet;
}

const { class: className, children }: Props = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);
const adState = useAdState(getPlayer);
let canSkip = $state(false);
let countdown = $state(0);

$effect(() => {
	const p = getPlayer();
	if (!p) return;

	const onTimeUpdate = ({ currentTime }: { currentTime: number }) => {
		if (
			!adState.active ||
			!adState.meta ||
			adState.meta.skipOffset === undefined
		)
			return;
		if (currentTime >= adState.meta.skipOffset) {
			canSkip = true;
		} else {
			canSkip = false;
			countdown = Math.max(0, Math.ceil(adState.meta.skipOffset - currentTime));
		}
	};

	p.on("timeupdate", onTimeUpdate);
	return () => p.off("timeupdate", onTimeUpdate);
});

function onClick() {
	const p = getPlayer();
	if (!p || !canSkip || !adState.meta) return;
	p.emit("ad:skip", { adId: adState.meta.adId });
}
</script>

{#if adState.active && adState.meta && adState.meta.skipOffset !== undefined}
	<button
		type="button"
		class={["vide-skip", !canSkip && "vide-skip--disabled", className].filter(Boolean).join(" ")}
		aria-label="Skip ad"
		onclick={onClick}
		disabled={!canSkip}
	>
		{#if children}
			{@render children()}
		{:else}
			<span class="vide-skip__label">
				{canSkip ? "Skip Ad" : `Skip in ${countdown}s`}
			</span>
			<IconSkipForward />
		{/if}
	</button>
{/if}
