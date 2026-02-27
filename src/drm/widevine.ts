import type { WidevineConfig } from "./types.js";

/** Generate hls.js config fragment for Widevine DRM. */
export function widevineHlsConfig(
	config: WidevineConfig,
): Record<string, unknown> {
	const systemConfig: Record<string, unknown> = {
		licenseUrl: config.licenseUrl,
	};

	if (config.headers) {
		const headers = config.headers;
		systemConfig.licenseXhrSetup = (xhr: XMLHttpRequest) => {
			for (const [key, value] of Object.entries(headers)) {
				xhr.setRequestHeader(key, value);
			}
		};
	}

	return {
		emeEnabled: true,
		drmSystems: {
			"com.widevine.alpha": systemConfig,
		},
	};
}

/** Generate dash.js settings fragment for Widevine DRM. */
export function widevineDashConfig(
	config: WidevineConfig,
): Record<string, unknown> {
	const protEntry: Record<string, unknown> = {
		serverURL: config.licenseUrl,
	};
	if (config.headers) {
		protEntry.httpRequestHeaders = config.headers;
	}
	return {
		streaming: {
			protection: {
				data: {
					"com.widevine.alpha": protEntry,
				},
			},
		},
	};
}
