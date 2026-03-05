// ── Plugin Data Value Types ───────────────────────────────────
// Minimal interfaces for plugin data values stored via setPluginData.
// Each matches the subset of the real library type that cross-plugin
// consumers actually need. Separated from types.ts to keep core types clean.

/** Minimal hls.js instance shape stored via pluginData. */
export interface PluginHlsInstance {
	destroy(): void;
	readonly levels: Array<{ height: number; width: number; bitrate: number }>;
	currentLevel: number;
	readonly autoLevelEnabled: boolean;
	recoverMediaError(): void;
	startLoad(startPosition: number): void;
	on(event: string, handler: (...args: unknown[]) => void): void;
	off(event: string, handler: (...args: unknown[]) => void): void;
}

/** Minimal dash.js instance shape stored via pluginData. */
export interface PluginDashInstance {
	initialize(
		view: HTMLMediaElement,
		source: string,
		autoPlay: boolean,
	): void;
	updateSettings(settings: Record<string, unknown>): void;
	// biome-ignore lint/suspicious/noExplicitAny: dashjs event data varies by event type
	on(type: string, listener: (e: any) => void): void;
	// biome-ignore lint/suspicious/noExplicitAny: dashjs event data varies by event type
	off(type: string, listener: (e: any) => void): void;
	destroy(): void;
	reset(): void;
	getBitrateInfoListFor(
		type: string,
	): Array<{
		qualityIndex: number;
		width: number;
		height: number;
		bitrate: number;
	}>;
	setQualityFor(type: string, value: number, replace?: boolean): void;
	getSettings(): Record<string, unknown>;
}

/** Resolved DRM configuration stored via pluginData. */
export interface PluginDrmConfig {
	keySystem: string;
	hlsConfig: Record<string, unknown>;
	dashConfig: Record<string, unknown>;
}

/** IMA SDK data stored via pluginData. */
export interface PluginImaData {
	adsManager: unknown;
	adsLoader: unknown;
	adDisplayContainer: unknown;
	requestAds(adTagUrl?: string): void;
}
