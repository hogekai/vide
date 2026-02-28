<script lang="ts">
import { getContext } from "svelte";
import { vmap } from "../vmap/index.js";
import type { VmapPluginOptions } from "../vmap/types.js";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "./context.js";

const { url, timeout, vastOptions, adPlugins }: VmapPluginOptions = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);

$effect(() => {
	const p = getPlayer();
	if (!p) return;
	const plugin = vmap({ url, timeout, vastOptions, adPlugins });
	const cleanup = plugin.setup(p);
	return () => {
		cleanup?.();
	};
});
</script>
