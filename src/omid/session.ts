import type {
	OmidAdEvents,
	OmidMediaEvents,
	OmidPluginOptions,
	OmidSessionClientNamespace,
	OmidVastProperties,
} from "./types.js";

export interface OmidSession {
	readonly adEvents: OmidAdEvents;
	readonly mediaEvents: OmidMediaEvents;
	readonly vastProperties: OmidVastProperties;
	readonly started: boolean;
	waitForStart(timeout: number): Promise<boolean>;
	finish(): void;
	error(message: string): void;
}

/**
 * Create and configure an OM SDK session.
 *
 * Creates Partner, VerificationScriptResources, Context, AdSession,
 * AdEvents, MediaEvents, and VastProperties from the provided options.
 * Calls `adSession.start()` immediately.
 *
 * Throws if `isSupported()` returns false.
 */
export function createOmidSession(
	sdk: OmidSessionClientNamespace,
	videoElement: HTMLVideoElement,
	options: OmidPluginOptions,
): OmidSession {
	const partner = new sdk.Partner(
		options.partner.name,
		options.partner.version,
	);

	const resources = options.verifications
		.filter((v) => v.resourceUrl)
		.map(
			(v) =>
				new sdk.VerificationScriptResource(
					v.resourceUrl,
					v.vendor,
					v.parameters,
					"full",
				),
		);

	const context = new sdk.Context(
		partner,
		resources,
		options.contentUrl,
		options.customReferenceData,
	);

	context.setVideoElement(videoElement);
	const parent = videoElement.parentElement;
	if (parent) {
		context.setSlotElement(parent);
	}
	context.setServiceWindow(window);

	const adSession = new sdk.AdSession(context);
	adSession.setCreativeType("video");
	adSession.setImpressionType("beginToRender");

	if (!adSession.isSupported()) {
		throw new Error("OM SDK session not supported in this environment");
	}

	let started = false;
	let finished = false;
	let startResolve: ((value: boolean) => void) | null = null;

	adSession.registerSessionObserver((event) => {
		if (event.type === "sessionStart") {
			started = true;
			if (startResolve) {
				startResolve(true);
				startResolve = null;
			}
		}
	});

	adSession.start();

	const adEvents = new sdk.AdEvents(adSession);
	const mediaEvents = new sdk.MediaEvents(adSession);

	const position = options.position ?? "standalone";
	const isSkippable = options.skipOffset !== undefined;
	const skipOffset = options.skipOffset ?? -1;
	const isAutoPlay = options.isAutoPlay ?? true;
	const vastProperties = new sdk.VastProperties(
		isSkippable,
		skipOffset,
		isAutoPlay,
		position,
	);

	return {
		get adEvents() {
			return adEvents;
		},
		get mediaEvents() {
			return mediaEvents;
		},
		get vastProperties() {
			return vastProperties;
		},
		get started() {
			return started;
		},

		waitForStart(timeout: number): Promise<boolean> {
			if (started) return Promise.resolve(true);
			return new Promise((resolve) => {
				startResolve = resolve;
				setTimeout(() => {
					if (!started) {
						startResolve = null;
						resolve(false);
					}
				}, timeout);
			});
		},

		finish(): void {
			if (finished) return;
			finished = true;
			adSession.finish();
		},

		error(message: string): void {
			adSession.error("video", message);
		},
	};
}
