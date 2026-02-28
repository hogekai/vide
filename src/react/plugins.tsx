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
import { vast } from "../vast/index.js";
import type { VastPluginOptions } from "../vast/types.js";
import { vmap } from "../vmap/index.js";
import type { VmapPluginOptions } from "../vmap/types.js";
import { useVideContext } from "./context.js";

function createPluginComponent<O>(name: string, factory: (opts: O) => Plugin) {
	function Component(props: O): null {
		const player = useVideContext();
		const optionsRef = useRef(props);
		optionsRef.current = props;

		useEffect(() => {
			const plugin = factory(optionsRef.current);
			const cleanup = plugin.setup(player);
			return () => {
				cleanup?.();
			};
		}, [player, factory]);

		return null;
	}
	Component.displayName = name;
	return Component;
}

export const HlsPlugin = createPluginComponent<HlsPluginOptions>(
	"HlsPlugin",
	hls,
);
export const DashPlugin = createPluginComponent<DashPluginOptions>(
	"DashPlugin",
	dash,
);
export const DrmPlugin = createPluginComponent<DrmPluginOptions>(
	"DrmPlugin",
	drm,
);
export const VastPlugin = createPluginComponent<VastPluginOptions>(
	"VastPlugin",
	vast,
);
export const VmapPlugin = createPluginComponent<VmapPluginOptions>(
	"VmapPlugin",
	vmap,
);
export const SsaiPlugin = createPluginComponent<SsaiPluginOptions>(
	"SsaiPlugin",
	ssai,
);
