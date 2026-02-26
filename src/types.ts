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
	"ad:error": { error: Error };
	destroy: void;
}

export type PlayerEvent = keyof PlayerEventMap;

// === EventBus ===
export type EventHandler<T> = (data: T) => void;

export interface EventBus {
	on<K extends PlayerEvent>(
		event: K,
		handler: EventHandler<PlayerEventMap[K]>,
	): void;
	off<K extends PlayerEvent>(
		event: K,
		handler: EventHandler<PlayerEventMap[K]>,
	): void;
	emit<K extends PlayerEvent>(event: K, data: PlayerEventMap[K]): void;
	once<K extends PlayerEvent>(
		event: K,
		handler: EventHandler<PlayerEventMap[K]>,
	): void;
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

	use(plugin: Plugin): void;
	destroy(): void;
}
