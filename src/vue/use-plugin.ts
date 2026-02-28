import { type ShallowRef, onScopeDispose, watch } from "vue";
import { dash } from "../dash/index.js";
import type { DashPluginOptions } from "../dash/types.js";
import { drm } from "../drm/index.js";
import type { DrmPluginOptions } from "../drm/types.js";
import { hls } from "../hls/index.js";
import type { HlsPluginOptions } from "../hls/types.js";
import { ssai } from "../ssai/index.js";
import type { SsaiPluginOptions } from "../ssai/types.js";
import type { Player, Plugin } from "../types.js";
import { ui } from "../ui/index.js";
import type { UiPluginOptions } from "../ui/types.js";
import { vast } from "../vast/index.js";
import type { VastPluginOptions } from "../vast/types.js";
import { vmap } from "../vmap/index.js";
import type { VmapPluginOptions } from "../vmap/types.js";

function usePlugin<O>(
	player: ShallowRef<Player | null>,
	factory: (opts: O) => Plugin,
	options: O,
): void {
	let cleanup: (() => void) | undefined;

	watch(
		player,
		(p) => {
			cleanup?.();
			cleanup = undefined;
			if (!p) return;
			const plugin = factory(options);
			cleanup = plugin.setup(p) ?? undefined;
		},
		{ immediate: true },
	);

	onScopeDispose(() => {
		cleanup?.();
	});
}

export function useHls(
	player: ShallowRef<Player | null>,
	options?: HlsPluginOptions,
): void {
	usePlugin(player, hls, options ?? {});
}

export function useDash(
	player: ShallowRef<Player | null>,
	options?: DashPluginOptions,
): void {
	usePlugin(player, dash, options ?? {});
}

export function useDrm(
	player: ShallowRef<Player | null>,
	options: DrmPluginOptions,
): void {
	usePlugin(player, drm, options);
}

export function useVast(
	player: ShallowRef<Player | null>,
	options: VastPluginOptions,
): void {
	usePlugin(player, vast, options);
}

export function useVmap(
	player: ShallowRef<Player | null>,
	options: VmapPluginOptions,
): void {
	usePlugin(player, vmap, options);
}

export function useSsai(
	player: ShallowRef<Player | null>,
	options?: SsaiPluginOptions,
): void {
	usePlugin(player, ssai, options ?? {});
}

export function useUi(
	player: ShallowRef<Player | null>,
	options: UiPluginOptions,
): void {
	usePlugin(player, ui, options);
}
