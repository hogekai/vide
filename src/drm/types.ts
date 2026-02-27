/** Widevine DRM configuration. */
export interface WidevineConfig {
	licenseUrl: string;
	headers?: Record<string, string> | undefined;
	prepareLicenseRequest?:
		| ((payload: Uint8Array) => Uint8Array | Promise<Uint8Array>)
		| undefined;
	processLicenseResponse?:
		| ((response: Uint8Array) => Uint8Array | Promise<Uint8Array>)
		| undefined;
}

/** FairPlay DRM configuration. */
export interface FairPlayConfig {
	licenseUrl: string;
	certificateUrl: string;
	headers?: Record<string, string> | undefined;
	prepareLicenseRequest?:
		| ((payload: Uint8Array) => Uint8Array | Promise<Uint8Array>)
		| undefined;
	processLicenseResponse?:
		| ((response: Uint8Array) => Uint8Array | Promise<Uint8Array>)
		| undefined;
}

/** Options for the DRM plugin. */
export interface DrmPluginOptions {
	widevine?: WidevineConfig | undefined;
	fairplay?: FairPlayConfig | undefined;
}

/** Key system identifier string. */
export type KeySystem = "com.widevine.alpha" | "com.apple.fps.1_0";

/** Resolved DRM configuration stored via setPluginData("drm"). */
export interface ResolvedDrmConfig {
	keySystem: KeySystem;
	hlsConfig: Record<string, unknown>;
	dashConfig: Record<string, unknown>;
}
