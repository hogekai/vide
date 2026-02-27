// === SIMID Plugin Options ===

export interface SimidPluginOptions {
	/** Container element to mount the SIMID iframe into. */
	container: HTMLElement;
	/** Request policy overrides. */
	policy?: Partial<SimidRequestPolicy> | undefined;
	/** Handshake timeout in ms. Default: 5000. */
	handshakeTimeout?: number | undefined;
}

export interface SimidRequestPolicy {
	/** Allow creative to pause media. Default: true. */
	allowPause: boolean;
	/** Allow creative to resume media. Default: true. */
	allowPlay: boolean;
	/** Allow creative to resize ad slot. Default: false. */
	allowResize: boolean;
	/** How to handle requestNavigation. Default: 'new-tab'. */
	navigation: "new-tab" | "deny";
}

// === SIMID Protocol (spec §8.1.1) ===

export interface SimidMessage {
	sessionId: string;
	messageId: number;
	timestamp: number;
	type: string;
	args?: unknown;
}

export interface ResolveArgs {
	messageId: number;
	value?: unknown;
}

export interface RejectArgs {
	messageId: number;
	value?: { errorCode: number; message?: string };
}

// === EnvironmentData (spec §4.3.7) ===

export interface Dimensions {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface EnvironmentData {
	videoDimensions: Dimensions;
	creativeDimensions: Dimensions;
	fullscreen: boolean;
	fullscreenAllowed: boolean;
	variableDurationAllowed: boolean;
	skippableState: "playerHandles" | "adHandles" | "notSkippable";
	version: string;
	muted?: boolean | undefined;
	volume?: number | undefined;
	navigationSupport?:
		| "adHandles"
		| "playerHandles"
		| "notSupported"
		| undefined;
}

export interface CreativeData {
	adParameters: string;
	clickThruUrl?: string | undefined;
}

// === MediaState (spec §4.4.5.1) ===

export interface MediaState {
	currentTime: number;
	duration: number;
	ended: boolean;
	muted: boolean;
	paused: boolean;
	volume: number;
	fullscreen: boolean;
}
