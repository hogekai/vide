import {
	ERR_DRM_DETECTION,
	ERR_DRM_KEY_STATUS,
	ERR_DRM_LICENSE,
	ERR_DRM_UNSUPPORTED,
} from "../errors.js";
import type { Plugin, PluginPlayer } from "../types.js";
import { dashDrmConfig, hlsDrmConfig } from "./bridge.js";
import { detectKeySystem } from "./detect.js";
import type { EmeOptions } from "./eme.js";
import { setupEme } from "./eme.js";
import type {
	DrmPluginOptions,
	FairPlayConfig,
	KeySystem,
	PlayReadyConfig,
	ResolvedDrmConfig,
	WidevineConfig,
} from "./types.js";

/** Build EmeOptions from the resolved key system and plugin options. */
function buildEmeOptions(
	keySystem: KeySystem,
	options: DrmPluginOptions,
): EmeOptions | null {
	if (keySystem === "org.w3.clearkey") {
		if (!options.clearkey) return null;
		return { keySystem, clearkeys: options.clearkey.keys };
	}

	// Map key system → config object.
	type DrmConfig = WidevineConfig | FairPlayConfig | PlayReadyConfig;
	const configMap: Partial<Record<KeySystem, DrmConfig | undefined>> = {
		"com.widevine.alpha": options.widevine,
		"com.apple.fps.1_0": options.fairplay,
		"com.microsoft.playready": options.playready,
		"com.microsoft.playready.recommendation": options.playready,
	};
	const config = configMap[keySystem];
	if (!config) return null;

	const emeOpts: EmeOptions = {
		keySystem,
		licenseUrl: config.licenseUrl,
		headers: config.headers,
		prepareLicenseRequest: config.prepareLicenseRequest,
		processLicenseResponse: config.processLicenseResponse,
		retry: config.retry,
	};

	// Certificate URL (Widevine optional, FairPlay required).
	if ("certificateUrl" in config && config.certificateUrl) {
		emeOpts.certificateUrl = config.certificateUrl;
	}

	// Robustness (Widevine + PlayReady).
	if ("robustness" in config && config.robustness) {
		emeOpts.robustness = config.robustness;
	}

	// Encryption scheme (all except ClearKey).
	if ("encryptionScheme" in config && config.encryptionScheme) {
		emeOpts.encryptionScheme = config.encryptionScheme;
	}

	// FairPlay init data transform.
	if ("transformInitData" in config && config.transformInitData) {
		emeOpts.transformInitData = config.transformInitData;
	}

	return emeOpts;
}

export type {
	ClearKeyConfig,
	DrmPluginOptions,
	DrmRetryConfig,
	FairPlayConfig,
	KeySystem,
	PlayReadyConfig,
	ResolvedDrmConfig,
	WidevineConfig,
} from "./types.js";

export { detectKeySystem, queryDrmSupport } from "./detect.js";
export type { KeySystemCandidate } from "./detect.js";
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
			if (options.playready) {
				candidates.push("com.microsoft.playready.recommendation");
				candidates.push("com.microsoft.playready");
			}
			if (options.clearkey) candidates.push("org.w3.clearkey");

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
						playready: options.playready,
						clearkey: options.clearkey,
					};
					const resolved: ResolvedDrmConfig = {
						keySystem,
						hlsConfig: hlsDrmConfig(input),
						dashConfig: dashDrmConfig(input),
					};
					player.setPluginData("drm", resolved);

					// Set up standalone EME for direct MP4 / native HLS playback.
					const emeOpts = buildEmeOptions(keySystem, options);
					if (!emeOpts) return;

					// Wire key status events to the player event bus.
					emeOpts.onKeyStatus = (keyId, status) => {
						if (destroyed) return;
						player.emit("drm:keystatus", { keyId, status });
						if (status === "expired" || status === "internal-error") {
							player.emit("error", {
								code: ERR_DRM_KEY_STATUS,
								message: `Key status: ${status}`,
								source: "drm",
							});
						}
					};

					emeCleanup = setupEme(player.el, emeOpts, (err) => {
						if (!destroyed)
							player.emit("error", {
								code: ERR_DRM_LICENSE,
								message: err.message,
								source: "drm",
							});
					});

					player.emit("drm:ready", { keySystem });
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
