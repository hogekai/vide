import { ERR_MEDIA } from "./errors.js";
import type {
	EventHandler,
	MediaElement,
	Player,
	PlayerEvent,
	PlayerEventMap,
	PlayerState,
	Plugin,
	PluginPlayer,
	QualityLevel,
	SeekableRange,
	SourceHandler,
	VideCue,
	VideTextTrack,
} from "./types.js";

// === State Machine ===

const transitions: Record<PlayerState, PlayerState[]> = {
	idle: ["loading", "playing", "error"],
	loading: ["ready", "playing", "error"],
	ready: ["playing", "loading", "ad:loading", "error"],
	playing: ["paused", "buffering", "loading", "ad:loading", "ended", "error"],
	paused: ["playing", "loading", "ad:loading", "ended", "error"],
	buffering: ["playing", "loading", "error"],
	"ad:loading": ["ad:playing", "playing", "error"],
	"ad:playing": ["ad:paused", "ad:loading", "playing", "error"],
	"ad:paused": ["ad:playing", "ad:loading", "playing", "error"],
	ended: ["idle", "loading", "ad:loading", "error"],
	error: ["idle", "loading"],
};

function canTransition(from: PlayerState, to: PlayerState): boolean {
	return transitions[from].includes(to);
}

/** Infer initial state from current media element readyState. */
function inferInitialState(el: MediaElement): PlayerState {
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

/** Create a vide player instance wrapping the given media element. */
export function createPlayer(el: MediaElement): Player {
	let state: PlayerState = inferInitialState(el);
	const isAudio = el instanceof HTMLAudioElement;
	const handlers = new Map<string, Set<EventHandler<unknown>>>();
	const cleanups: (() => void)[] = [];
	let destroyed = false;
	const sourceHandlers: SourceHandler[] = [];
	let activeHandler: SourceHandler | null = null;
	let currentSrc = el.getAttribute("src") ?? "";
	let srcExplicitlySet = false;
	const pluginData = new Map<string, unknown>();
	let prevIsLive = el.duration === Number.POSITIVE_INFINITY;
	let previousQuality: QualityLevel | null = null;

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
		if (!isAdState() && el.paused) {
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
		emit("play", undefined as undefined);
	}

	function onPause(): void {
		if (!isAdState()) {
			setState("paused");
		}
		emit("pause", undefined as undefined);
	}

	function onWaiting(): void {
		if (state === "playing") {
			setState("buffering");
		}
	}

	function onPlaying(): void {
		if (state === "buffering" || state === "ready") {
			setState("playing");
		}
	}

	function onEnded(): void {
		if (!isAdState()) {
			setState("ended");
		}
		emit("ended", undefined as undefined);
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
			code: mediaError?.code ?? ERR_MEDIA,
			message: mediaError?.message ?? "Unknown error",
			source: "core",
		});
	}

	function onDurationChange(): void {
		const currentIsLive = el.duration === Number.POSITIVE_INFINITY;
		if (currentIsLive !== prevIsLive) {
			prevIsLive = currentIsLive;
			emit("livestatechange", { isLive: currentIsLive });
		}
	}

	el.addEventListener("durationchange", onDurationChange);
	el.addEventListener("loadstart", onLoadStart);
	el.addEventListener("canplay", onCanPlay);
	el.addEventListener("play", onPlay);
	el.addEventListener("pause", onPause);
	el.addEventListener("waiting", onWaiting);
	el.addEventListener("playing", onPlaying);
	el.addEventListener("ended", onEnded);
	el.addEventListener("timeupdate", onTimeUpdate);
	el.addEventListener("error", onError);

	// --- Wire up TextTrack events ---

	function buildVideTextTrack(track: TextTrack, index: number): VideTextTrack {
		return {
			id: index,
			label: track.label,
			language: track.language,
			kind: track.kind as VideTextTrack["kind"],
			active: track.mode === "showing",
		};
	}

	function buildVideCues(cueList: TextTrackCueList | null): VideCue[] {
		if (!cueList) return [];
		const cues: VideCue[] = [];
		for (let i = 0; i < cueList.length; i++) {
			const cue = cueList[i];
			cues.push({
				startTime: cue.startTime,
				endTime: cue.endTime,
				text: (cue as VTTCue).text ?? "",
			});
		}
		return cues;
	}

	const cuechangeListeners = new Map<TextTrack, () => void>();

	function attachCueChangeListener(track: TextTrack): void {
		if (cuechangeListeners.has(track)) return;
		const handler = () => {
			if (track.mode === "showing") {
				emit("cuechange", { cues: buildVideCues(track.activeCues) });
			}
		};
		cuechangeListeners.set(track, handler);
		track.addEventListener("cuechange", handler);
	}

	function detachCueChangeListener(track: TextTrack): void {
		const handler = cuechangeListeners.get(track);
		if (handler) {
			track.removeEventListener("cuechange", handler);
			cuechangeListeners.delete(track);
		}
	}

	function emitTextTracksAvailable(): void {
		const tracks: VideTextTrack[] = [];
		for (let i = 0; i < el.textTracks.length; i++) {
			tracks.push(buildVideTextTrack(el.textTracks[i], i));
		}
		emit("texttracksavailable", { tracks });
	}

	function onAddTrack(): void {
		for (let i = 0; i < el.textTracks.length; i++) {
			attachCueChangeListener(el.textTracks[i]);
		}
		emitTextTracksAvailable();
	}

	function onRemoveTrack(e: TrackEvent): void {
		if (e.track) {
			detachCueChangeListener(e.track as TextTrack);
		}
		emitTextTracksAvailable();
	}

	const ttlSupportsEvents =
		typeof el.textTracks.addEventListener === "function";

	if (ttlSupportsEvents) {
		el.textTracks.addEventListener("addtrack", onAddTrack);
		el.textTracks.addEventListener(
			"removetrack",
			onRemoveTrack as EventListener,
		);

		for (let i = 0; i < el.textTracks.length; i++) {
			attachCueChangeListener(el.textTracks[i]);
		}
	}

	/** Known player event names managed by the EventBus. */
	const playerEvents = new Set<string>([
		"statechange",
		"play",
		"pause",
		"ended",
		"timeupdate",
		"livestatechange",
		"error",
		"ad:companions",
		"ad:nonlinears",
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
		"ad:pod:start",
		"ad:pod:end",
		"ad:pod:adstart",
		"ad:pod:adend",
		"qualitiesavailable",
		"qualitychange",
		"texttrackchange",
		"texttracksavailable",
		"cuechange",
		"destroy",
	]);

	function removeVideoListeners(): void {
		el.removeEventListener("durationchange", onDurationChange);
		el.removeEventListener("loadstart", onLoadStart);
		el.removeEventListener("canplay", onCanPlay);
		el.removeEventListener("play", onPlay);
		el.removeEventListener("pause", onPause);
		el.removeEventListener("waiting", onWaiting);
		el.removeEventListener("playing", onPlaying);
		el.removeEventListener("ended", onEnded);
		el.removeEventListener("timeupdate", onTimeUpdate);
		el.removeEventListener("error", onError);
		if (ttlSupportsEvents) {
			el.textTracks.removeEventListener("addtrack", onAddTrack);
			el.textTracks.removeEventListener(
				"removetrack",
				onRemoveTrack as EventListener,
			);
			for (const [track, handler] of cuechangeListeners) {
				track.removeEventListener("cuechange", handler);
			}
			cuechangeListeners.clear();
		}
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
					// Prevent the browser from attempting native loading
					// of <source> elements the handler has claimed.
					for (const s of sources) {
						s.remove();
					}
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
		get paused() {
			return el.paused;
		},
		get ended() {
			return el.ended;
		},
		get readyState() {
			return el.readyState;
		},
		get buffered() {
			return el.buffered;
		},
		get seekable() {
			return el.seekable;
		},
		get seeking() {
			return el.seeking;
		},
		get isLive(): boolean {
			if (destroyed) return false;
			return el.duration === Number.POSITIVE_INFINITY;
		},
		get seekableRange(): SeekableRange | null {
			if (destroyed) return null;
			if (el.seekable.length === 0) return null;
			return { start: el.seekable.start(0), end: el.seekable.end(0) };
		},
		get qualities(): QualityLevel[] {
			return (pluginData.get("qualities") as QualityLevel[]) ?? [];
		},
		get currentQuality(): QualityLevel | null {
			return (pluginData.get("currentQuality") as QualityLevel | null) ?? null;
		},
		get isAutoQuality(): boolean {
			return (pluginData.get("autoQuality") as boolean) ?? true;
		},
		get isAudio(): boolean {
			return isAudio;
		},
		setQuality(id: number): void {
			const setter = pluginData.get("qualitySetter") as
				| ((id: number) => void)
				| undefined;
			if (setter) {
				setter(id);
			}
		},

		// --- Text Track API ---
		get textTracks(): TextTrackList {
			return el.textTracks;
		},
		getTextTracks(): VideTextTrack[] {
			const tracks: VideTextTrack[] = [];
			for (let i = 0; i < el.textTracks.length; i++) {
				tracks.push(buildVideTextTrack(el.textTracks[i], i));
			}
			return tracks;
		},
		getActiveTextTrack(): VideTextTrack | null {
			for (let i = 0; i < el.textTracks.length; i++) {
				if (el.textTracks[i].mode === "showing") {
					return buildVideTextTrack(el.textTracks[i], i);
				}
			}
			return null;
		},
		get activeCues(): VideCue[] {
			for (let i = 0; i < el.textTracks.length; i++) {
				if (el.textTracks[i].mode === "showing") {
					return buildVideCues(el.textTracks[i].activeCues);
				}
			}
			return [];
		},
		setTextTrack(id: number): void {
			for (let i = 0; i < el.textTracks.length; i++) {
				el.textTracks[i].mode = i === id ? "showing" : "disabled";
			}
			const track =
				id >= 0 && id < el.textTracks.length
					? buildVideTextTrack(el.textTracks[id], id)
					: null;
			emit("texttrackchange", { track });
		},
		addTextTrack(options: {
			src: string;
			label: string;
			language: string;
			kind?: "subtitles" | "captions";
			default?: boolean;
		}): void {
			const trackEl = document.createElement("track");
			trackEl.src = options.src;
			trackEl.label = options.label;
			trackEl.srclang = options.language;
			trackEl.kind = options.kind ?? "subtitles";
			if (options.default) {
				trackEl.default = true;
			}
			el.appendChild(trackEl);
		},

		get videoWidth() {
			return isAudio ? 0 : (el as HTMLVideoElement).videoWidth;
		},
		get videoHeight() {
			return isAudio ? 0 : (el as HTMLVideoElement).videoHeight;
		},
		get networkState() {
			return el.networkState;
		},
		get loop() {
			return el.loop;
		},
		set loop(v: boolean) {
			el.loop = v;
		},
		get autoplay() {
			return el.autoplay;
		},
		set autoplay(v: boolean) {
			el.autoplay = v;
		},
		get poster() {
			return isAudio ? "" : (el as HTMLVideoElement).poster;
		},
		set poster(v: string) {
			if (!isAudio) {
				(el as HTMLVideoElement).poster = v;
			}
		},
		get preload() {
			return el.preload;
		},
		set preload(v: "" | "none" | "metadata" | "auto") {
			el.preload = v;
		},
		get defaultPlaybackRate() {
			return el.defaultPlaybackRate;
		},
		set defaultPlaybackRate(v: number) {
			el.defaultPlaybackRate = v;
		},
		get defaultMuted() {
			return el.defaultMuted;
		},
		set defaultMuted(v: boolean) {
			el.defaultMuted = v;
		},
		get crossOrigin() {
			return el.crossOrigin;
		},
		set crossOrigin(v: string | null) {
			el.crossOrigin = v;
		},
		get controls() {
			return el.controls;
		},
		set controls(v: boolean) {
			el.controls = v;
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
			pluginData.delete("qualities");
			pluginData.delete("currentQuality");
			pluginData.delete("autoQuality");
			pluginData.delete("qualitySetter");
			previousQuality = null;
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
			const cleanup = plugin.setup(player as PluginPlayer);
			if (cleanup) {
				cleanups.push(cleanup);
			}
		},

		setPluginData(key: string, data: unknown): void {
			pluginData.set(key, data);
			if (key === "qualities") {
				emit("qualitiesavailable", {
					qualities: data as QualityLevel[],
				});
			} else if (key === "currentQuality") {
				const next = data as QualityLevel;
				emit("qualitychange", { from: previousQuality, to: next });
				previousQuality = next;
			}
		},
		getPluginData(key: string): unknown {
			return pluginData.get(key);
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
			emit("destroy", undefined as undefined);
			removeVideoListeners();
			handlers.clear();
			pluginData.clear();
		},
	};

	// Expose setState for plugins (e.g. VAST plugin needs to set ad states)
	(player as unknown as { setState: typeof setState }).setState = setState;

	return player;
}
