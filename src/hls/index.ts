import type { Player, Plugin, SourceHandler } from "../types.js";
import type { HlsPluginOptions } from "./types.js";

export type { HlsPluginOptions } from "./types.js";

const HLS_MIME_TYPES = [
	"application/vnd.apple.mpegurl",
	"application/x-mpegurl",
];

function isHlsUrl(url: string): boolean {
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

					// Safari/iOS: native HLS support
					if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
						videoElement.src = url;
						return;
					}

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
							player.emit("error", {
								code: 0,
								message: "HLS is not supported in this browser",
							});
							return;
						}

						const instance = new Hls((options.hlsConfig as object) ?? {});
						hlsInstance = instance as HlsLike;

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
