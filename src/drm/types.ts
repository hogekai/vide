/** Retry configuration for license requests and certificate fetching. */
export interface DrmRetryConfig {
	maxAttempts?: number | undefined;
	delayMs?: number | undefined;
	backoff?: number | undefined;
}

/** Widevine DRM configuration. */
export interface WidevineConfig {
	licenseUrl: string;
	/** Server certificate URL. Avoids an extra round-trip (individualization request). */
	certificateUrl?: string | undefined;
	headers?: Record<string, string> | undefined;
	/**
	 * Robustness level for content decryption.
	 * Common values: "SW_SECURE_CRYPTO", "SW_SECURE_DECODE", "HW_SECURE_CRYPTO", "HW_SECURE_DECODE", "HW_SECURE_ALL"
	 */
	robustness?: string | undefined;
	/** Encryption scheme: "cenc" (AES-CTR) or "cbcs" (AES-CBC). */
	encryptionScheme?: "cenc" | "cbcs" | "cbcs-1-9" | undefined;
	retry?: DrmRetryConfig | undefined;
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
	/** Encryption scheme. FairPlay typically uses "cbcs". */
	encryptionScheme?: "cenc" | "cbcs" | "cbcs-1-9" | undefined;
	retry?: DrmRetryConfig | undefined;
	/** Transform init data before generateRequest(). Used for vendor-specific content ID extraction. */
	transformInitData?:
		| ((
				initData: Uint8Array,
				initDataType: string,
		  ) => Uint8Array | Promise<Uint8Array>)
		| undefined;
	prepareLicenseRequest?:
		| ((payload: Uint8Array) => Uint8Array | Promise<Uint8Array>)
		| undefined;
	processLicenseResponse?:
		| ((response: Uint8Array) => Uint8Array | Promise<Uint8Array>)
		| undefined;
}

/** PlayReady DRM configuration. */
export interface PlayReadyConfig {
	licenseUrl: string;
	headers?: Record<string, string> | undefined;
	/**
	 * Robustness level. Common values: "150", "2000", "3000"
	 */
	robustness?: string | undefined;
	/** Encryption scheme: "cenc" or "cbcs". */
	encryptionScheme?: "cenc" | "cbcs" | "cbcs-1-9" | undefined;
	retry?: DrmRetryConfig | undefined;
	prepareLicenseRequest?:
		| ((payload: Uint8Array) => Uint8Array | Promise<Uint8Array>)
		| undefined;
	processLicenseResponse?:
		| ((response: Uint8Array) => Uint8Array | Promise<Uint8Array>)
		| undefined;
}

/** ClearKey DRM configuration (no license server required). */
export interface ClearKeyConfig {
	/** Map of key IDs to keys, both as base64url-encoded strings. */
	keys: Record<string, string>;
}

/** Options for the DRM plugin. */
export interface DrmPluginOptions {
	widevine?: WidevineConfig | undefined;
	fairplay?: FairPlayConfig | undefined;
	playready?: PlayReadyConfig | undefined;
	clearkey?: ClearKeyConfig | undefined;
}

/** Key system identifier string. */
export type KeySystem =
	| "com.widevine.alpha"
	| "com.apple.fps.1_0"
	| "com.microsoft.playready"
	| "com.microsoft.playready.recommendation"
	| "org.w3.clearkey";

/** Resolved DRM configuration stored via setPluginData("drm"). */
export interface ResolvedDrmConfig {
	keySystem: KeySystem;
	hlsConfig: Record<string, unknown>;
	dashConfig: Record<string, unknown>;
}
