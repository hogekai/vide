import type { RecoveryConfig } from "../types.js";

export interface HlsPluginOptions {
	/** Configuration passed directly to the hls.js constructor. */
	hlsConfig?: Record<string, unknown> | undefined;
	/** Error recovery settings. `false` to disable. Defaults to enabled (3 retries, 3s delay, 2x backoff). */
	recovery?: Partial<RecoveryConfig> | false | undefined;
}
