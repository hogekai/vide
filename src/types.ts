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
	error: { code: number; message: string; source: string };
	"ad:start": { adId: string };
	"ad:end": { adId: string };
	"ad:skip": { adId: string };
	"ad:click": { clickThrough: string | undefined; clickTracking: string[] };
	"ad:error": { error: Error; source: string };
	"ad:impression": { adId: string };
	"ad:loaded": { adId: string };
	"ad:quartile": { adId: string; quartile: AdQuartile };
	"ad:mute": { adId: string };
	"ad:unmute": { adId: string };
	"ad:volumeChange": { adId: string; volume: number };
	"ad:fullscreen": { adId: string; fullscreen: boolean };
	"ad:breakStart": { breakId: string | undefined };
	"ad:breakEnd": { breakId: string | undefined };
	destroy: undefined;
}

export type PlayerEvent = keyof PlayerEventMap;

// === EventBus ===
export type EventHandler<T> = (data: T) => void;

/** HTMLVideoElement event names not already covered by PlayerEventMap. */
type NativeVideoEvent = Exclude<
	keyof HTMLVideoElementEventMap,
	keyof PlayerEventMap
>;

export interface EventBus {
	on<K extends PlayerEvent>(
		event: K,
		handler: EventHandler<PlayerEventMap[K]>,
	): void;
	on<K extends NativeVideoEvent>(
		event: K,
		handler: (ev: HTMLVideoElementEventMap[K]) => void,
	): void;
	// biome-ignore lint/suspicious/noExplicitAny: catch-all for dynamic event names
	on(event: string, handler: (...args: any[]) => void): void;

	off<K extends PlayerEvent>(
		event: K,
		handler: EventHandler<PlayerEventMap[K]>,
	): void;
	off<K extends NativeVideoEvent>(
		event: K,
		handler: (ev: HTMLVideoElementEventMap[K]) => void,
	): void;
	// biome-ignore lint/suspicious/noExplicitAny: catch-all for dynamic event names
	off(event: string, handler: (...args: any[]) => void): void;

	emit<K extends PlayerEvent>(event: K, data: PlayerEventMap[K]): void;

	once<K extends PlayerEvent>(
		event: K,
		handler: EventHandler<PlayerEventMap[K]>,
	): void;
	once<K extends NativeVideoEvent>(
		event: K,
		handler: (ev: HTMLVideoElementEventMap[K]) => void,
	): void;
	// biome-ignore lint/suspicious/noExplicitAny: catch-all for dynamic event names
	once(event: string, handler: (...args: any[]) => void): void;
}

// === Source Handler ===
export interface SourceHandler {
	/** Whether this handler can process the given URL/type. */
	canHandle(url: string, type?: string): boolean;
	/** Load the source into the video element. */
	load(url: string, videoElement: HTMLVideoElement): void;
	/** Unload the source and clean up. */
	unload(videoElement: HTMLVideoElement): void;
}

// === Plugin ===
export interface Plugin {
	name: string;
	setup(player: Player): (() => void) | undefined;
}

// === Player ===
export interface Player extends EventBus {
	readonly el: HTMLVideoElement;
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

	/** Web-standard addEventListener, delegates to the underlying HTMLVideoElement. */
	addEventListener<K extends keyof HTMLVideoElementEventMap>(
		type: K,
		listener: (ev: HTMLVideoElementEventMap[K]) => void,
		options?: boolean | AddEventListenerOptions,
	): void;
	addEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | AddEventListenerOptions,
	): void;

	/** Web-standard removeEventListener, delegates to the underlying HTMLVideoElement. */
	removeEventListener<K extends keyof HTMLVideoElementEventMap>(
		type: K,
		listener: (ev: HTMLVideoElementEventMap[K]) => void,
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
