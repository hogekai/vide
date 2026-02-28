import { ERR_DASH_IMPORT, ERR_DASH_PLAYBACK } from "../errors.js";
import type { Player, Plugin, SourceHandler } from "../types.js";
import type { DashPluginOptions } from "./types.js";

export type { DashPluginOptions } from "./types.js";

const DASH_MIME_TYPE = "application/dash+xml";

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
	on(type: string, listener: (e: DashErrorEvent) => void): void;
	destroy(): void;
}

interface DashErrorEvent {
	error: string | { code: number; message: string; data?: unknown };
}

/** Create a DASH streaming plugin for vide. */
export function dash(options: DashPluginOptions = {}): Plugin {
	return {
		name: "dash",
		setup(player: Player): () => void {
			let dashInstance: DashMediaPlayerLike | null = null;
			let destroyed = false;

			const handler: SourceHandler = {
				canHandle(url: string, type?: string): boolean {
					if (type && isDashType(type)) return true;
					return isDashUrl(url);
				},

				load(url: string, videoElement: HTMLVideoElement): void {
					this.unload(videoElement);
					loadWithDashJs(url, videoElement);
				},

				unload(_videoElement: HTMLVideoElement): void {
					if (dashInstance) {
						dashInstance.destroy();
						dashInstance = null;
					}
				},
			};

			function loadWithDashJs(
				url: string,
				videoElement: HTMLVideoElement,
			): void {
				import("dashjs")
					.then((dashjsModule) => {
						if (destroyed) return;

						const djsNamespace = dashjsModule.default;
						const instance = djsNamespace
							.MediaPlayer()
							.create() as DashMediaPlayerLike;
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
									player.emit("error", {
										code: e.error.code,
										message: e.error.message,
										source: "dash",
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
				handler.unload(player.el);
			};
		},
	};
}
