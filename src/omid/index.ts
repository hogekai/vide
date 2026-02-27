import type { Player, Plugin } from "../types.js";
import { createOmidBridge } from "./bridge.js";
import { loadOmSdk } from "./loader.js";
import { createOmidSession } from "./session.js";
import type { OmidPluginOptions } from "./types.js";

export type { OmidPluginOptions } from "./types.js";

/** Create an OMID (Open Measurement) plugin for vide. */
export function omid(options: OmidPluginOptions): Plugin {
	return {
		name: "omid",
		setup(player: Player) {
			if (options.verifications.length === 0) return;

			let aborted = false;
			let bridgeCleanup: (() => void) | null = null;
			let sessionRef: ReturnType<typeof createOmidSession> | null = null;

			const timeout = options.timeout ?? 5000;

			// Preload SDK immediately on use()
			const sdkPromise = loadOmSdk(
				options.serviceScriptUrl,
				options.sessionClientUrl,
				timeout,
			).catch((err) => {
				// Store the error, will be handled on ad:start
				return err as Error;
			});

			async function onAdStart(): Promise<void> {
				player.off("ad:start", onAdStart);
				if (aborted) return;

				try {
					const sdkOrError = await sdkPromise;
					if (aborted) return;

					if (sdkOrError instanceof Error) {
						throw sdkOrError;
					}

					const sdk = sdkOrError;
					const session = createOmidSession(sdk, player.el, options);
					sessionRef = session;
					if (aborted) {
						session.finish();
						return;
					}

					const didStart = await session.waitForStart(timeout);
					if (aborted) {
						session.finish();
						return;
					}
					if (!didStart) {
						console.warn("[vide:omid] Session start timed out");
						session.finish();
						return;
					}

					const adDuration = Number.isFinite(player.el.duration)
						? player.el.duration
						: 0;

					bridgeCleanup = createOmidBridge(player, session, adDuration);
				} catch (err) {
					if (aborted) return;
					console.warn(
						"[vide:omid] Failed to initialize:",
						err instanceof Error ? err.message : String(err),
					);
					player.emit("ad:error", {
						error: err instanceof Error ? err : new Error(String(err)),
					});
				}
			}

			player.on("ad:start", onAdStart);

			return () => {
				aborted = true;
				player.off("ad:start", onAdStart);
				if (bridgeCleanup) {
					bridgeCleanup();
					bridgeCleanup = null;
				}
				if (sessionRef) {
					sessionRef.finish();
					sessionRef = null;
				}
			};
		},
	};
}
