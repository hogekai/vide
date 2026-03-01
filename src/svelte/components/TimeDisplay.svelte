<script lang="ts">
import { getContext } from "svelte";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "../context.js";
import { formatTime } from "../helpers.js";

interface Props {
	class?: string;
	separator?: string;
}

const { class: className, separator = "/" }: Props = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);
let currentTime = $state(0);
let duration = $state(0);

$effect(() => {
	const p = getPlayer();
	if (!p) return;
	const handler = (data: { currentTime: number; duration: number }) => {
		currentTime = data.currentTime;
		duration = data.duration;
	};
	p.on("timeupdate", handler);
	return () => p.off("timeupdate", handler);
});
</script>

<div class={["vide-time", className].filter(Boolean).join(" ")} aria-label="Time">
	<span>{formatTime(currentTime)}</span>
	<span>{separator}</span>
	<span>{formatTime(duration)}</span>
</div>
