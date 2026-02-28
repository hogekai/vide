import { useEffect, useRef } from "react";
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
	player: Player | null,
	factory: (opts: O) => Plugin,
	options: O,
): void {
	const optionsRef = useRef(options);
	optionsRef.current = options;

	useEffect(() => {
		if (!player) return;
		const plugin = factory(optionsRef.current);
		const cleanup = plugin.setup(player);
		return () => {
			cleanup?.();
		};
	}, [player, factory]);
}

export function useHls(
	player: Player | null,
	options?: HlsPluginOptions,
): void {
	usePlugin(player, hls, options ?? {});
}

export function useDash(
	player: Player | null,
	options?: DashPluginOptions,
): void {
	usePlugin(player, dash, options ?? {});
}

export function useDrm(player: Player | null, options: DrmPluginOptions): void {
	usePlugin(player, drm, options);
}

export function useVast(
	player: Player | null,
	options: VastPluginOptions,
): void {
	usePlugin(player, vast, options);
}

export function useVmap(
	player: Player | null,
	options: VmapPluginOptions,
): void {
	usePlugin(player, vmap, options);
}

export function useSsai(
	player: Player | null,
	options?: SsaiPluginOptions,
): void {
	usePlugin(player, ssai, options ?? {});
}

export function useUi(player: Player | null, options: UiPluginOptions): void {
	usePlugin(player, ui, options);
}
