import {
	ERR_DRM_DETECTION,
	ERR_DRM_LICENSE,
	ERR_DRM_UNSUPPORTED,
} from "../errors.js";
import type { Plugin, PluginPlayer } from "../types.js";
import { dashDrmConfig, hlsDrmConfig } from "./bridge.js";
import { detectKeySystem } from "./detect.js";
import { setupEme } from "./eme.js";
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
export { setupEme } from "./eme.js";

/** Create a DRM plugin for vide. */
export function drm(options: DrmPluginOptions): Plugin {
	return {
		name: "drm",
		setup(player: PluginPlayer): () => void {
			let destroyed = false;
			let emeCleanup: (() => void) | undefined;

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
							code: ERR_DRM_UNSUPPORTED,
							message: "No supported DRM key system found",
							source: "drm",
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

					// Set up standalone EME fallback for direct MP4 playback.
					const isFairPlay = keySystem !== "com.widevine.alpha";
					const config = isFairPlay ? options.fairplay : options.widevine;
					if (!config) return;
					const emeOpts: import("./eme.js").EmeOptions = {
						keySystem,
						licenseUrl: config.licenseUrl,
						headers: config.headers,
						prepareLicenseRequest: config.prepareLicenseRequest,
						processLicenseResponse: config.processLicenseResponse,
					};
					if (isFairPlay) {
						emeOpts.certificateUrl = (
							config as import("./types.js").FairPlayConfig
						).certificateUrl;
					}
					emeCleanup = setupEme(player.el, emeOpts, (err) => {
						if (!destroyed)
							player.emit("error", {
								code: ERR_DRM_LICENSE,
								message: err.message,
								source: "drm",
							});
					});
				})
				.catch((err: unknown) => {
					if (destroyed) return;
					player.emit("error", {
						code: ERR_DRM_DETECTION,
						message:
							err instanceof Error
								? `DRM detection failed: ${err.message}`
								: "DRM detection failed",
						source: "drm",
					});
				});

			return () => {
				destroyed = true;
				emeCleanup?.();
			};
		},
	};
}
