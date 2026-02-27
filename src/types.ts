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
export interface PlayerEventMap {
	statechange: { from: PlayerState; to: PlayerState };
	play: void;
	pause: void;
	ended: void;
	timeupdate: { currentTime: number; duration: number };
	error: { code: number; message: string };
	"ad:start": { adId: string };
	"ad:end": { adId: string };
	"ad:skip": { adId: string };
	"ad:click": { clickThrough: string | undefined; clickTracking: string[] };
	"ad:error": { error: Error };
	destroy: void;
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

// === Plugin ===
export interface Plugin {
	name: string;
	setup(player: Player): (() => void) | void;
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

	use(plugin: Plugin): void;
	destroy(): void;
}
