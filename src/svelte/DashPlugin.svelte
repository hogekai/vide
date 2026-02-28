<script lang="ts">
import { getContext } from "svelte";
import { dash } from "../dash/index.js";
import type { DashPluginOptions } from "../dash/types.js";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "./context.js";

const { dashConfig, recovery }: DashPluginOptions = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);

$effect(() => {
	const p = getPlayer();
	if (!p) return;
	const opts: DashPluginOptions = {};
	if (dashConfig !== undefined) opts.dashConfig = dashConfig;
	if (recovery !== undefined) opts.recovery = recovery;
	const plugin = dash(opts);
	const cleanup = plugin.setup(p);
	return () => {
		cleanup?.();
	};
});
</script>
