<script lang="ts">
import { setContext } from "svelte";
import Volume from "../../../src/svelte/components/Volume.svelte";
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

<Volume class={className} />
