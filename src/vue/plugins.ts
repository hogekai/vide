import { defineComponent, onScopeDispose, watch } from "vue";
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

function createPluginComponent<O>(
	name: string,
	factory: (opts: O) => Plugin,
	propNames: string[],
) {
	return defineComponent({
		name,
		props: propNames.reduce(
			(acc, key) => {
				acc[key] = null;
				return acc;
			},
			{} as Record<string, null>,
		),
		setup(props) {
			const player = useVideContext();
			let cleanup: (() => void) | undefined;

			watch(
				player,
				(p) => {
					cleanup?.();
					cleanup = undefined;
					if (!p) return;
					const plugin = factory({ ...props } as unknown as O);
					cleanup = plugin.setup(p) ?? undefined;
				},
				{ immediate: true },
			);

			onScopeDispose(() => {
				cleanup?.();
			});

			return () => null;
		},
	});
}

export const VideHlsPlugin = createPluginComponent<HlsPluginOptions>(
	"VideHlsPlugin",
	hls,
	["hlsConfig", "recovery"],
);

export const VideDashPlugin = createPluginComponent<DashPluginOptions>(
	"VideDashPlugin",
	dash,
	["dashConfig", "recovery"],
);

export const VideDrmPlugin = createPluginComponent<DrmPluginOptions>(
	"VideDrmPlugin",
	drm,
	["widevine", "fairplay"],
);

export const VideVastPlugin = createPluginComponent<VastPluginOptions>(
	"VideVastPlugin",
	vast,
	["tagUrl", "timeout", "allowSkip", "adPlugins"],
);

export const VideVmapPlugin = createPluginComponent<VmapPluginOptions>(
	"VideVmapPlugin",
	vmap,
	["url", "timeout", "vastOptions", "adPlugins"],
);

export const VideSsaiPlugin = createPluginComponent<SsaiPluginOptions>(
	"VideSsaiPlugin",
	ssai,
	["tolerance", "parser"],
);
