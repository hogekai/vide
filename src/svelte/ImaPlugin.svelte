<script lang="ts">
import { getContext } from "svelte";
import { ima } from "../ima/index.js";
import type { ImaAdsRequest, ImaPluginOptions } from "../ima/types.js";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "./context.js";

interface Props {
	adTagUrl: string;
	adContainer: HTMLElement | undefined;
	timeout?: number | undefined;
	sdkUrl?: string | undefined;
	configureAdsRequest?: ((request: ImaAdsRequest) => void) | undefined;
	configureRenderingSettings?:
		| ((settings: Record<string, unknown>) => void)
		| undefined;
	autoplayAdBreaks?: boolean | undefined;
	locale?: string | undefined;
}

const {
	adTagUrl,
	adContainer,
	timeout,
	sdkUrl,
	configureAdsRequest,
	configureRenderingSettings,
	autoplayAdBreaks,
	locale,
}: Props = $props();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);

$effect(() => {
	const p = getPlayer();
	if (!p || !adContainer) return;
	const opts: ImaPluginOptions = {
		adTagUrl,
		adContainer,
		timeout,
		sdkUrl,
		configureAdsRequest,
		configureRenderingSettings,
		autoplayAdBreaks,
		locale,
	};
	const plugin = ima(opts);
	const cleanup = plugin.setup(p);
	return () => {
		cleanup?.();
	};
});
</script>
