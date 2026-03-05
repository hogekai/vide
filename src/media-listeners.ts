import { ERR_MEDIA } from "./errors.js";
import type { EventBus } from "./event-bus.js";
import { isAdState } from "./state-machine.js";
import { buildVideCues, buildVideTextTrack } from "./text-track.js";
import type { MediaElement, PlayerState } from "./types.js";

export interface MediaListenerDeps {
	el: MediaElement;
	bus: EventBus;
	getState: () => PlayerState;
	setState: (next: PlayerState) => void;
}

export function attachMediaListeners(deps: MediaListenerDeps): () => void {
	const { el, bus, getState, setState } = deps;
	let prevIsLive = el.duration === Number.POSITIVE_INFINITY;

	function onDurationChange(): void {
		const currentIsLive = el.duration === Number.POSITIVE_INFINITY;
		if (currentIsLive !== prevIsLive) {
			prevIsLive = currentIsLive;
			bus.emit("livestatechange", { isLive: currentIsLive });
		}
	}

	function onLoadStart(): void {
		if (!isAdState(getState()) && el.paused) {
			setState("loading");
		}
	}

	function onCanPlay(): void {
		if (getState() === "loading") {
			setState("ready");
		}
	}

	function onPlay(): void {
		if (!isAdState(getState())) {
			setState("playing");
		}
		bus.emit("play", undefined as undefined);
	}

	function onPause(): void {
		if (!isAdState(getState())) {
			setState("paused");
		}
		bus.emit("pause", undefined as undefined);
	}

	function onWaiting(): void {
		if (getState() === "playing") {
			setState("buffering");
		}
	}

	function onPlaying(): void {
		const s = getState();
		if (s === "buffering" || s === "ready") {
			setState("playing");
		}
	}

	function onEnded(): void {
		if (!isAdState(getState())) {
			setState("ended");
		}
		bus.emit("ended", undefined as undefined);
	}

	function onTimeUpdate(): void {
		bus.emit("timeupdate", {
			currentTime: el.currentTime,
			duration: el.duration,
		});
	}

	function onError(): void {
		const mediaError = el.error;
		if (!isAdState(getState())) {
			setState("error");
		}
		bus.emit("error", {
			code: mediaError?.code ?? ERR_MEDIA,
			message: mediaError?.message ?? "Unknown error",
			source: "core",
		});
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

	// --- TextTrack listeners ---

	const cuechangeListeners = new Map<TextTrack, () => void>();

	function attachCueChangeListener(track: TextTrack): void {
		if (cuechangeListeners.has(track)) return;
		const handler = () => {
			if (track.mode === "showing") {
				bus.emit("cuechange", { cues: buildVideCues(track.activeCues) });
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
		const tracks = [];
		for (let i = 0; i < el.textTracks.length; i++) {
			tracks.push(buildVideTextTrack(el.textTracks[i], i));
		}
		bus.emit("texttracksavailable", { tracks });
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

	// --- Cleanup ---

	return function removeAllListeners(): void {
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
	};
}
