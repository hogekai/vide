<script lang="ts">
import { setContext } from "svelte";
import AdLearnMore from "../../../src/svelte/components/AdLearnMore.svelte";
import {
	type PlayerGetter,
	VIDE_PLAYER_KEY,
} from "../../../src/svelte/context.js";

interface Props {
	getPlayer: PlayerGetter;
	class?: string;
	showTitle?: boolean;
}

const { getPlayer, class: className, showTitle = false }: Props = $props();

setContext(VIDE_PLAYER_KEY, getPlayer);
</script>

<AdLearnMore class={className} {showTitle} />
