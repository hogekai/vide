import type { RecoveryConfig } from "../types.js";

export interface DashPluginOptions {
	/** dash.js MediaPlayerSettingClass — passed to updateSettings(). */
	dashConfig?: Record<string, unknown> | undefined;
	/** Error recovery settings. `false` to disable. Defaults to enabled (3 retries, 3s delay, 2x backoff). */
	recovery?: Partial<RecoveryConfig> | false | undefined;
}
