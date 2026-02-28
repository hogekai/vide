<script lang="ts">
import { setContext } from "svelte";
import HlsPlugin from "../../src/svelte/HlsPlugin.svelte";
import {
	type PlayerGetter,
	VIDE_PLAYER_KEY,
	VIDE_REGISTER_KEY,
} from "../../src/svelte/context.js";

interface Props {
	getPlayer: PlayerGetter;
}

const { getPlayer }: Props = $props();

setContext(VIDE_PLAYER_KEY, getPlayer);
setContext(VIDE_REGISTER_KEY, () => {});
</script>

<HlsPlugin />
