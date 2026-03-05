import type { PlayReadyConfig } from "./types.js";

/** Generate hls.js config fragment for PlayReady DRM. */
export function playreadyHlsConfig(
	config: PlayReadyConfig,
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
			"com.microsoft.playready": systemConfig,
		},
	};
}

/** Generate dash.js settings fragment for PlayReady DRM. */
export function playreadyDashConfig(
	config: PlayReadyConfig,
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
					"com.microsoft.playready": protEntry,
				},
			},
		},
	};
}
