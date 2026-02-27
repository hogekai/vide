import type { Player, Plugin, SourceHandler } from "../types.js";
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
								code: 0,
								message: "HLS is not supported in this browser",
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
										code: 1,
										message: `HLS fatal error: ${data.type} - ${data.details}`,
									});
								}
							},
						);

						instance.attachMedia(videoElement);
						instance.loadSource(url);
					})
					.catch((err: unknown) => {
						if (destroyed) return;
						player.emit("error", {
							code: 0,
							message:
								err instanceof Error
									? `Failed to load hls.js: ${err.message}`
									: "Failed to load hls.js",
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
