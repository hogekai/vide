import type {
	EventHandler,
	Player,
	PlayerEvent,
	PlayerEventMap,
	PlayerState,
	Plugin,
	SourceHandler,
} from "./types.js";

// === State Machine ===

const transitions: Record<PlayerState, PlayerState[]> = {
	idle: ["loading", "error"],
	loading: ["ready", "error"],
	ready: ["playing", "loading", "ad:loading", "error"],
	playing: ["paused", "buffering", "loading", "ad:loading", "ended", "error"],
	paused: ["playing", "loading", "ad:loading", "ended", "error"],
	buffering: ["playing", "loading", "error"],
	"ad:loading": ["ad:playing", "playing", "error"],
	"ad:playing": ["ad:paused", "playing", "error"],
	"ad:paused": ["ad:playing", "playing", "error"],
	ended: ["idle", "loading", "error"],
	error: ["idle", "loading"],
};

function canTransition(from: PlayerState, to: PlayerState): boolean {
	return transitions[from].includes(to);
}

/** Infer initial state from current video element readyState. */
function inferInitialState(el: HTMLVideoElement): PlayerState {
	// HTMLMediaElement.readyState:
	// 0 = HAVE_NOTHING, 1 = HAVE_METADATA, 2 = HAVE_CURRENT_DATA,
	// 3 = HAVE_FUTURE_DATA, 4 = HAVE_ENOUGH_DATA
	if (el.readyState >= 3) {
		if (!el.paused) return "playing";
		return "ready";
	}
	if (el.readyState >= 1) return "loading";
	return "idle";
}

// === createPlayer ===

export function createPlayer(el: HTMLVideoElement): Player {
	let state: PlayerState = inferInitialState(el);
	const handlers = new Map<string, Set<EventHandler<unknown>>>();
	const cleanups: (() => void)[] = [];
	let destroyed = false;
	const sourceHandlers: SourceHandler[] = [];
	let activeHandler: SourceHandler | null = null;
	let currentSrc = "";
	let srcExplicitlySet = false;

	function getHandlers(event: string): Set<EventHandler<unknown>> {
		let set = handlers.get(event);
		if (!set) {
			set = new Set();
			handlers.set(event, set);
		}
		return set;
	}

	function emit<K extends PlayerEvent>(
		event: K,
		data: PlayerEventMap[K],
	): void {
		const set = handlers.get(event);
		if (!set) return;
		for (const handler of set) {
			try {
				handler(data);
			} catch (err) {
				console.error("[vide] Event handler error:", err);
			}
		}
	}

	function setState(next: PlayerState): void {
		if (next === state) return;
		if (!canTransition(state, next)) {
			console.warn(`[vide] Invalid transition: ${state} → ${next}`);
			return;
		}
		const from = state;
		state = next;
		emit("statechange", { from, to: next });
	}

	// --- Wire up HTMLVideoElement events ---

	function isAdState(): boolean {
		return (
			state === "ad:loading" || state === "ad:playing" || state === "ad:paused"
		);
	}

	function onLoadStart(): void {
		if (!isAdState()) {
			setState("loading");
		}
	}

	function onCanPlay(): void {
		if (state === "loading") {
			setState("ready");
		}
	}

	function onPlay(): void {
		if (!isAdState()) {
			setState("playing");
		}
		emit("play", undefined as void);
	}

	function onPause(): void {
		if (!isAdState()) {
			setState("paused");
		}
		emit("pause", undefined as void);
	}

	function onWaiting(): void {
		if (state === "playing") {
			setState("buffering");
		}
	}

	function onPlaying(): void {
		if (state === "buffering") {
			setState("playing");
		}
	}

	function onEnded(): void {
		if (!isAdState()) {
			setState("ended");
		}
		emit("ended", undefined as void);
	}

	function onTimeUpdate(): void {
		emit("timeupdate", {
			currentTime: el.currentTime,
			duration: el.duration,
		});
	}

	function onError(): void {
		const mediaError = el.error;
		if (!isAdState()) {
			setState("error");
		}
		emit("error", {
			code: mediaError?.code ?? 0,
			message: mediaError?.message ?? "Unknown error",
		});
	}

	el.addEventListener("loadstart", onLoadStart);
	el.addEventListener("canplay", onCanPlay);
	el.addEventListener("play", onPlay);
	el.addEventListener("pause", onPause);
	el.addEventListener("waiting", onWaiting);
	el.addEventListener("playing", onPlaying);
	el.addEventListener("ended", onEnded);
	el.addEventListener("timeupdate", onTimeUpdate);
	el.addEventListener("error", onError);

	/** Known player event names managed by the EventBus. */
	const playerEvents = new Set<string>([
		"statechange",
		"play",
		"pause",
		"ended",
		"timeupdate",
		"error",
		"ad:start",
		"ad:end",
		"ad:skip",
		"ad:click",
		"ad:error",
		"ad:impression",
		"ad:loaded",
		"ad:quartile",
		"ad:mute",
		"ad:unmute",
		"ad:volumeChange",
		"ad:fullscreen",
		"ad:breakStart",
		"ad:breakEnd",
		"destroy",
	]);

	function removeVideoListeners(): void {
		el.removeEventListener("loadstart", onLoadStart);
		el.removeEventListener("canplay", onCanPlay);
		el.removeEventListener("play", onPlay);
		el.removeEventListener("pause", onPause);
		el.removeEventListener("waiting", onWaiting);
		el.removeEventListener("playing", onPlaying);
		el.removeEventListener("ended", onEnded);
		el.removeEventListener("timeupdate", onTimeUpdate);
		el.removeEventListener("error", onError);
	}

	function processSourceElements(): void {
		if (activeHandler || srcExplicitlySet) return;
		const sources = el.querySelectorAll("source");
		for (const sourceEl of sources) {
			const sourceUrl = sourceEl.getAttribute("src");
			const sourceType = sourceEl.getAttribute("type") ?? undefined;
			if (!sourceUrl) continue;
			for (const handler of sourceHandlers) {
				if (handler.canHandle(sourceUrl, sourceType)) {
					activeHandler = handler;
					currentSrc = sourceUrl;
					setState("loading");
					handler.load(sourceUrl, el);
					return;
				}
			}
		}
	}

	const player: Player = {
		get el() {
			return el;
		},
		get state() {
			return state;
		},

		// --- EventBus ---
		// biome-ignore lint/suspicious/noExplicitAny: implementation signature covers both overloads
		on(event: string, handler: any): void {
			if (playerEvents.has(event)) {
				getHandlers(event).add(handler as EventHandler<unknown>);
			} else {
				el.addEventListener(event, handler as EventListener);
			}
		},
		// biome-ignore lint/suspicious/noExplicitAny: implementation signature covers both overloads
		off(event: string, handler: any): void {
			if (playerEvents.has(event)) {
				getHandlers(event).delete(handler as EventHandler<unknown>);
			} else {
				el.removeEventListener(event, handler as EventListener);
			}
		},
		emit,
		// biome-ignore lint/suspicious/noExplicitAny: implementation signature covers both overloads
		once(event: string, handler: any): void {
			const wrapper = (data: unknown) => {
				player.off(event, wrapper);
				handler(data);
			};
			player.on(event, wrapper);
		},

		// --- HTMLVideoElement proxy ---
		play() {
			return el.play();
		},
		pause() {
			el.pause();
		},
		get currentTime() {
			return el.currentTime;
		},
		set currentTime(v: number) {
			el.currentTime = v;
		},
		get duration() {
			return el.duration;
		},
		set duration(_v: number) {
			// read-only on HTMLVideoElement, no-op
		},
		get volume() {
			return el.volume;
		},
		set volume(v: number) {
			el.volume = v;
		},
		get muted() {
			return el.muted;
		},
		set muted(v: boolean) {
			el.muted = v;
		},
		get playbackRate() {
			return el.playbackRate;
		},
		set playbackRate(v: number) {
			el.playbackRate = v;
		},

		// --- Source handler ---
		get src(): string {
			return currentSrc;
		},
		set src(url: string) {
			if (activeHandler) {
				activeHandler.unload(el);
				activeHandler = null;
			}
			srcExplicitlySet = true;
			currentSrc = url;
			if (!url) {
				el.removeAttribute("src");
				return;
			}
			for (const handler of sourceHandlers) {
				if (handler.canHandle(url)) {
					activeHandler = handler;
					setState("loading");
					handler.load(url, el);
					return;
				}
			}
			el.src = url;
		},
		registerSourceHandler(handler: SourceHandler): void {
			if (destroyed) {
				console.warn("[vide] Cannot register source handler after destroy");
				return;
			}
			sourceHandlers.push(handler);
			if (!srcExplicitlySet && !activeHandler) {
				processSourceElements();
			}
		},

		// --- Web-standard delegation ---
		addEventListener(
			type: string,
			listener: EventListenerOrEventListenerObject,
			options?: boolean | AddEventListenerOptions,
		): void {
			el.addEventListener(type, listener, options);
		},
		removeEventListener(
			type: string,
			listener: EventListenerOrEventListenerObject,
			options?: boolean | EventListenerOptions,
		): void {
			el.removeEventListener(type, listener, options);
		},

		// --- vide specific ---
		use(plugin: Plugin): void {
			if (destroyed) {
				console.warn("[vide] Cannot use plugin after destroy");
				return;
			}
			const cleanup = plugin.setup(player);
			if (cleanup) {
				cleanups.push(cleanup);
			}
		},

		destroy(): void {
			if (destroyed) return;
			destroyed = true;
			if (activeHandler) {
				activeHandler.unload(el);
				activeHandler = null;
			}
			for (const cleanup of cleanups) {
				try {
					cleanup();
				} catch (err) {
					console.error("[vide] Plugin cleanup error:", err);
				}
			}
			cleanups.length = 0;
			emit("destroy", undefined as void);
			removeVideoListeners();
			handlers.clear();
		},
	};

	// Expose setState for plugins (e.g. VAST plugin needs to set ad states)
	(player as unknown as { _setState: typeof setState })._setState = setState;

	return player;
}
