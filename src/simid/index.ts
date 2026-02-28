import type { Player } from "../types.js";
import type { AdPlugin, VastAd } from "../vast/types.js";
import { createSimidChannel } from "./channel.js";
import { createSimidHost } from "./host.js";
import type { SimidPluginOptions, SimidRequestPolicy } from "./types.js";

export type { SimidPluginOptions, SimidRequestPolicy } from "./types.js";

const DEFAULT_POLICY: SimidRequestPolicy = {
	allowPause: true,
	allowPlay: true,
	allowResize: false,
	navigation: "new-tab",
};

/** Create a SIMID (Secure Interactive Media Interface) ad plugin. */
export function simid(options: SimidPluginOptions): AdPlugin {
	return {
		name: "simid",
		setup(player: Player, ad: VastAd) {
			const file = ad.creatives
				.flatMap((c) => c.linear?.interactiveCreativeFiles ?? [])
				.find((f) => f.apiFramework === "SIMID");

			if (!file) return;

			const policy: SimidRequestPolicy = {
				...DEFAULT_POLICY,
				...options.policy,
			};
			const handshakeTimeout = options.handshakeTimeout ?? 5000;

			const channel = createSimidChannel(file.url, options.container);
			const host = createSimidHost(
				player,
				channel.port,
				{ policy, handshakeTimeout },
				ad,
			);

			host
				.start()
				.then(() => channel.show())
				.catch((err) => {
					player.emit("ad:error", {
						error: err instanceof Error ? err : new Error(String(err)),
						source: "simid",
					});
					channel.destroy();
				});

			return () => {
				host.destroy();
				channel.destroy();
			};
		},
	};
}
