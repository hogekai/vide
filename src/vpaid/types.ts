/**
 * VPAID 2.0 Ad Unit interface.
 * Shape of the object returned by `getVPAIDAd()`.
 */
export interface VpaidAdUnit {
	handshakeVersion(version: string): string;
	initAd(
		width: number,
		height: number,
		viewMode: string,
		desiredBitrate: number,
		creativeData: { AdParameters: string },
		environmentVars: {
			slot: HTMLElement;
			videoSlot: HTMLVideoElement;
			videoSlotCanAutoPlay: boolean;
		},
	): void;
	startAd(): void;
	stopAd(): void;
	resizeAd(width: number, height: number, viewMode: string): void;
	pauseAd(): void;
	resumeAd(): void;
	expandAd(): void;
	collapseAd(): void;
	skipAd(): void;
	subscribe(
		fn: (...args: unknown[]) => void,
		event: string,
		listenerScope?: unknown,
	): void;
	unsubscribe(fn: (...args: unknown[]) => void, event: string): void;

	adLinear: boolean;
	adWidth: number;
	adHeight: number;
	adExpanded: boolean;
	adSkippableState: boolean;
	adRemainingTime: number;
	adDuration: number;
	adVolume: number;
	adCompanions: string;
	adIcons: boolean;
}

/** All VPAID 2.0 events that an ad unit can dispatch. */
export type VpaidEvent =
	| "AdLoaded"
	| "AdStarted"
	| "AdStopped"
	| "AdSkipped"
	| "AdError"
	| "AdLinearChange"
	| "AdSizeChange"
	| "AdDurationChange"
	| "AdRemainingTimeChange"
	| "AdExpandedChange"
	| "AdSkippableStateChange"
	| "AdVolumeChange"
	| "AdImpression"
	| "AdClickThru"
	| "AdInteraction"
	| "AdUserAcceptInvitation"
	| "AdUserMinimize"
	| "AdUserClose"
	| "AdVideoStart"
	| "AdVideoFirstQuartile"
	| "AdVideoMidpoint"
	| "AdVideoThirdQuartile"
	| "AdVideoComplete"
	| "AdLog"
	| "AdPaused"
	| "AdPlaying";

export interface VpaidPluginOptions {
	/** Container element for the VPAID ad slot. */
	container: HTMLElement;
	/** Timeout in ms for loading the VPAID JS script. Default: 10000. */
	loadTimeout?: number | undefined;
	/** Timeout in ms for the handshakeVersion call. Default: 5000. */
	handshakeTimeout?: number | undefined;
	/** Timeout in ms for initAd → AdLoaded. Default: 8000. */
	initTimeout?: number | undefined;
	/** Timeout in ms for startAd → AdStarted. Default: 5000. */
	startTimeout?: number | undefined;
	/** Timeout in ms for stopAd → AdStopped. Default: 5000. */
	stopTimeout?: number | undefined;
	/** Load VPAID JS in a friendly iframe for isolation. Default: true. */
	useFriendlyIframe?: boolean | undefined;
}
