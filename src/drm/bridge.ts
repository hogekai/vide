import { clearkeyDashConfig, clearkeyHlsConfig } from "./clearkey.js";
import { fairplayDashConfig, fairplayHlsConfig } from "./fairplay.js";
import { playreadyDashConfig, playreadyHlsConfig } from "./playready.js";
import type {
	ClearKeyConfig,
	FairPlayConfig,
	KeySystem,
	PlayReadyConfig,
	WidevineConfig,
} from "./types.js";
import { widevineDashConfig, widevineHlsConfig } from "./widevine.js";

interface BridgeInput {
	keySystem: KeySystem;
	widevine?: WidevineConfig | undefined;
	fairplay?: FairPlayConfig | undefined;
	playready?: PlayReadyConfig | undefined;
	clearkey?: ClearKeyConfig | undefined;
}

/** Generate hls.js config fragment from resolved DRM info. */
export function hlsDrmConfig(input: BridgeInput): Record<string, unknown> {
	if (input.keySystem === "com.widevine.alpha" && input.widevine) {
		return widevineHlsConfig(input.widevine);
	}
	if (input.keySystem === "com.apple.fps.1_0" && input.fairplay) {
		return fairplayHlsConfig(input.fairplay);
	}
	if (
		(input.keySystem === "com.microsoft.playready" ||
			input.keySystem === "com.microsoft.playready.recommendation") &&
		input.playready
	) {
		return playreadyHlsConfig(input.playready);
	}
	if (input.keySystem === "org.w3.clearkey" && input.clearkey) {
		return clearkeyHlsConfig(input.clearkey);
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
	if (
		(input.keySystem === "com.microsoft.playready" ||
			input.keySystem === "com.microsoft.playready.recommendation") &&
		input.playready
	) {
		return playreadyDashConfig(input.playready);
	}
	if (input.keySystem === "org.w3.clearkey" && input.clearkey) {
		return clearkeyDashConfig(input.clearkey);
	}
	return {};
}
