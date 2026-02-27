import { fairplayDashConfig, fairplayHlsConfig } from "./fairplay.js";
import type { FairPlayConfig, KeySystem, WidevineConfig } from "./types.js";
import { widevineDashConfig, widevineHlsConfig } from "./widevine.js";

interface BridgeInput {
	keySystem: KeySystem;
	widevine?: WidevineConfig | undefined;
	fairplay?: FairPlayConfig | undefined;
}

/** Generate hls.js config fragment from resolved DRM info. */
export function hlsDrmConfig(input: BridgeInput): Record<string, unknown> {
	if (input.keySystem === "com.widevine.alpha" && input.widevine) {
		return widevineHlsConfig(input.widevine);
	}
	if (input.keySystem === "com.apple.fps.1_0" && input.fairplay) {
		return fairplayHlsConfig(input.fairplay);
	}
	return {};
}

/** Generate dash.js settings fragment from resolved DRM info. */
export function dashDrmConfig(input: BridgeInput): Record<string, unknown> {
	if (input.keySystem === "com.widevine.alpha" && input.widevine) {
		return widevineDashConfig(input.widevine);
	}
	if (input.keySystem === "com.apple.fps.1_0" && input.fairplay) {
		return fairplayDashConfig(input.fairplay);
	}
	return {};
}
