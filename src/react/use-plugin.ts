import { useEffect, useRef } from "react";
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
import type { VidePlayerHandle } from "./use-vide-player.js";

function usePlugin<O>(
	handle: VidePlayerHandle,
	factory: (opts: O) => Plugin,
	options: O,
): void {
	const optionsRef = useRef(options);
	optionsRef.current = options;

	useEffect(() => {
		const player = handle.current;
		if (!player) return;
		const plugin = factory(optionsRef.current);
		const cleanup = plugin.setup(player);
		return () => {
			cleanup?.();
		};
	}, [handle.current, factory]);
}

export function useHls(
	handle: VidePlayerHandle,
	options?: HlsPluginOptions,
): void {
	usePlugin(handle, hls, options ?? {});
}

export function useDash(
	handle: VidePlayerHandle,
	options?: DashPluginOptions,
): void {
	usePlugin(handle, dash, options ?? {});
}

export function useDrm(
	handle: VidePlayerHandle,
	options: DrmPluginOptions,
): void {
	usePlugin(handle, drm, options);
}

export function useVast(
	handle: VidePlayerHandle,
	options: VastPluginOptions,
): void {
	usePlugin(handle, vast, options);
}

export function useVmap(
	handle: VidePlayerHandle,
	options: VmapPluginOptions,
): void {
	usePlugin(handle, vmap, options);
}

export function useSsai(
	handle: VidePlayerHandle,
	options?: SsaiPluginOptions,
): void {
	usePlugin(handle, ssai, options ?? {});
}

export function useUi(
	handle: VidePlayerHandle,
	options: UiPluginOptions,
): void {
	usePlugin(handle, ui, options);
}
