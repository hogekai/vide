<script lang="ts">
import { setContext } from "svelte";
import TimeDisplay from "../../../src/svelte/components/TimeDisplay.svelte";
import {
	type PlayerGetter,
	VIDE_PLAYER_KEY,
} from "../../../src/svelte/context.js";

interface Props {
	getPlayer: PlayerGetter;
	class?: string;
	separator?: string;
}

const { getPlayer, class: className, separator }: Props = $props();

setContext(VIDE_PLAYER_KEY, getPlayer);
</script>

<TimeDisplay class={className} {separator} />
