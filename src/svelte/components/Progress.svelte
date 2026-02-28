<script lang="ts">
import { getContext } from "svelte";
import type { PlayerState } from "../../types.js";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "../context.js";

interface Props {
	class?: string;
}

const { class: className }: Props = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);
let progress = $state(0);
let buffered = $state(0);
let disabled = $state(false);
let dragging = false;
let rootEl: HTMLDivElement;

$effect(() => {
	const p = getPlayer();
	if (!p) return;
	const onTimeUpdate = ({
		currentTime,
		duration,
	}: { currentTime: number; duration: number }) => {
		if (!dragging && duration > 0) {
			progress = currentTime / duration;
		}
		if (p.el.buffered.length > 0 && duration > 0) {
			const end = p.el.buffered.end(p.el.buffered.length - 1);
			buffered = Math.min(1, end / duration);
		}
	};
	p.on("timeupdate", onTimeUpdate);
	return () => p.off("timeupdate", onTimeUpdate);
});

$effect(() => {
	const p = getPlayer();
	if (!p) return;
	const onStateChange = ({ to }: { from: PlayerState; to: PlayerState }) => {
		const isAd =
			to === "ad:loading" || to === "ad:playing" || to === "ad:paused";
		disabled = isAd;
	};
	p.on("statechange", onStateChange);
	return () => p.off("statechange", onStateChange);
});

function getRatio(e: PointerEvent): number {
	if (!rootEl) return 0;
	const rect = rootEl.getBoundingClientRect();
	if (rect.width === 0) return 0;
	return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
}

function onPointerDown(e: PointerEvent) {
	const p = getPlayer();
	if (!p || disabled) return;
	dragging = true;
	rootEl?.setPointerCapture(e.pointerId);
	progress = getRatio(e);
}

function onPointerMove(e: PointerEvent) {
	if (!dragging) return;
	progress = getRatio(e);
}

function onPointerUp(e: PointerEvent) {
	const p = getPlayer();
	if (!dragging || !p) return;
	dragging = false;
	rootEl?.releasePointerCapture(e.pointerId);
	const ratio = getRatio(e);
	const duration = p.el.duration;
	if (Number.isFinite(duration) && duration > 0) {
		p.currentTime = ratio * duration;
	}
}
</script>

<div
	bind:this={rootEl}
	class={className}
	role="slider"
	tabindex="0"
	aria-label="Seek"
	aria-valuemin="0"
	aria-valuemax="100"
	aria-valuenow={Math.round(progress * 100)}
	data-disabled={disabled || undefined}
	style="--vide-progress: {progress}; --vide-progress-buffered: {buffered}"
	onpointerdown={onPointerDown}
	onpointermove={onPointerMove}
	onpointerup={onPointerUp}
></div>
