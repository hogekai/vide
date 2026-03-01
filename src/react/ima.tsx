import {
	type ComponentPropsWithRef,
	type ReactNode,
	type RefObject,
	forwardRef,
	useContext,
	useEffect,
	useRef,
} from "react";
import { ima } from "../ima/index.js";
import type { ImaPluginOptions } from "../ima/types.js";
import type { PluginPlayer } from "../types.js";
import { VideContext } from "./context.js";
import type { VidePlayerHandle } from "./use-vide-player.js";

// ── ImaPlugin (invisible, ref-based) ──────────────────────

export type ImaPluginProps = Omit<ImaPluginOptions, "adContainer"> & {
	adContainer: RefObject<HTMLElement | null>;
};

export function ImaPlugin(props: ImaPluginProps): null {
	const ctx = useContext(VideContext);
	const player = ctx?.player ?? null;
	const propsRef = useRef(props);
	propsRef.current = props;

	useEffect(() => {
		if (!player) return;
		const container = propsRef.current.adContainer.current;
		if (!container) return;
		const { adContainer: _ref, ...rest } = propsRef.current;
		const plugin = ima({ ...rest, adContainer: container });
		const cleanup = plugin.setup(player as PluginPlayer);
		return () => {
			cleanup?.();
		};
	}, [player]);

	return null;
}
ImaPlugin.displayName = "ImaPlugin";

// ── Ima (wrapping, renders a container div) ────────────────

export interface ImaProps
	extends Omit<ComponentPropsWithRef<"div">, "children"> {
	adTagUrl: string;
	timeout?: number | undefined;
	sdkUrl?: string | undefined;
	configureAdsRequest?: ImaPluginOptions["configureAdsRequest"];
	configureRenderingSettings?: ImaPluginOptions["configureRenderingSettings"];
	autoplayAdBreaks?: boolean | undefined;
	locale?: string | undefined;
	children?: ReactNode;
}

export const Ima = forwardRef<HTMLDivElement, ImaProps>(function Ima(
	{
		adTagUrl,
		timeout,
		sdkUrl,
		configureAdsRequest,
		configureRenderingSettings,
		autoplayAdBreaks,
		locale,
		children,
		style,
		...divProps
	},
	ref,
) {
	const ctx = useContext(VideContext);
	const player = ctx?.player ?? null;
	const internalRef = useRef<HTMLDivElement>(null);

	// Merge forwarded ref with internal ref
	const setRef = (el: HTMLDivElement | null) => {
		(internalRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
		if (typeof ref === "function") ref(el);
		else if (ref)
			(ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
	};

	const pluginOptsRef = useRef({
		adTagUrl,
		timeout,
		sdkUrl,
		configureAdsRequest,
		configureRenderingSettings,
		autoplayAdBreaks,
		locale,
	});
	pluginOptsRef.current = {
		adTagUrl,
		timeout,
		sdkUrl,
		configureAdsRequest,
		configureRenderingSettings,
		autoplayAdBreaks,
		locale,
	};

	useEffect(() => {
		if (!player) return;
		const container = internalRef.current;
		if (!container) return;
		const opts = pluginOptsRef.current;
		const plugin = ima({
			adTagUrl: opts.adTagUrl,
			adContainer: container,
			timeout: opts.timeout,
			sdkUrl: opts.sdkUrl,
			configureAdsRequest: opts.configureAdsRequest,
			configureRenderingSettings: opts.configureRenderingSettings,
			autoplayAdBreaks: opts.autoplayAdBreaks,
			locale: opts.locale,
		});
		const cleanup = plugin.setup(player as PluginPlayer);
		return () => {
			cleanup?.();
		};
	}, [player]);

	return (
		<div ref={setRef} style={{ position: "relative", ...style }} {...divProps}>
			{children}
		</div>
	);
});

// ── useIma hook ────────────────────────────────────────────

export function useIma(
	handle: VidePlayerHandle,
	options: Omit<ImaPluginOptions, "adContainer"> & {
		adContainer: RefObject<HTMLElement | null>;
	},
): void {
	const optionsRef = useRef(options);
	optionsRef.current = options;

	useEffect(() => {
		const player = handle.current;
		if (!player) return;
		const container = optionsRef.current.adContainer.current;
		if (!container) return;
		const { adContainer: _ref, ...rest } = optionsRef.current;
		const plugin = ima({ ...rest, adContainer: container });
		const cleanup = plugin.setup(player as PluginPlayer);
		return () => {
			cleanup?.();
		};
	}, [handle.current]);
}
