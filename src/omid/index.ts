import type { Player } from "../types.js";
import type { AdPlugin, VastAd } from "../vast/types.js";
import { createOmidBridge } from "./bridge.js";
import { loadOmSdk } from "./loader.js";
import { createOmidSession } from "./session.js";
import type { OmidPluginOptions, OmidSessionOptions } from "./types.js";

export type { OmidPluginOptions } from "./types.js";

/** Create an OMID (Open Measurement) ad plugin for use with VAST adPlugins. */
export function omid(options: OmidPluginOptions): AdPlugin {
	return {
		name: "omid",
		setup(player: Player, ad: VastAd) {
			const verifications = ad.verifications ?? [];
			if (verifications.length === 0) return;

			let aborted = false;
			let bridgeCleanup: (() => void) | null = null;
			let sessionRef: ReturnType<typeof createOmidSession> | null = null;

			const timeout = options.timeout ?? 5000;

			const sessionOptions: OmidSessionOptions = {
				...options,
				verifications,
				skipOffset: ad.creatives[0]?.linear?.skipOffset,
			};

			const sdkPromise = loadOmSdk(
				options.serviceScriptUrl,
				options.sessionClientUrl,
				timeout,
			).catch((err) => err as Error);

			async function init(): Promise<void> {
				if (aborted) return;

				try {
					const sdkOrError = await sdkPromise;
					if (aborted) return;

					if (sdkOrError instanceof Error) {
						throw sdkOrError;
					}

					const sdk = sdkOrError;
					const session = createOmidSession(sdk, player.el, sessionOptions);
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

			init();

			return () => {
				aborted = true;
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
