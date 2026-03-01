import { ERR_DASH_IMPORT, ERR_DASH_PLAYBACK } from "../errors.js";
import { qualityLabel } from "../quality.js";
import type {
	MediaElement,
	Plugin,
	PluginPlayer,
	QualityLevel,
	RecoveryConfig,
	SourceHandler,
} from "../types.js";
import type { DashPluginOptions } from "./types.js";

export type { DashPluginOptions } from "./types.js";

const DASH_MIME_TYPE = "application/dash+xml";

const DEFAULT_RECOVERY: RecoveryConfig = {
	maxRetries: 3,
	retryDelay: 3000,
	backoffMultiplier: 2,
};

function isDashUrl(url: string): boolean {
	try {
		const pathname = new URL(url, "https://placeholder.invalid").pathname;
		return pathname.endsWith(".mpd");
	} catch {
		return url.includes(".mpd");
	}
}

function isDashType(type: string): boolean {
	return type.toLowerCase() === DASH_MIME_TYPE;
}

/** Minimal interface to avoid importing dashjs types at compile time. */
interface DashMediaPlayerLike {
	initialize(view: HTMLMediaElement, source: string, autoPlay: boolean): void;
	updateSettings(settings: Record<string, unknown>): void;
	// biome-ignore lint/suspicious/noExplicitAny: dashjs event data varies by event type
	on(type: string, listener: (e: any) => void): void;
	destroy(): void;
	reset(): void;
	getBitrateInfoListFor(type: string): DashBitrateInfo[];
	setQualityFor(type: string, value: number, replace?: boolean): void;
	getSettings(): Record<string, unknown>;
}

interface DashBitrateInfo {
	qualityIndex: number;
	width: number;
	height: number;
	bitrate: number;
}

interface DashErrorEvent {
	error: string | { code: number; message: string; data?: unknown };
}

/** Create a DASH streaming plugin for vide. */
export function dash(options: DashPluginOptions = {}): Plugin {
	return {
		name: "dash",
		setup(player: PluginPlayer): () => void {
			let dashInstance: DashMediaPlayerLike | null = null;
			let destroyed = false;

			const recoveryConfig: RecoveryConfig | false =
				options.recovery === false
					? false
					: { ...DEFAULT_RECOVERY, ...(options.recovery ?? {}) };
			let retryCount = 0;
			let recoveryTimer: ReturnType<typeof setTimeout> | null = null;
			let currentUrl = "";
			let currentVideoElement: MediaElement | null = null;

			function clearRecoveryTimer(): void {
				if (recoveryTimer !== null) {
					clearTimeout(recoveryTimer);
					recoveryTimer = null;
				}
			}

			function attemptRecovery(instance: DashMediaPlayerLike): boolean {
				if (recoveryConfig === false || destroyed) return false;
				if (retryCount >= recoveryConfig.maxRetries) return false;
				if (!currentVideoElement) return false;

				retryCount++;
				const delay =
					recoveryConfig.retryDelay *
					recoveryConfig.backoffMultiplier ** (retryCount - 1);

				clearRecoveryTimer();
				recoveryTimer = setTimeout(() => {
					if (destroyed || !currentVideoElement) return;
					instance.reset();
					instance.initialize(
						currentVideoElement,
						currentUrl,
						currentVideoElement.autoplay,
					);
				}, delay);

				return true;
			}

			const handler: SourceHandler = {
				canHandle(url: string, type?: string): boolean {
					if (type && isDashType(type)) return true;
					return isDashUrl(url);
				},

				load(url: string, videoElement: MediaElement): void {
					this.unload(videoElement);
					loadWithDashJs(url, videoElement);
				},

				unload(_videoElement: MediaElement): void {
					clearRecoveryTimer();
					retryCount = 0;
					currentUrl = "";
					currentVideoElement = null;
					if (dashInstance) {
						dashInstance.destroy();
						dashInstance = null;
					}
				},
			};

			function loadWithDashJs(url: string, videoElement: MediaElement): void {
				currentUrl = url;
				currentVideoElement = videoElement;

				import("dashjs")
					.then((dashjsModule) => {
						if (destroyed) return;

						const djsNamespace = dashjsModule.default;
						const instance = djsNamespace
							.MediaPlayer()
							.create() as unknown as DashMediaPlayerLike;
						dashInstance = instance;
						player.setPluginData("dash", instance);

						const drmData = player.getPluginData("drm") as
							| { dashConfig?: Record<string, unknown> }
							| undefined;
						if (drmData?.dashConfig) {
							instance.updateSettings(drmData.dashConfig);
						}
						if (options.dashConfig) {
							instance.updateSettings(options.dashConfig);
						}

						instance.on(
							djsNamespace.MediaPlayer.events.ERROR,
							(e: DashErrorEvent) => {
								if (typeof e.error === "object" && e.error !== null) {
									const recovering = attemptRecovery(instance);

									player.emit("error", {
										code: e.error.code,
										message: e.error.message,
										source: "dash",
										recoverable: recovering,
										retryCount: recovering ? retryCount : undefined,
									});
								} else {
									player.emit("error", {
										code: ERR_DASH_PLAYBACK,
										message: `DASH error: ${String(e.error)}`,
										source: "dash",
									});
								}
							},
						);

						instance.on(
							djsNamespace.MediaPlayer.events.STREAM_INITIALIZED,
							() => {
								if (retryCount > 0) {
									retryCount = 0;
									clearRecoveryTimer();
								}

								const bitrateList = instance.getBitrateInfoListFor("video");
								const qualities: QualityLevel[] = bitrateList.map(
									(info: DashBitrateInfo) => ({
										id: info.qualityIndex,
										width: info.width,
										height: info.height,
										bitrate: info.bitrate,
										label: qualityLabel(info.height),
									}),
								);
								player.setPluginData("qualities", qualities);
								player.setPluginData("qualitySetter", (id: number) => {
									if (id === -1) {
										instance.updateSettings({
											streaming: {
												abr: {
													autoSwitchBitrate: { video: true },
												},
											},
										});
									} else {
										instance.updateSettings({
											streaming: {
												abr: {
													autoSwitchBitrate: { video: false },
												},
											},
										});
										instance.setQualityFor("video", id, true);
									}
									player.setPluginData("autoQuality", id === -1);
								});
							},
						);

						instance.on(
							djsNamespace.MediaPlayer.events.QUALITY_CHANGE_RENDERED,
							(e: {
								mediaType: string;
								oldQuality: number;
								newQuality: number;
							}) => {
								if (e.mediaType !== "video") return;
								const qualities = player.qualities;
								const quality = qualities.find((q) => q.id === e.newQuality);
								if (quality) {
									player.setPluginData("currentQuality", quality);
									const settings = instance.getSettings() as {
										streaming?: {
											abr?: {
												autoSwitchBitrate?: { video?: boolean };
											};
										};
									};
									player.setPluginData(
										"autoQuality",
										settings?.streaming?.abr?.autoSwitchBitrate?.video ?? true,
									);
								}
							},
						);

						instance.initialize(videoElement, url, videoElement.autoplay);
					})
					.catch((err: unknown) => {
						if (destroyed) return;
						player.emit("error", {
							code: ERR_DASH_IMPORT,
							message:
								err instanceof Error
									? `Failed to load dashjs: ${err.message}`
									: "Failed to load dashjs",
							source: "dash",
						});
					});
			}

			player.registerSourceHandler(handler);

			return () => {
				destroyed = true;
				clearRecoveryTimer();
				handler.unload(player.el);
			};
		},
	};
}
