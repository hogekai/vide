<script lang="ts">
import { getContext } from "svelte";
import { ssai } from "../ssai/index.js";
import type { SsaiPluginOptions } from "../ssai/types.js";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "./context.js";

const { tolerance, parser }: SsaiPluginOptions = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);

$effect(() => {
	const p = getPlayer();
	if (!p) return;
	const opts: SsaiPluginOptions = {};
	if (tolerance !== undefined) opts.tolerance = tolerance;
	if (parser !== undefined) opts.parser = parser;
	const plugin = ssai(opts);
	const cleanup = plugin.setup(p);
	return () => {
		cleanup?.();
	};
});
</script>
