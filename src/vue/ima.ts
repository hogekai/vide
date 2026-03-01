import {
	type PropType,
	type Ref,
	type ShallowRef,
	defineComponent,
	h,
	onScopeDispose,
	ref,
	watch,
} from "vue";
import { ima } from "../ima/index.js";
import type { ImaPluginOptions } from "../ima/types.js";
import type { Player, PluginPlayer } from "../types.js";
import { useVideContext } from "./context.js";

// ── Shared helper ──────────────────────────────────────────

function buildOptions(
	props: Record<string, unknown>,
	adContainer: HTMLElement,
): ImaPluginOptions {
	const opts: ImaPluginOptions = {
		adTagUrl: props.adTagUrl as string,
		adContainer,
	};
	if (props.timeout !== undefined) opts.timeout = props.timeout as number;
	if (props.sdkUrl !== undefined) opts.sdkUrl = props.sdkUrl as string;
	if (props.configureAdsRequest)
		opts.configureAdsRequest =
			props.configureAdsRequest as ImaPluginOptions["configureAdsRequest"];
	if (props.configureRenderingSettings)
		opts.configureRenderingSettings =
			props.configureRenderingSettings as ImaPluginOptions["configureRenderingSettings"];
	if (props.autoplayAdBreaks !== undefined)
		opts.autoplayAdBreaks = props.autoplayAdBreaks as boolean;
	if (props.locale !== undefined) opts.locale = props.locale as string;
	return opts;
}

const imaProps = {
	adTagUrl: { type: String, required: true as const },
	timeout: { type: Number, default: undefined },
	sdkUrl: { type: String, default: undefined },
	configureAdsRequest: {
		type: Function as PropType<ImaPluginOptions["configureAdsRequest"]>,
		default: undefined,
	},
	configureRenderingSettings: {
		type: Function as PropType<ImaPluginOptions["configureRenderingSettings"]>,
		default: undefined,
	},
	autoplayAdBreaks: { type: Boolean, default: undefined },
	locale: { type: String, default: undefined },
};

// ── VideImaPlugin (invisible, ref-based) ───────────────────

export const VideImaPlugin = defineComponent({
	name: "VideImaPlugin",
	props: {
		...imaProps,
		adContainer: {
			type: Object as PropType<Ref<HTMLElement | null>>,
			required: true as const,
		},
	},
	setup(props) {
		const player = useVideContext();
		let cleanup: (() => void) | undefined;

		watch(
			[player, () => props.adContainer.value],
			([p, container]) => {
				cleanup?.();
				cleanup = undefined;
				if (!p || !container) return;
				const opts = buildOptions(props, container);
				const plugin = ima(opts);
				cleanup = plugin.setup(p as PluginPlayer) ?? undefined;
			},
			{ immediate: true },
		);

		onScopeDispose(() => {
			cleanup?.();
		});

		return () => null;
	},
});

// ── VideIma (wrapping, renders a container div) ────────────

export const VideIma = defineComponent({
	name: "VideIma",
	inheritAttrs: false,
	props: imaProps,
	setup(props, { attrs, slots }) {
		const player = useVideContext();
		const containerRef = ref<HTMLElement | null>(null);
		let cleanup: (() => void) | undefined;

		watch(
			[player, containerRef],
			([p, container]) => {
				cleanup?.();
				cleanup = undefined;
				if (!p || !container) return;
				const opts = buildOptions(props, container);
				const plugin = ima(opts);
				cleanup = plugin.setup(p as PluginPlayer) ?? undefined;
			},
			{ immediate: true },
		);

		onScopeDispose(() => {
			cleanup?.();
		});

		return () =>
			h(
				"div",
				{
					ref: containerRef,
					class: attrs.class,
					style: [{ position: "relative" }, attrs.style],
				},
				slots.default?.(),
			);
	},
});

// ── useIma composable ──────────────────────────────────────

export function useIma(
	player: ShallowRef<Player | null>,
	options: Omit<ImaPluginOptions, "adContainer"> & {
		adContainer: Ref<HTMLElement | null>;
	},
): void {
	let cleanup: (() => void) | undefined;

	watch(
		[player, options.adContainer],
		([p, container]) => {
			cleanup?.();
			cleanup = undefined;
			if (!p || !container) return;
			const { adContainer: _ref, ...rest } = options;
			const plugin = ima({ ...rest, adContainer: container });
			cleanup = plugin.setup(p as PluginPlayer) ?? undefined;
		},
		{ immediate: true },
	);

	onScopeDispose(() => {
		cleanup?.();
	});
}
