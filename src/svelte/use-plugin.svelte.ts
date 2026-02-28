import { dash } from "../dash/index.js";
import type { DashPluginOptions } from "../dash/types.js";
import { drm } from "../drm/index.js";
import type { DrmPluginOptions } from "../drm/types.js";
import { hls } from "../hls/index.js";
import type { HlsPluginOptions } from "../hls/types.js";
import { ssai } from "../ssai/index.js";
import type { SsaiPluginOptions } from "../ssai/types.js";
import type { Plugin } from "../types.js";
import { ui } from "../ui/index.js";
import type { UiPluginOptions } from "../ui/types.js";
import { vast } from "../vast/index.js";
import type { VastPluginOptions } from "../vast/types.js";
import { vmap } from "../vmap/index.js";
import type { VmapPluginOptions } from "../vmap/types.js";
import type { PlayerGetter } from "./context.js";

function usePlugin<O>(
	getPlayer: PlayerGetter,
	factory: (opts: O) => Plugin,
	options: O,
): void {
	$effect(() => {
		const p = getPlayer();
		if (!p) return;
		const plugin = factory(options);
		const cleanup = plugin.setup(p);
		return () => {
			cleanup?.();
		};
	});
}

export function useHls(
	getPlayer: PlayerGetter,
	options?: HlsPluginOptions,
): void {
	usePlugin(getPlayer, hls, options ?? {});
}

export function useDash(
	getPlayer: PlayerGetter,
	options?: DashPluginOptions,
): void {
	usePlugin(getPlayer, dash, options ?? {});
}

export function useDrm(
	getPlayer: PlayerGetter,
	options: DrmPluginOptions,
): void {
	usePlugin(getPlayer, drm, options);
}

export function useVast(
	getPlayer: PlayerGetter,
	options: VastPluginOptions,
): void {
	usePlugin(getPlayer, vast, options);
}

export function useVmap(
	getPlayer: PlayerGetter,
	options: VmapPluginOptions,
): void {
	usePlugin(getPlayer, vmap, options);
}

export function useSsai(
	getPlayer: PlayerGetter,
	options?: SsaiPluginOptions,
): void {
	usePlugin(getPlayer, ssai, options ?? {});
}

export function useUi(getPlayer: PlayerGetter, options: UiPluginOptions): void {
	usePlugin(getPlayer, ui, options);
}
