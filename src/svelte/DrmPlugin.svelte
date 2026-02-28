<script lang="ts">
import { getContext } from "svelte";
import { drm } from "../drm/index.js";
import type { DrmPluginOptions } from "../drm/types.js";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "./context.js";

const { widevine, fairplay }: DrmPluginOptions = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);

$effect(() => {
	const p = getPlayer();
	if (!p) return;
	const plugin = drm({ widevine, fairplay });
	const cleanup = plugin.setup(p);
	return () => {
		cleanup?.();
	};
});
</script>
