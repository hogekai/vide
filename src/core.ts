import { createEventBus, offEvent, onEvent } from "./event-bus.js";
import { attachMediaListeners } from "./media-listeners.js";
import { canTransition, inferInitialState } from "./state-machine.js";
import { buildVideCues, buildVideTextTrack } from "./text-track.js";
import type {
	MediaElement,
	Player,
	PlayerState,
	Plugin,
	PluginDataMap,
	PluginPlayer,
	QualityLevel,
	SeekableRange,
	SourceHandler,
	VideCue,
	VideTextTrack,
} from "./types.js";

/** Create a vide player instance wrapping the given media element. */
export function createPlayer(el: MediaElement): Player {
	let state: PlayerState = inferInitialState(el);
	const isAudio = el instanceof HTMLAudioElement;
	const bus = createEventBus();
	const cleanups: (() => void)[] = [];
	let destroyed = false;
	const sourceHandlers: SourceHandler[] = [];
	let activeHandler: SourceHandler | null = null;
	let currentSrc = el.getAttribute("src") ?? "";
	let srcExplicitlySet = false;
	const pluginData = new Map<string, unknown>();
	let previousQuality: QualityLevel | null = null;

	function setState(next: PlayerState): void {
		if (next === state) return;
		if (!canTransition(state, next)) {
			console.warn(`[vide] Invalid transition: ${state} → ${next}`);
			return;
		}
		const from = state;
		state = next;
		bus.emit("statechange", { from, to: next });
	}

	const removeMediaListeners = attachMediaListeners({
		el,
		bus,
		getState: () => state,
		setState,
	});

	function resolveAndLoadSource(url: string, type?: string): boolean {
		for (const handler of sourceHandlers) {
			if (handler.canHandle(url, type)) {
				activeHandler = handler;
				currentSrc = url;
				setState("loading");
				handler.load(url, el);
				return true;
			}
		}
		return false;
	}

	function processSourceElements(): void {
		if (activeHandler || srcExplicitlySet) return;
		const sources = el.querySelectorAll("source");
		for (const sourceEl of sources) {
			const sourceUrl = sourceEl.getAttribute("src");
			const sourceType = sourceEl.getAttribute("type") ?? undefined;
			if (!sourceUrl) continue;
			if (resolveAndLoadSource(sourceUrl, sourceType)) {
				for (const s of sources) s.remove();
				return;
			}
		}
	}

	// biome-ignore lint/complexity/noBannedTypes: WeakMap needs Function key for handler→wrapper mapping
	const onceWrappers = new WeakMap<Function, Function>();

	const player: PluginPlayer = {
		get el() {
			return el;
		},
		get state() {
			return state;
		},

		// --- EventBus ---
		// biome-ignore lint/suspicious/noExplicitAny: implementation signature covers both overloads
		on(event: string, handler: any): void {
			if (destroyed) return;
			onEvent(bus, el, event, handler);
		},
		// biome-ignore lint/suspicious/noExplicitAny: implementation signature covers both overloads
		off(event: string, handler: any): void {
			if (destroyed) return;
			const wrapper = onceWrappers.get(handler);
			if (wrapper) {
				onceWrappers.delete(handler);
				offEvent(bus, el, event, wrapper);
			} else {
				offEvent(bus, el, event, handler);
			}
		},
		emit(...args: Parameters<typeof bus.emit>) {
			if (destroyed) return;
			bus.emit(...args);
		},
		// biome-ignore lint/suspicious/noExplicitAny: implementation signature covers both overloads
		once(event: string, handler: any): void {
			if (destroyed) return;
			const wrapper = (data: unknown) => {
				onceWrappers.delete(handler);
				player.off(event, wrapper);
				handler(data);
			};
			onceWrappers.set(handler, wrapper);
			player.on(event, wrapper);
		},

		// --- HTMLVideoElement proxy ---
		play() {
			if (destroyed)
				return Promise.reject(
					new DOMException("Player is destroyed", "InvalidStateError"),
				);
			return el.play();
		},
		pause() {
			if (destroyed) return;
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
			return player.getPluginData("qualities") ?? [];
		},
		get currentQuality(): QualityLevel | null {
			return player.getPluginData("currentQuality") ?? null;
		},
		get isAutoQuality(): boolean {
			return player.getPluginData("autoQuality") ?? true;
		},
		get isAudio(): boolean {
			return isAudio;
		},
		setQuality(id: number): void {
			const setter = player.getPluginData("qualitySetter");
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
			bus.emit("texttrackchange", { track });
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
			if (destroyed) return;
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
			if (!resolveAndLoadSource(url)) {
				el.src = url;
			}
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
		setState,

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

		setPluginData<K extends keyof PluginDataMap>(
			key: K,
			data: PluginDataMap[K],
		): void {
			pluginData.set(key, data);
			if (key === "qualities") {
				bus.emit("qualitiesavailable", {
					qualities: data as PluginDataMap["qualities"],
				});
			} else if (key === "currentQuality") {
				const next = data as PluginDataMap["currentQuality"];
				if (next) {
					bus.emit("qualitychange", { from: previousQuality, to: next });
				}
				previousQuality = next;
			}
		},
		getPluginData<K extends keyof PluginDataMap>(
			key: K,
		): PluginDataMap[K] | undefined {
			return pluginData.get(key) as PluginDataMap[K] | undefined;
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
			bus.emit("destroy", undefined as undefined);
			removeMediaListeners();
			bus.handlers.clear();
			pluginData.clear();
		},
	};

	return player;
}
