<script lang="ts">
import type { PlayerGetter } from "../../src/svelte/context.js";
import { useHls } from "../../src/svelte/use-plugin.svelte.js";

interface Props {
	getPlayer: PlayerGetter;
}

const { getPlayer }: Props = $props();

useHls(getPlayer);
</script>
