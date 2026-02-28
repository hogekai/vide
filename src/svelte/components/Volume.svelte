<script lang="ts">
import { getContext } from "svelte";
import type { Snippet } from "svelte";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "../context.js";
import IconVolumeHigh from "../icons/IconVolumeHigh.svelte";
import IconVolumeLow from "../icons/IconVolumeLow.svelte";
import IconVolumeMute from "../icons/IconVolumeMute.svelte";

interface Props {
	class?: string;
	children?: Snippet;
}

const { class: className, children }: Props = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);
let volume = $state(1);
let muted = $state(false);
let dragging = false;
let sliderEl: HTMLDivElement;

$effect(() => {
	const p = getPlayer();
	if (!p) return;
	const sync = () => {
		if (!dragging) {
			volume = p.muted ? 0 : p.volume;
		}
		muted = p.muted || p.volume === 0;
	};
	p.el.addEventListener("volumechange", sync);
	sync();
	return () => {
		p.el.removeEventListener("volumechange", sync);
	};
});

function onMuteClick() {
	const p = getPlayer();
	if (!p) return;
	p.muted = !p.muted;
}

function getRatio(e: PointerEvent): number {
	if (!sliderEl) return 0;
	const rect = sliderEl.getBoundingClientRect();
	if (rect.width === 0) return 0;
	return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
}

function onPointerDown(e: PointerEvent) {
	const p = getPlayer();
	if (!p) return;
	dragging = true;
	sliderEl?.setPointerCapture(e.pointerId);
	const vol = getRatio(e);
	p.volume = vol;
	if (p.muted && vol > 0) p.muted = false;
	volume = vol;
	muted = vol === 0;
}

function onPointerMove(e: PointerEvent) {
	const p = getPlayer();
	if (!dragging || !p) return;
	const vol = getRatio(e);
	p.volume = vol;
	if (p.muted && vol > 0) p.muted = false;
	volume = vol;
	muted = vol === 0;
}

function onPointerUp(e: PointerEvent) {
	if (!dragging) return;
	dragging = false;
	sliderEl?.releasePointerCapture(e.pointerId);
}
</script>

<div
	class={["vide-volume", className].filter(Boolean).join(" ")}
	data-muted={muted || undefined}
	style="--vide-volume: {volume}"
>
	<button
		type="button"
		class="vide-volume__button"
		aria-label={muted ? "Unmute" : "Mute"}
		onclick={onMuteClick}
	>
		{#if children}
			{@render children()}
		{:else if muted}
			<IconVolumeMute />
		{:else if volume < 0.5}
			<IconVolumeLow />
		{:else}
			<IconVolumeHigh />
		{/if}
	</button>
	<div
		bind:this={sliderEl}
		class="vide-volume__slider"
		role="slider"
		tabindex="0"
		aria-label="Volume"
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow={Math.round(volume * 100)}
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
	>
		<div class="vide-volume__track"></div>
		<div class="vide-volume__filled"></div>
	</div>
</div>
