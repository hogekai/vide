import type { FairPlayConfig } from "./types.js";

/** Generate hls.js config fragment for FairPlay DRM. */
export function fairplayHlsConfig(
	config: FairPlayConfig,
): Record<string, unknown> {
	const systemConfig: Record<string, unknown> = {
		licenseUrl: config.licenseUrl,
		serverCertificateUrl: config.certificateUrl,
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
			"com.apple.fps.1_0": systemConfig,
		},
	};
}

/** Generate dash.js settings fragment for FairPlay DRM. */
export function fairplayDashConfig(
	config: FairPlayConfig,
): Record<string, unknown> {
	const protEntry: Record<string, unknown> = {
		serverURL: config.licenseUrl,
		serverCertificateURL: config.certificateUrl,
	};
	if (config.headers) {
		protEntry.httpRequestHeaders = config.headers;
	}
	return {
		streaming: {
			protection: {
				data: {
					"com.apple.fps.1_0": protEntry,
				},
			},
		},
	};
}
