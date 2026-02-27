import type { Player, Plugin } from "../types.js";
import { dashDrmConfig, hlsDrmConfig } from "./bridge.js";
import { detectKeySystem } from "./detect.js";
import type {
	DrmPluginOptions,
	KeySystem,
	ResolvedDrmConfig,
} from "./types.js";

export type {
	DrmPluginOptions,
	FairPlayConfig,
	KeySystem,
	ResolvedDrmConfig,
	WidevineConfig,
} from "./types.js";
export { detectKeySystem } from "./detect.js";
export { dashDrmConfig, hlsDrmConfig } from "./bridge.js";

/** Create a DRM plugin for vide. */
export function drm(options: DrmPluginOptions): Plugin {
	return {
		name: "drm",
		setup(player: Player): () => void {
			let destroyed = false;

			// Build candidate list from provided options.
			const candidates: KeySystem[] = [];
			if (options.widevine) candidates.push("com.widevine.alpha");
			if (options.fairplay) candidates.push("com.apple.fps.1_0");

			if (candidates.length === 0) {
				console.warn("[vide/drm] No DRM configuration provided");
				return () => {};
			}

			// Detect key system eagerly at setup time.
			detectKeySystem(candidates)
				.then((keySystem) => {
					if (destroyed) return;
					if (!keySystem) {
						player.emit("error", {
							code: 0,
							message: "No supported DRM key system found",
						});
						return;
					}
					const input = {
						keySystem,
						widevine: options.widevine,
						fairplay: options.fairplay,
					};
					const resolved: ResolvedDrmConfig = {
						keySystem,
						hlsConfig: hlsDrmConfig(input),
						dashConfig: dashDrmConfig(input),
					};
					player.setPluginData("drm", resolved);
				})
				.catch((err: unknown) => {
					if (destroyed) return;
					player.emit("error", {
						code: 0,
						message:
							err instanceof Error
								? `DRM detection failed: ${err.message}`
								: "DRM detection failed",
					});
				});

			return () => {
				destroyed = true;
			};
		},
	};
}
