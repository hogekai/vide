<script lang="ts">
import { getContext } from "svelte";
import { hls } from "../hls/index.js";
import type { HlsPluginOptions } from "../hls/types.js";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "./context.js";

const { hlsConfig, recovery }: HlsPluginOptions = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);

$effect(() => {
	const p = getPlayer();
	if (!p) return;
	const opts: HlsPluginOptions = {};
	if (hlsConfig !== undefined) opts.hlsConfig = hlsConfig;
	if (recovery !== undefined) opts.recovery = recovery;
	const plugin = hls(opts);
	const cleanup = plugin.setup(p);
	return () => {
		cleanup?.();
	};
});
</script>
