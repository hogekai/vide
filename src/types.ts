// === Media Element ===
export type MediaElement = HTMLVideoElement | HTMLAudioElement;

// === Player States ===
export type PlayerState =
	| "idle"
	| "loading"
	| "ready"
	| "playing"
	| "paused"
	| "buffering"
	| "ad:loading"
	| "ad:playing"
	| "ad:paused"
	| "ended"
	| "error";

// === Events ===
export type AdQuartile =
	| "start"
	| "firstQuartile"
	| "midpoint"
	| "thirdQuartile"
	| "complete";

export interface PlayerEventMap {
	statechange: { from: PlayerState; to: PlayerState };
	play: undefined;
	pause: undefined;
	ended: undefined;
	timeupdate: { currentTime: number; duration: number };
	livestatechange: { isLive: boolean };
	error: {
		code: number;
		message: string;
		source: string;
		recoverable?: boolean | undefined;
		retryCount?: number | undefined;
	};
	"ad:companions": {
		adId: string;
		required: "all" | "any" | "none";
		companions: {
			width: number;
			height: number;
			id?: string | undefined;
			assetWidth?: number | undefined;
			assetHeight?: number | undefined;
			expandedWidth?: number | undefined;
			expandedHeight?: number | undefined;
			pxratio?: number | undefined;
			renderingMode?: "default" | "end-card" | "concurrent" | undefined;
			resources: Array<
				| { type: "static"; url: string; creativeType: string }
				| { type: "iframe"; url: string }
				| { type: "html"; content: string }
			>;
			clickThrough?: string | undefined;
			clickTracking: string[];
			trackingEvents: { creativeView: string[] };
			altText?: string | undefined;
			adParameters?: string | undefined;
		}[];
	};
	"ad:nonlinears": {
		adId: string;
		nonLinears: {
			width: number;
			height: number;
			id?: string | undefined;
			expandedWidth?: number | undefined;
			expandedHeight?: number | undefined;
			scalable?: boolean | undefined;
			maintainAspectRatio?: boolean | undefined;
			minSuggestedDuration?: number | undefined;
			apiFramework?: string | undefined;
			resources: Array<
				| { type: "static"; url: string; creativeType: string }
				| { type: "iframe"; url: string }
				| { type: "html"; content: string }
			>;
			clickThrough?: string | undefined;
			clickTracking: string[];
			adParameters?: string | undefined;
		}[];
		trackingEvents: Record<string, string[]>;
	};
	"ad:start": { adId: string };
	"ad:end": { adId: string };
	"ad:skip": { adId: string };
	"ad:click": { clickThrough: string | undefined; clickTracking: string[] };
	"ad:error": {
		error: Error;
		source: string;
		/** VAST 4.2 error code. Undefined for non-VAST errors. */
		vastErrorCode?: number | undefined;
	};
	"ad:impression": { adId: string };
	"ad:loaded": { adId: string };
	"ad:quartile": { adId: string; quartile: AdQuartile };
	"ad:mute": { adId: string };
	"ad:unmute": { adId: string };
	"ad:volumeChange": { adId: string; volume: number };
	"ad:fullscreen": { adId: string; fullscreen: boolean };
	"ad:breakStart": { breakId: string | undefined };
	"ad:breakEnd": { breakId: string | undefined };
	"ad:pod:start": {
		ads: { id: string; sequence?: number | undefined }[];
		total: number;
	};
	"ad:pod:end": { completed: number; skipped: number; failed: number };
	"ad:pod:adstart": {
		ad: { id: string; sequence?: number | undefined };
		index: number;
		total: number;
	};
	"ad:pod:adend": {
		ad: { id: string; sequence?: number | undefined };
		index: number;
		total: number;
	};
	qualitiesavailable: { qualities: QualityLevel[] };
	qualitychange: { from: QualityLevel | null; to: QualityLevel };
	texttrackchange: { track: VideTextTrack | null };
	texttracksavailable: { tracks: VideTextTrack[] };
	cuechange: { cues: VideCue[] };
	destroy: undefined;
}

export type PlayerEvent = keyof PlayerEventMap;

// === Recovery ===
export interface RecoveryConfig {
	maxRetries: number;
	retryDelay: number;
	backoffMultiplier: number;
}

// === EventBus ===
export type EventHandler<T> = (data: T) => void;

/** Native media event names not already covered by PlayerEventMap. */
type NativeMediaEvent = Exclude<
	keyof HTMLMediaElementEventMap,
	keyof PlayerEventMap
>;

export interface EventBus {
	on<K extends PlayerEvent>(
		event: K,
		handler: EventHandler<PlayerEventMap[K]>,
	): void;
	on<K extends NativeMediaEvent>(
		event: K,
		handler: (ev: HTMLMediaElementEventMap[K]) => void,
	): void;
	// biome-ignore lint/suspicious/noExplicitAny: catch-all for dynamic event names
	on(event: string, handler: (...args: any[]) => void): void;

	off<K extends PlayerEvent>(
		event: K,
		handler: EventHandler<PlayerEventMap[K]>,
	): void;
	off<K extends NativeMediaEvent>(
		event: K,
		handler: (ev: HTMLMediaElementEventMap[K]) => void,
	): void;
	// biome-ignore lint/suspicious/noExplicitAny: catch-all for dynamic event names
	off(event: string, handler: (...args: any[]) => void): void;

	emit<K extends PlayerEvent>(event: K, data: PlayerEventMap[K]): void;

	once<K extends PlayerEvent>(
		event: K,
		handler: EventHandler<PlayerEventMap[K]>,
	): void;
	once<K extends NativeMediaEvent>(
		event: K,
		handler: (ev: HTMLMediaElementEventMap[K]) => void,
	): void;
	// biome-ignore lint/suspicious/noExplicitAny: catch-all for dynamic event names
	once(event: string, handler: (...args: any[]) => void): void;
}

// === Seekable Range ===
export interface SeekableRange {
	start: number;
	end: number;
}

// === Quality Level ===
export interface QualityLevel {
	id: number;
	width: number;
	height: number;
	bitrate: number;
	label: string;
}

// === Text Track ===
export interface VideTextTrack {
	id: number;
	label: string;
	language: string;
	kind: "subtitles" | "captions" | "descriptions" | "chapters" | "metadata";
	active: boolean;
}

export interface VideCue {
	startTime: number;
	endTime: number;
	text: string;
}

// === Source Handler ===
export interface SourceHandler {
	/** Whether this handler can process the given URL/type. */
	canHandle(url: string, type?: string): boolean;
	/** Load the source into the media element. */
	load(url: string, mediaElement: MediaElement): void;
	/** Unload the source and clean up. */
	unload(mediaElement: MediaElement): void;
}

// === Plugin ===
export interface Plugin {
	name: string;
	setup(player: Player): (() => void) | undefined;
}

// === Player ===
export interface Player extends EventBus {
	readonly el: MediaElement;
	readonly state: PlayerState;

	play(): Promise<void>;
	pause(): void;
	currentTime: number;
	duration: number;
	volume: number;
	muted: boolean;
	playbackRate: number;
	readonly paused: boolean;
	readonly ended: boolean;
	readonly readyState: number;
	readonly buffered: TimeRanges;
	readonly seekable: TimeRanges;
	readonly seeking: boolean;
	readonly isLive: boolean;
	readonly seekableRange: SeekableRange | null;
	readonly qualities: QualityLevel[];
	readonly currentQuality: QualityLevel | null;
	setQuality(id: number): void;
	readonly isAutoQuality: boolean;
	readonly isAudio: boolean;

	readonly textTracks: TextTrackList;
	getTextTracks(): VideTextTrack[];
	getActiveTextTrack(): VideTextTrack | null;
	readonly activeCues: VideCue[];
	setTextTrack(id: number): void;
	addTextTrack(options: {
		src: string;
		label: string;
		language: string;
		kind?: "subtitles" | "captions";
		default?: boolean;
	}): void;
	readonly videoWidth: number;
	readonly videoHeight: number;
	readonly networkState: number;
	loop: boolean;
	autoplay: boolean;
	poster: string;
	preload: "" | "none" | "metadata" | "auto";
	defaultPlaybackRate: number;
	defaultMuted: boolean;
	crossOrigin: string | null;
	controls: boolean;

	/** Web-standard addEventListener, delegates to the underlying media element. */
	addEventListener<K extends keyof HTMLMediaElementEventMap>(
		type: K,
		listener: (ev: HTMLMediaElementEventMap[K]) => void,
		options?: boolean | AddEventListenerOptions,
	): void;
	addEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | AddEventListenerOptions,
	): void;

	/** Web-standard removeEventListener, delegates to the underlying media element. */
	removeEventListener<K extends keyof HTMLMediaElementEventMap>(
		type: K,
		listener: (ev: HTMLMediaElementEventMap[K]) => void,
		options?: boolean | EventListenerOptions,
	): void;
	removeEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | EventListenerOptions,
	): void;

	/** Current media source URL. Setting triggers SourceHandler lookup. */
	src: string;
	/** Register a handler for custom source types (e.g., HLS, DASH). */
	registerSourceHandler(handler: SourceHandler): void;

	use(plugin: Plugin): void;
	destroy(): void;

	/** Store data for cross-plugin communication. */
	setPluginData(key: string, data: unknown): void;
	/** Retrieve data stored by another plugin. Returns undefined if not set. */
	getPluginData(key: string): unknown;
}
