<script lang="ts">
import { setContext } from "svelte";
import AdCountdown from "../../../src/svelte/components/AdCountdown.svelte";
import {
	type PlayerGetter,
	VIDE_PLAYER_KEY,
} from "../../../src/svelte/context.js";

interface Props {
	getPlayer: PlayerGetter;
	class?: string;
	format?: (remaining: number) => string;
}

const { getPlayer, class: className, format }: Props = $props();

setContext(VIDE_PLAYER_KEY, getPlayer);
</script>

<AdCountdown class={className} {format} />
