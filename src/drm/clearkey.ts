import type { ClearKeyConfig } from "./types.js";

/**
 * Build a JSON Web Key Set string from a keyId→key map.
 * Both keyId and key values must be base64url-encoded.
 */
export function buildClearKeyJwk(keys: Record<string, string>): string {
	const jwks = Object.entries(keys).map(([kid, k]) => ({
		kty: "oct",
		kid,
		k,
	}));
	return JSON.stringify({ keys: jwks });
}

/**
 * Build a ClearKey license response (Uint8Array) from a keyId→key map.
 * Used by the standalone EME handler when no license server is needed.
 */
export function buildClearKeyLicense(keys: Record<string, string>): Uint8Array {
	return new TextEncoder().encode(buildClearKeyJwk(keys));
}

/** Generate hls.js config fragment for ClearKey DRM. */
export function clearkeyHlsConfig(
	config: ClearKeyConfig,
): Record<string, unknown> {
	const jwk = buildClearKeyJwk(config.keys);
	const dataUri = `data:application/json;base64,${btoa(jwk)}`;
	return {
		emeEnabled: true,
		drmSystems: {
			clearkey: {
				licenseUrl: dataUri,
			},
		},
	};
}

/** Generate dash.js settings fragment for ClearKey DRM. */
export function clearkeyDashConfig(
	config: ClearKeyConfig,
): Record<string, unknown> {
	return {
		streaming: {
			protection: {
				data: {
					clearkey: {
						clearkeys: config.keys,
					},
				},
			},
		},
	};
}
