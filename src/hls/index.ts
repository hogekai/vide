import {
	ERR_HLS_FATAL,
	ERR_HLS_IMPORT,
	ERR_HLS_UNSUPPORTED,
} from "../errors.js";
import { qualityLabel } from "../quality.js";
import type { Player, Plugin, QualityLevel, SourceHandler } from "../types.js";
import type { HlsPluginOptions } from "./types.js";

export type { HlsPluginOptions } from "./types.js";

const HLS_MIME_TYPES = [
	"application/vnd.apple.mpegurl",
	"application/x-mpegurl",
];

function isHlsUrl(url: string): boolean {
	if (url.startsWith("data:")) {
		const mimeEnd = url.indexOf(";");
		if (mimeEnd === -1) return false;
		return HLS_MIME_TYPES.includes(url.slice(5, mimeEnd).toLowerCase());
	}
	if (url.startsWith("blob:")) {
		// Blob URLs carry no file extension; check for an explicit
		// fragment hint (e.g. blob:...#.m3u8) that callers can append.
		return url.includes(".m3u8");
	}
	try {
		const pathname = new URL(url, "https://placeholder.invalid").pathname;
		return pathname.endsWith(".m3u8");
	} catch {
		return url.includes(".m3u8");
	}
}

function isHlsType(type: string): boolean {
	return HLS_MIME_TYPES.includes(type.toLowerCase());
}

/** Minimal interface to avoid importing hls.js types at compile time. */
interface HlsLike {
	destroy(): void;
	readonly levels: HlsLevel[];
	currentLevel: number;
	readonly autoLevelEnabled: boolean;
}

interface HlsLevel {
	height: number;
	width: number;
	bitrate: number;
}

interface HlsErrorData {
	fatal: boolean;
	type: string;
	details: string;
}

/** Create an HLS streaming plugin for vide. */
export function hls(options: HlsPluginOptions = {}): Plugin {
	return {
		name: "hls",
		setup(player: Player): () => void {
			let hlsInstance: HlsLike | null = null;
			let destroyed = false;

			const handler: SourceHandler = {
				canHandle(url: string, type?: string): boolean {
					if (type && isHlsType(type)) return true;
					return isHlsUrl(url);
				},

				load(url: string, videoElement: HTMLVideoElement): void {
					this.unload(videoElement);
					loadWithHlsJs(url, videoElement);
				},

				unload(_videoElement: HTMLVideoElement): void {
					if (hlsInstance) {
						hlsInstance.destroy();
						hlsInstance = null;
					}
				},
			};

			function loadWithHlsJs(
				url: string,
				videoElement: HTMLVideoElement,
			): void {
				import("hls.js")
					.then((HlsModule) => {
						if (destroyed) return;

						const Hls = HlsModule.default;

						if (!Hls.isSupported()) {
							// hls.js not supported (e.g. Safari) — fall back
							// to native HLS if available.
							if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
								videoElement.src = url;
								return;
							}
							player.emit("error", {
								code: ERR_HLS_UNSUPPORTED,
								message: "HLS is not supported in this browser",
								source: "hls",
							});
							return;
						}

						const drmData = player.getPluginData("drm") as
							| { hlsConfig?: Record<string, unknown> }
							| undefined;
						const mergedConfig = {
							...((options.hlsConfig as object) ?? {}),
							...(drmData?.hlsConfig ?? {}),
						};
						const instance = new Hls(mergedConfig);
						hlsInstance = instance as HlsLike;
						player.setPluginData("hls", instance);

						instance.on(
							Hls.Events.ERROR,
							(_event: string, data: HlsErrorData) => {
								if (data.fatal) {
									player.emit("error", {
										code: ERR_HLS_FATAL,
										message: `HLS fatal error: ${data.type} - ${data.details}`,
										source: "hls",
									});
								}
							},
						);

						instance.on(Hls.Events.MANIFEST_PARSED, () => {
							const qualities: QualityLevel[] = instance.levels.map(
								(level: HlsLevel, index: number) => ({
									id: index,
									width: level.width,
									height: level.height,
									bitrate: level.bitrate,
									label: qualityLabel(level.height),
								}),
							);
							player.setPluginData("qualities", qualities);
							player.setPluginData("qualitySetter", (id: number) => {
								instance.currentLevel = id;
								player.setPluginData("autoQuality", id === -1);
							});
						});

						instance.on(
							Hls.Events.LEVEL_SWITCHED,
							(_event: string, data: { level: number }) => {
								const qualities = player.qualities;
								const quality = qualities[data.level];
								if (quality) {
									player.setPluginData("currentQuality", quality);
									player.setPluginData(
										"autoQuality",
										instance.autoLevelEnabled,
									);
								}
							},
						);

						instance.attachMedia(videoElement);
						instance.loadSource(url);
					})
					.catch((err: unknown) => {
						if (destroyed) return;
						player.emit("error", {
							code: ERR_HLS_IMPORT,
							message:
								err instanceof Error
									? `Failed to load hls.js: ${err.message}`
									: "Failed to load hls.js",
							source: "hls",
						});
					});
			}

			player.registerSourceHandler(handler);

			return () => {
				destroyed = true;
				handler.unload(player.el);
			};
		},
	};
}
