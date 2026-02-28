<script lang="ts">
import type { PlayerGetter } from "../../src/svelte/context.js";
import { useVideEvent } from "../../src/svelte/use-vide-event.svelte.js";

interface Props {
	getPlayer: PlayerGetter;
	event: string;
	handler: (...args: any[]) => void;
}

const { getPlayer, event, handler }: Props = $props();

useVideEvent(getPlayer, event as any, handler as any);
</script>
