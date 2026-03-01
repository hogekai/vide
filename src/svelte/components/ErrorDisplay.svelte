<script lang="ts">
import { getContext } from "svelte";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "../context.js";

interface Props {
	class?: string;
}

const { class: className }: Props = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);
let message = $state("");

$effect(() => {
	const p = getPlayer();
	if (!p) return;
	const handler = ({ message: msg }: { message: string }) => {
		message = msg;
	};
	p.on("error", handler);
	return () => p.off("error", handler);
});
</script>

<div role="alert" class={["vide-error", className].filter(Boolean).join(" ")}>
	<span class="vide-error__message">{message}</span>
</div>
