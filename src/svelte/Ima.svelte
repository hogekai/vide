<script lang="ts">
import { getContext } from "svelte";
import type { Snippet } from "svelte";
import { ima } from "../ima/index.js";
import type { ImaAdsRequest, ImaPluginOptions } from "../ima/types.js";
import { type PlayerGetter, VIDE_PLAYER_KEY } from "./context.js";

interface Props {
	adTagUrl: string;
	timeout?: number | undefined;
	sdkUrl?: string | undefined;
	configureAdsRequest?: ((request: ImaAdsRequest) => void) | undefined;
	configureRenderingSettings?:
		| ((settings: Record<string, unknown>) => void)
		| undefined;
	autoplayAdBreaks?: boolean | undefined;
	locale?: string | undefined;
	class?: string;
	children?: Snippet;
}

const {
	adTagUrl,
	timeout,
	sdkUrl,
	configureAdsRequest,
	configureRenderingSettings,
	autoplayAdBreaks,
	locale,
	class: className,
	children,
}: Props = $props();

// biome-ignore lint/style/useConst: bind:this requires let in Svelte 5
let containerEl: HTMLDivElement | undefined = $state();

const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);

$effect(() => {
	const p = getPlayer();
	if (!p || !containerEl) return;
	const opts: ImaPluginOptions = {
		adTagUrl,
		adContainer: containerEl,
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

<div
	bind:this={containerEl}
	class={className}
	style="position:relative"
>
	{#if children}
		{@render children()}
	{/if}
</div>
