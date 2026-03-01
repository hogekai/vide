<script lang="ts">
import { setContext } from "svelte";
import AdOverlay from "../../../src/svelte/components/AdOverlay.svelte";
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

<AdOverlay class={className} />
