<script lang="ts">
import { getContext } from "svelte";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "../context.js";
import { useAdState } from "../use-ad-state.svelte.js";

interface Props {
	class?: string;
	format?: (remaining: number) => string;
}

const { class: className, format }: Props = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);
const adState = useAdState(getPlayer);
let remaining = $state(0);

$effect(() => {
	const p = getPlayer();
	if (!p) return;

	const onTimeUpdate = ({ currentTime }: { currentTime: number }) => {
		if (!adState.active || !adState.meta) return;
		const duration =
			adState.meta.duration ?? (Number.isFinite(p.duration) ? p.duration : 0);
		remaining = Math.max(0, Math.ceil(duration - currentTime));
	};

	p.on("timeupdate", onTimeUpdate);
	return () => p.off("timeupdate", onTimeUpdate);
});
</script>

{#if adState.active}
	<div aria-label="Ad countdown" aria-live="off" class={["vide-ad-countdown", className].filter(Boolean).join(" ")}>
		{format ? format(remaining) : `Ad \u00b7 ${remaining}s`}
	</div>
{/if}
