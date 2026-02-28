import type { AdVerification } from "../vast/types.js";

// === Plugin Options ===

export interface OmidPluginOptions {
	/** Partner identification for the OM SDK. */
	partner: { name: string; version: string };
	/**
	 * URL to the OM SDK service script (omweb-v1.js).
	 * Defaults to the Google-hosted release.
	 * In production, host the script on your own CDN.
	 */
	serviceScriptUrl?: string | undefined;
	/** URL to the OM SDK session client script. If omitted, assumes OmidSessionClient is already global. */
	sessionClientUrl?: string | undefined;
	/** Timeout in ms for loading OM SDK scripts. Defaults to 5000. */
	timeout?: number | undefined;
}

/** Internal options passed to createOmidSession (includes resolved verifications). */
export interface OmidSessionOptions extends OmidPluginOptions {
	verifications: AdVerification[];
	contentUrl?: string | undefined;
	position?: OmidVideoPosition | undefined;
	isAutoPlay?: boolean | undefined;
	skipOffset?: number | undefined;
	customReferenceData?: string | undefined;
}

// === OM SDK Enum Types ===

export type OmidVideoPosition =
	| "preroll"
	| "midroll"
	| "postroll"
	| "standalone";

export type OmidCreativeType =
	| "video"
	| "audio"
	| "htmlDisplay"
	| "nativeDisplay"
	| "definedByJavaScript";

export type OmidImpressionType =
	| "beginToRender"
	| "loaded"
	| "onePixel"
	| "viewable"
	| "audible"
	| "other"
	| "unspecified"
	| "definedByJavaScript";

export type OmidAccessMode = "full" | "limited" | "domain";

export type OmidErrorType = "generic" | "video" | "media";

export type OmidVideoPlayerState =
	| "minimized"
	| "collapsed"
	| "normal"
	| "expanded"
	| "fullscreen";

export type OmidInteractionType = "click" | "invitationAccept";

// === OM SDK Class Interfaces (minimal stubs) ===

export interface OmidContext {
	setVideoElement(el: HTMLVideoElement | HTMLAudioElement): void;
	setSlotElement(el: HTMLElement): void;
	setServiceWindow(win: Window): void;
}

export interface OmidAdSession {
	setCreativeType(type: OmidCreativeType): void;
	setImpressionType(type: OmidImpressionType): void;
	isSupported(): boolean;
	start(): void;
	finish(): void;
	error(errorType: OmidErrorType, message: string): void;
	registerSessionObserver(handler: (event: { type: string }) => void): void;
}

export interface OmidAdEvents {
	impressionOccurred(): void;
	loaded(vastProperties?: OmidVastProperties): void;
}

export interface OmidMediaEvents {
	start(duration: number, volume: number): void;
	firstQuartile(): void;
	midpoint(): void;
	thirdQuartile(): void;
	complete(): void;
	pause(): void;
	resume(): void;
	bufferStart(): void;
	bufferFinish(): void;
	skipped(): void;
	volumeChange(volume: number): void;
	playerStateChange(state: OmidVideoPlayerState): void;
	adUserInteraction(type: OmidInteractionType): void;
}

// biome-ignore lint/suspicious/noEmptyInterface: opaque stub for OM SDK runtime object
export interface OmidVastProperties {}

// biome-ignore lint/suspicious/noEmptyInterface: opaque stub for OM SDK runtime object
export interface OmidPartner {}

// biome-ignore lint/suspicious/noEmptyInterface: opaque stub for OM SDK runtime object
export interface OmidVerificationScriptResource {}

// === OmidSessionClient Global Namespace ===

export interface OmidSessionClientNamespace {
	Partner: new (name: string, version: string) => OmidPartner;
	VerificationScriptResource: new (
		url: string,
		vendorKey?: string,
		params?: string,
		accessMode?: OmidAccessMode,
	) => OmidVerificationScriptResource;
	Context: new (
		partner: OmidPartner,
		resources: OmidVerificationScriptResource[],
		contentUrl?: string,
		customReferenceData?: string,
	) => OmidContext;
	AdSession: new (context: OmidContext) => OmidAdSession;
	AdEvents: new (session: OmidAdSession) => OmidAdEvents;
	MediaEvents: new (session: OmidAdSession) => OmidMediaEvents;
	VastProperties: new (
		isSkippable: boolean,
		skipOffset: number,
		isAutoPlay: boolean,
		position: OmidVideoPosition,
	) => OmidVastProperties;
}
