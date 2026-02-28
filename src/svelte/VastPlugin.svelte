<script lang="ts">
import { getContext } from "svelte";
import { vast } from "../vast/index.js";
import type { VastPluginOptions } from "../vast/types.js";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "./context.js";

const { tagUrl, timeout, allowSkip, adPlugins }: VastPluginOptions = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);

$effect(() => {
	const p = getPlayer();
	if (!p) return;
	const plugin = vast({ tagUrl, timeout, allowSkip, adPlugins });
	const cleanup = plugin.setup(p);
	return () => {
		cleanup?.();
	};
});
</script>
