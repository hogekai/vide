<script lang="ts">
import { setContext } from "svelte";
import AdSkip from "../../../src/svelte/components/AdSkip.svelte";
import {
	type PlayerGetter,
	VIDE_PLAYER_KEY,
} from "../../../src/svelte/context.js";

interface Props {
	getPlayer: PlayerGetter;
	class?: string;
}

const { getPlayer, class: className }: Props = $props();

setContext(VIDE_PLAYER_KEY, getPlayer);
</script>

<AdSkip class={className} />
