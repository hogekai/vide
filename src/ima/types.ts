// ── IMA SDK Minimal Type Stubs ──────────────────────────────
// Following the project pattern (OMID's OmidSessionClientNamespace, HLS's
// HlsLike, DASH's DashMediaPlayerLike): define only what the plugin uses.
// No compile-time import of @types/google.ima3.

/** Subset of google.ima.AdDisplayContainer. */
export interface ImaAdDisplayContainer {
	initialize(): void;
	destroy(): void;
}

/** Subset of google.ima.AdsLoader. */
export interface ImaAdsLoader {
	addEventListener(
		event: string,
		handler: (event: unknown) => void,
		useCapture?: boolean,
	): void;
	removeEventListener(event: string, handler: (event: unknown) => void): void;
	requestAds(adsRequest: ImaAdsRequest): void;
	contentComplete(): void;
	destroy(): void;
}

/** Subset of google.ima.AdsRequest. */
export interface ImaAdsRequest {
	adTagUrl: string;
	linearAdSlotWidth: number;
	linearAdSlotHeight: number;
	nonLinearAdSlotWidth: number;
	nonLinearAdSlotHeight: number;
	setAdWillAutoPlay?(autoPlay: boolean): void;
	setAdWillPlayMuted?(muted: boolean): void;
	setContinuousPlayback?(continuous: boolean): void;
}

/** Subset of google.ima.AdsManager. */
export interface ImaAdsManager {
	addEventListener(event: string, handler: (event: ImaAdEvent) => void): void;
	init(width: number, height: number, viewMode: unknown): void;
	start(): void;
	pause(): void;
	resume(): void;
	skip(): void;
	stop(): void;
	resize(width: number, height: number, viewMode: unknown): void;
	destroy(): void;
	setVolume(volume: number): void;
	getVolume(): number;
	getRemainingTime(): number;
	getAdSkippableState(): boolean;
	getCurrentAd(): ImaAd | null;
}

/** Subset of google.ima.Ad. */
export interface ImaAd {
	getAdId(): string;
	getTitle(): string;
	getDuration(): number;
	getSkipTimeOffset(): number;
	getAdPodInfo(): ImaAdPodInfo;
	isLinear(): boolean;
	isSkippable(): boolean;
	getClickThroughUrl(): string | null;
	getContentType(): string;
}

/** Subset of google.ima.AdPodInfo. */
export interface ImaAdPodInfo {
	getAdPosition(): number;
	getTotalAds(): number;
	getPodIndex(): number;
	getTimeOffset(): number;
	getIsBumper(): boolean;
}

/** Subset of google.ima.AdEvent. */
export interface ImaAdEvent {
	type: string;
	getAd(): ImaAd | null;
	getAdData(): Record<string, unknown> | null;
}

/** Subset of google.ima.AdErrorEvent. */
export interface ImaAdErrorEvent {
	getError(): { getMessage(): string; getErrorCode(): number };
}

/** Event returned by AdsManagerLoadedEvent.getAdsManager(). */
export interface ImaAdsManagerLoadedEvent {
	getAdsManager(
		contentElement: HTMLElement,
		settings?: Record<string, unknown>,
	): ImaAdsManager;
}

/**
 * Minimal stub for the `google.ima` namespace.
 * Only the constructors and constants the plugin actually references.
 */
export interface ImaNamespace {
	AdDisplayContainer: new (
		adContainer: HTMLElement,
		videoElement: HTMLElement,
	) => ImaAdDisplayContainer;
	AdsLoader: new (adDisplayContainer: ImaAdDisplayContainer) => ImaAdsLoader;
	AdsRequest: new () => ImaAdsRequest;
	AdsRenderingSettings: new () => Record<string, unknown>;
	AdsManagerLoadedEvent: {
		Type: { ADS_MANAGER_LOADED: string };
	};
	AdErrorEvent: {
		Type: { AD_ERROR: string };
	};
	AdEvent: {
		Type: {
			LOADED: string;
			STARTED: string;
			FIRST_QUARTILE: string;
			MIDPOINT: string;
			THIRD_QUARTILE: string;
			COMPLETE: string;
			PAUSED: string;
			RESUMED: string;
			SKIPPED: string;
			CLICK: string;
			ALL_ADS_COMPLETED: string;
			CONTENT_PAUSE_REQUESTED: string;
			CONTENT_RESUME_REQUESTED: string;
			AD_BUFFERING: string;
			LOG: string;
			IMPRESSION: string;
			VOLUME_CHANGED: string;
			VOLUME_MUTED: string;
		};
	};
	ViewMode: {
		NORMAL: unknown;
		FULLSCREEN: unknown;
	};
	settings: {
		setLocale(locale: string): void;
		setDisableCustomPlaybackForIOS10Plus(disable: boolean): void;
	};
}

// ── Plugin Options ──────────────────────────────────────────

export interface ImaPluginOptions {
	/** VAST/VMAP ad tag URL. If this is a VMAP URL, IMA handles scheduling internally. */
	adTagUrl: string;

	/**
	 * Container element for IMA's ad UI overlay.
	 * IMA SDK renders its overlay elements (skip button, countdown, click area)
	 * inside this element. Typically the video's parent element.
	 */
	adContainer: HTMLElement;

	/** Timeout in ms for loading the IMA SDK script. @default 6000 */
	timeout?: number | undefined;

	/**
	 * IMA SDK script URL.
	 * @default "https://imasdk.googleapis.com/js/sdkloader/ima3.js"
	 */
	sdkUrl?: string | undefined;

	/** Called to customize the AdsRequest before it is sent. */
	configureAdsRequest?: ((request: ImaAdsRequest) => void) | undefined;

	/** Called to customize AdsRenderingSettings before AdsManager.init(). */
	configureRenderingSettings?:
		| ((settings: Record<string, unknown>) => void)
		| undefined;

	/**
	 * Whether to auto-play ads when content starts.
	 * Set to `false` for on-demand ad insertion via `requestAds()`.
	 * @default true
	 */
	autoplayAdBreaks?: boolean | undefined;

	/** Locale for IMA SDK UI (e.g. "en", "ja"). */
	locale?: string | undefined;
}
