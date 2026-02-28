<script lang="ts">
import { getContext, onDestroy } from "svelte";
import { isAdState } from "../helpers.js";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "../context.js";

const DBLCLICK_DELAY = 200;

interface Props {
	class?: string;
	enableFullscreen?: boolean;
}

const { class: className, enableFullscreen = true }: Props = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);
let clickTimer: ReturnType<typeof setTimeout> | null = null;

function togglePlay(): void {
	const p = getPlayer();
	if (!p) return;
	if (p.state === "playing" || p.state === "ad:playing") {
		p.pause();
	} else {
		p.play().catch(() => {});
	}
}

function toggleFullscreen(): void {
	if (!enableFullscreen) return;
	const p = getPlayer();
	const target =
		(p?.el.closest(".vide-ui") as HTMLElement | null) ?? p?.el.parentElement;
	if (!target) return;
	if (document.fullscreenElement != null) {
		document.exitFullscreen().catch(() => {});
	} else if (target.requestFullscreen) {
		target.requestFullscreen().catch(() => {});
	}
}

function onClick(): void {
	const p = getPlayer();
	if (!p) return;

	if (isAdState(p.state)) {
		p.el.click();
		togglePlay();
		return;
	}

	if (clickTimer !== null) {
		clearTimeout(clickTimer);
		clickTimer = null;
		toggleFullscreen();
		return;
	}

	clickTimer = setTimeout(() => {
		clickTimer = null;
		togglePlay();
	}, DBLCLICK_DELAY);
}

onDestroy(() => {
	if (clickTimer !== null) {
		clearTimeout(clickTimer);
		clickTimer = null;
	}
});
</script>

<div
	class={["vide-clickplay", className].filter(Boolean).join(" ")}
	onclick={onClick}
	role="presentation"
></div>
