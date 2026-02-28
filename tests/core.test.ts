import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../src/core.js";
import type { PlayerState } from "../src/types.js";

function makeVideo(): HTMLVideoElement {
	return document.createElement("video");
}

describe("createPlayer", () => {
	it("returns a player with initial state 'idle'", () => {
		const player = createPlayer(makeVideo());
		expect(player.state).toBe("idle");
	});

	it("exposes the underlying video element", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		expect(player.el).toBe(el);
	});
});

describe("inferInitialState", () => {
	it("starts in 'playing' when video is already playing", () => {
		const el = makeVideo();
		Object.defineProperty(el, "readyState", { value: 3, configurable: true });
		Object.defineProperty(el, "paused", { value: false, configurable: true });
		const player = createPlayer(el);
		expect(player.state).toBe("playing");
	});

	it("starts in 'ready' when video has data but is paused", () => {
		const el = makeVideo();
		Object.defineProperty(el, "readyState", { value: 4, configurable: true });
		Object.defineProperty(el, "paused", { value: true, configurable: true });
		const player = createPlayer(el);
		expect(player.state).toBe("ready");
	});

	it("starts in 'loading' when video has metadata", () => {
		const el = makeVideo();
		Object.defineProperty(el, "readyState", { value: 1, configurable: true });
		const player = createPlayer(el);
		expect(player.state).toBe("loading");
	});
});

describe("autoplay scenarios", () => {
	it("autoplay muted: loadstart→canplay→play transitions to playing", () => {
		const el = makeVideo();
		el.setAttribute("autoplay", "");
		el.muted = true;
		const player = createPlayer(el);
		const states: string[] = [];
		player.on("statechange", ({ to }: { to: string }) => states.push(to));

		el.dispatchEvent(new Event("loadstart"));
		el.dispatchEvent(new Event("canplay"));
		el.dispatchEvent(new Event("play"));

		expect(states).toEqual(["loading", "ready", "playing"]);
		expect(player.state).toBe("playing");
	});

	it("autoplay blocked: play then immediate pause transitions to paused", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const states: string[] = [];
		player.on("statechange", ({ to }: { to: string }) => states.push(to));

		el.dispatchEvent(new Event("loadstart"));
		el.dispatchEvent(new Event("canplay"));
		el.dispatchEvent(new Event("play"));
		el.dispatchEvent(new Event("pause"));

		expect(states).toEqual(["loading", "ready", "playing", "paused"]);
		expect(player.state).toBe("paused");
	});
});

describe("state transitions", () => {
	it("idle → loading on loadstart", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		el.dispatchEvent(new Event("loadstart"));
		expect(player.state).toBe("loading");
	});

	it("loading → ready on canplay", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		el.dispatchEvent(new Event("loadstart"));
		el.dispatchEvent(new Event("canplay"));
		expect(player.state).toBe("ready");
	});

	it("ready → playing on play", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		el.dispatchEvent(new Event("loadstart"));
		el.dispatchEvent(new Event("canplay"));
		el.dispatchEvent(new Event("play"));
		expect(player.state).toBe("playing");
	});

	it("playing → paused on pause", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		el.dispatchEvent(new Event("loadstart"));
		el.dispatchEvent(new Event("canplay"));
		el.dispatchEvent(new Event("play"));
		el.dispatchEvent(new Event("pause"));
		expect(player.state).toBe("paused");
	});

	it("paused → playing on play", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		el.dispatchEvent(new Event("loadstart"));
		el.dispatchEvent(new Event("canplay"));
		el.dispatchEvent(new Event("play"));
		el.dispatchEvent(new Event("pause"));
		el.dispatchEvent(new Event("play"));
		expect(player.state).toBe("playing");
	});

	it("playing → buffering on waiting", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		el.dispatchEvent(new Event("loadstart"));
		el.dispatchEvent(new Event("canplay"));
		el.dispatchEvent(new Event("play"));
		el.dispatchEvent(new Event("waiting"));
		expect(player.state).toBe("buffering");
	});

	it("buffering → playing on playing", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		el.dispatchEvent(new Event("loadstart"));
		el.dispatchEvent(new Event("canplay"));
		el.dispatchEvent(new Event("play"));
		el.dispatchEvent(new Event("waiting"));
		el.dispatchEvent(new Event("playing"));
		expect(player.state).toBe("playing");
	});

	it("playing → ended on ended", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		el.dispatchEvent(new Event("loadstart"));
		el.dispatchEvent(new Event("canplay"));
		el.dispatchEvent(new Event("play"));
		el.dispatchEvent(new Event("ended"));
		expect(player.state).toBe("ended");
	});

	it("idle → playing on play before loadstart", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		expect(player.state).toBe("idle");

		// User clicks play before loadstart fires
		el.dispatchEvent(new Event("play"));
		expect(player.state).toBe("playing");
	});

	it("loading → playing on play before canplay", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		el.dispatchEvent(new Event("loadstart"));
		expect(player.state).toBe("loading");

		// User clicks play before video is ready
		el.dispatchEvent(new Event("play"));
		expect(player.state).toBe("playing");
	});

	it("ignores loadstart while video is playing (race condition)", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		el.dispatchEvent(new Event("loadstart"));
		el.dispatchEvent(new Event("canplay"));
		el.dispatchEvent(new Event("play"));
		expect(player.state).toBe("playing");

		// Simulate el.paused === false (video is actively playing)
		Object.defineProperty(el, "paused", { value: false, configurable: true });

		// Spurious loadstart while playing should be ignored
		el.dispatchEvent(new Event("loadstart"));
		expect(player.state).toBe("playing");
	});

	it("ready → playing on playing event (recovery)", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		el.dispatchEvent(new Event("loadstart"));
		el.dispatchEvent(new Event("canplay"));
		expect(player.state).toBe("ready");

		// The "playing" DOM event should transition ready → playing
		el.dispatchEvent(new Event("playing"));
		expect(player.state).toBe("playing");
	});

	it("any → error on error", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		el.dispatchEvent(new Event("loadstart"));
		el.dispatchEvent(new Event("error"));
		expect(player.state).toBe("error");
	});

	it("error → idle is allowed (via statechange)", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		el.dispatchEvent(new Event("error"));
		expect(player.state).toBe("error");
		// error → loading is a valid transition
		el.dispatchEvent(new Event("loadstart"));
		expect(player.state).toBe("loading");
	});

	it("warns on invalid transition", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const el = makeVideo();
		const player = createPlayer(el);
		// idle → paused is not valid
		el.dispatchEvent(new Event("pause"));
		expect(player.state).toBe("idle");
		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining("Invalid transition"),
		);
		warn.mockRestore();
	});
});

describe("EventBus", () => {
	it("on/emit fires handlers", () => {
		const player = createPlayer(makeVideo());
		const handler = vi.fn();
		player.on("statechange", handler);
		player.el.dispatchEvent(new Event("loadstart"));
		expect(handler).toHaveBeenCalledWith({ from: "idle", to: "loading" });
	});

	it("off removes handlers", () => {
		const player = createPlayer(makeVideo());
		const handler = vi.fn();
		player.on("statechange", handler);
		player.off("statechange", handler);
		player.el.dispatchEvent(new Event("loadstart"));
		expect(handler).not.toHaveBeenCalled();
	});

	it("once fires handler only once", () => {
		const player = createPlayer(makeVideo());
		const handler = vi.fn();
		player.once("statechange", handler);
		player.el.dispatchEvent(new Event("loadstart"));
		player.el.dispatchEvent(new Event("canplay"));
		expect(handler).toHaveBeenCalledTimes(1);
		expect(handler).toHaveBeenCalledWith({ from: "idle", to: "loading" });
	});

	it("emits play event", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const handler = vi.fn();
		player.on("play", handler);
		el.dispatchEvent(new Event("loadstart"));
		el.dispatchEvent(new Event("canplay"));
		el.dispatchEvent(new Event("play"));
		expect(handler).toHaveBeenCalled();
	});

	it("emits pause event", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const handler = vi.fn();
		player.on("pause", handler);
		el.dispatchEvent(new Event("loadstart"));
		el.dispatchEvent(new Event("canplay"));
		el.dispatchEvent(new Event("play"));
		el.dispatchEvent(new Event("pause"));
		expect(handler).toHaveBeenCalled();
	});

	it("emits timeupdate event", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const handler = vi.fn();
		player.on("timeupdate", handler);
		el.dispatchEvent(new Event("timeupdate"));
		expect(handler).toHaveBeenCalledWith({
			currentTime: el.currentTime,
			duration: el.duration,
		});
	});

	it("emits ended event", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const handler = vi.fn();
		player.on("ended", handler);
		el.dispatchEvent(new Event("loadstart"));
		el.dispatchEvent(new Event("canplay"));
		el.dispatchEvent(new Event("play"));
		el.dispatchEvent(new Event("ended"));
		expect(handler).toHaveBeenCalled();
	});

	it("continues calling handlers even if one throws", () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const el = makeVideo();
		const player = createPlayer(el);
		const handler2 = vi.fn();
		player.on("statechange", () => {
			throw new Error("handler boom");
		});
		player.on("statechange", handler2);
		el.dispatchEvent(new Event("loadstart"));
		expect(handler2).toHaveBeenCalledWith({ from: "idle", to: "loading" });
		expect(errorSpy).toHaveBeenCalledWith(
			"[vide] Event handler error:",
			expect.any(Error),
		);
		errorSpy.mockRestore();
	});
});

describe("EventBus fallback to HTMLVideoElement", () => {
	it("forwards unknown event names to el.addEventListener", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const handler = vi.fn();
		player.on("volumechange", handler);
		el.dispatchEvent(new Event("volumechange"));
		expect(handler).toHaveBeenCalled();
	});

	it("removes forwarded listeners via off()", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const handler = vi.fn();
		player.on("volumechange", handler);
		player.off("volumechange", handler);
		el.dispatchEvent(new Event("volumechange"));
		expect(handler).not.toHaveBeenCalled();
	});

	it("once() works for forwarded events", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const handler = vi.fn();
		player.once("volumechange", handler);
		el.dispatchEvent(new Event("volumechange"));
		el.dispatchEvent(new Event("volumechange"));
		expect(handler).toHaveBeenCalledTimes(1);
	});

	it("does not forward known player events to el", () => {
		const el = makeVideo();
		const addSpy = vi.spyOn(el, "addEventListener");
		const player = createPlayer(el);
		const callsBefore = addSpy.mock.calls.length;
		const handler = vi.fn();
		player.on("ad:start", handler);
		// ad:start should go through EventBus, not el.addEventListener
		expect(addSpy.mock.calls.length).toBe(callsBefore);
	});
});

describe("addEventListener / removeEventListener", () => {
	it("addEventListener delegates to the video element", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const handler = vi.fn();
		player.addEventListener("volumechange", handler);
		el.dispatchEvent(new Event("volumechange"));
		expect(handler).toHaveBeenCalled();
	});

	it("removeEventListener removes the listener", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const handler = vi.fn();
		player.addEventListener("volumechange", handler);
		player.removeEventListener("volumechange", handler);
		el.dispatchEvent(new Event("volumechange"));
		expect(handler).not.toHaveBeenCalled();
	});

	it("supports options parameter", () => {
		const el = makeVideo();
		const addSpy = vi.spyOn(el, "addEventListener");
		const player = createPlayer(el);
		const callsBefore = addSpy.mock.calls.length;
		const handler = vi.fn();
		player.addEventListener("volumechange", handler, { once: true });
		expect(addSpy.mock.calls.length).toBe(callsBefore + 1);
		expect(addSpy).toHaveBeenLastCalledWith("volumechange", handler, {
			once: true,
		});
	});
});

describe("HTMLVideoElement proxy", () => {
	it("delegates play() to the video element", async () => {
		const el = makeVideo();
		const playSpy = vi.spyOn(el, "play").mockResolvedValue();
		const player = createPlayer(el);
		await player.play();
		expect(playSpy).toHaveBeenCalled();
	});

	it("delegates pause() to the video element", () => {
		const el = makeVideo();
		const pauseSpy = vi.spyOn(el, "pause");
		const player = createPlayer(el);
		player.pause();
		expect(pauseSpy).toHaveBeenCalled();
	});

	it("proxies volume", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.volume = 0.5;
		expect(el.volume).toBe(0.5);
		expect(player.volume).toBe(0.5);
	});

	it("proxies muted", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.muted = true;
		expect(el.muted).toBe(true);
		expect(player.muted).toBe(true);
	});

	it("proxies playbackRate", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.playbackRate = 2;
		expect(el.playbackRate).toBe(2);
		expect(player.playbackRate).toBe(2);
	});
});

describe("destroy", () => {
	it("emits destroy event", () => {
		const player = createPlayer(makeVideo());
		const handler = vi.fn();
		player.on("destroy", handler);
		player.destroy();
		expect(handler).toHaveBeenCalled();
	});

	it("removes video element listeners", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.destroy();
		const handler = vi.fn();
		player.on("statechange", handler);
		el.dispatchEvent(new Event("loadstart"));
		// statechange should not fire because video listeners were removed
		expect(handler).not.toHaveBeenCalled();
	});

	it("clears all event handlers", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const handler = vi.fn();
		player.on("statechange", handler);
		player.destroy();
		// After destroy, emitting should not fire handlers (handlers were cleared)
		player.emit("statechange", {
			from: "idle" as PlayerState,
			to: "loading" as PlayerState,
		});
		expect(handler).not.toHaveBeenCalled();
	});

	it("is idempotent", () => {
		const player = createPlayer(makeVideo());
		const handler = vi.fn();
		player.on("destroy", handler);
		player.destroy();
		player.destroy();
		expect(handler).toHaveBeenCalledTimes(1);
	});

	it("continues cleanup even if one plugin throws", () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const player = createPlayer(makeVideo());
		const cleanup2 = vi.fn();
		player.use({
			name: "bad",
			setup: () => () => {
				throw new Error("cleanup boom");
			},
		});
		player.use({ name: "good", setup: () => cleanup2 });
		player.destroy();
		expect(cleanup2).toHaveBeenCalledTimes(1);
		expect(errorSpy).toHaveBeenCalledWith(
			"[vide] Plugin cleanup error:",
			expect.any(Error),
		);
		errorSpy.mockRestore();
	});
});

describe("player.src", () => {
	it("sets el.src when no handler is registered", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.src = "https://example.com/video.mp4";
		expect(el.src).toContain("video.mp4");
		expect(player.src).toBe("https://example.com/video.mp4");
	});

	it("delegates to registered SourceHandler when canHandle returns true", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const load = vi.fn();
		const unload = vi.fn();
		player.registerSourceHandler({
			canHandle: (url) => url.endsWith(".m3u8"),
			load,
			unload,
		});
		player.src = "https://example.com/stream.m3u8";
		expect(load).toHaveBeenCalledWith("https://example.com/stream.m3u8", el);
		expect(player.src).toBe("https://example.com/stream.m3u8");
	});

	it("falls through to el.src when no handler matches", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.registerSourceHandler({
			canHandle: (url) => url.endsWith(".m3u8"),
			load: vi.fn(),
			unload: vi.fn(),
		});
		player.src = "https://example.com/video.mp4";
		expect(el.src).toContain("video.mp4");
	});

	it("calls unload on previous handler when src changes", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const unload = vi.fn();
		player.registerSourceHandler({
			canHandle: () => true,
			load: vi.fn(),
			unload,
		});
		player.src = "https://example.com/a.m3u8";
		player.src = "https://example.com/b.m3u8";
		expect(unload).toHaveBeenCalledTimes(1);
		expect(unload).toHaveBeenCalledWith(el);
	});

	it("transitions to loading state when handler claims the source", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.registerSourceHandler({
			canHandle: () => true,
			load: vi.fn(),
			unload: vi.fn(),
		});
		player.src = "https://example.com/stream.m3u8";
		expect(player.state).toBe("loading");
	});

	it("calls active handler unload on destroy", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const unload = vi.fn();
		player.registerSourceHandler({
			canHandle: () => true,
			load: vi.fn(),
			unload,
		});
		player.src = "https://example.com/stream.m3u8";
		player.destroy();
		expect(unload).toHaveBeenCalledWith(el);
	});

	it("clears src when set to empty string", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.src = "https://example.com/video.mp4";
		player.src = "";
		expect(player.src).toBe("");
	});

	it("FIFO order: first matching handler wins", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const load1 = vi.fn();
		const load2 = vi.fn();
		player.registerSourceHandler({
			canHandle: () => true,
			load: load1,
			unload: vi.fn(),
		});
		player.registerSourceHandler({
			canHandle: () => true,
			load: load2,
			unload: vi.fn(),
		});
		player.src = "https://example.com/stream.m3u8";
		expect(load1).toHaveBeenCalled();
		expect(load2).not.toHaveBeenCalled();
	});

	it("warns when registering handler after destroy", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const player = createPlayer(makeVideo());
		player.destroy();
		player.registerSourceHandler({
			canHandle: () => true,
			load: vi.fn(),
			unload: vi.fn(),
		});
		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining("Cannot register source handler after destroy"),
		);
		warn.mockRestore();
	});

	it("allows source change during playback (playing → loading)", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.registerSourceHandler({
			canHandle: () => true,
			load: vi.fn(),
			unload: vi.fn(),
		});
		// Reach playing state
		el.dispatchEvent(new Event("loadstart"));
		el.dispatchEvent(new Event("canplay"));
		el.dispatchEvent(new Event("play"));
		expect(player.state).toBe("playing");
		// Change source mid-playback
		player.src = "https://example.com/other.m3u8";
		expect(player.state).toBe("loading");
	});
});

describe("setPluginData / getPluginData", () => {
	it("stores and retrieves plugin data", () => {
		const player = createPlayer(makeVideo());
		player.setPluginData("drm", { keySystem: "com.widevine.alpha" });
		expect(player.getPluginData("drm")).toEqual({
			keySystem: "com.widevine.alpha",
		});
	});

	it("returns undefined for unset keys", () => {
		const player = createPlayer(makeVideo());
		expect(player.getPluginData("nonexistent")).toBeUndefined();
	});

	it("overwrites existing data", () => {
		const player = createPlayer(makeVideo());
		player.setPluginData("drm", { v: 1 });
		player.setPluginData("drm", { v: 2 });
		expect(player.getPluginData("drm")).toEqual({ v: 2 });
	});

	it("clears plugin data on destroy", () => {
		const player = createPlayer(makeVideo());
		player.setPluginData("drm", { test: true });
		player.destroy();
		expect(player.getPluginData("drm")).toBeUndefined();
	});
});

describe("live stream detection", () => {
	it("isLive returns false for finite duration", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		expect(player.isLive).toBe(false);
	});

	it("isLive returns true when duration is Number.POSITIVE_INFINITY", () => {
		const el = makeVideo();
		Object.defineProperty(el, "duration", {
			value: Number.POSITIVE_INFINITY,
			configurable: true,
		});
		const player = createPlayer(el);
		expect(player.isLive).toBe(true);
	});

	it("isLive returns false after destroy", () => {
		const el = makeVideo();
		Object.defineProperty(el, "duration", {
			value: Number.POSITIVE_INFINITY,
			configurable: true,
		});
		const player = createPlayer(el);
		expect(player.isLive).toBe(true);
		player.destroy();
		expect(player.isLive).toBe(false);
	});

	it("seekableRange returns null when seekable is empty", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		expect(player.seekableRange).toBeNull();
	});

	it("seekableRange returns start/end from el.seekable", () => {
		const el = makeVideo();
		Object.defineProperty(el, "seekable", {
			value: {
				length: 1,
				start: () => 0,
				end: () => 120,
			},
			configurable: true,
		});
		const player = createPlayer(el);
		expect(player.seekableRange).toEqual({ start: 0, end: 120 });
	});

	it("seekableRange returns null after destroy", () => {
		const el = makeVideo();
		Object.defineProperty(el, "seekable", {
			value: { length: 1, start: () => 0, end: () => 120 },
			configurable: true,
		});
		const player = createPlayer(el);
		expect(player.seekableRange).toEqual({ start: 0, end: 120 });
		player.destroy();
		expect(player.seekableRange).toBeNull();
	});

	it("emits livestatechange when duration changes to Number.POSITIVE_INFINITY", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const handler = vi.fn();
		player.on("livestatechange", handler);

		Object.defineProperty(el, "duration", {
			value: Number.POSITIVE_INFINITY,
			configurable: true,
		});
		el.dispatchEvent(new Event("durationchange"));

		expect(handler).toHaveBeenCalledWith({ isLive: true });
	});

	it("emits livestatechange when duration changes from Number.POSITIVE_INFINITY to finite", () => {
		const el = makeVideo();
		Object.defineProperty(el, "duration", {
			value: Number.POSITIVE_INFINITY,
			configurable: true,
		});
		const player = createPlayer(el);
		const handler = vi.fn();
		player.on("livestatechange", handler);

		Object.defineProperty(el, "duration", {
			value: 300,
			configurable: true,
		});
		el.dispatchEvent(new Event("durationchange"));

		expect(handler).toHaveBeenCalledWith({ isLive: false });
	});

	it("does not emit livestatechange when isLive does not change", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const handler = vi.fn();
		player.on("livestatechange", handler);

		Object.defineProperty(el, "duration", {
			value: 300,
			configurable: true,
		});
		el.dispatchEvent(new Event("durationchange"));

		expect(handler).not.toHaveBeenCalled();
	});

	it("does not emit livestatechange after destroy", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const handler = vi.fn();
		player.on("livestatechange", handler);
		player.destroy();

		Object.defineProperty(el, "duration", {
			value: Number.POSITIVE_INFINITY,
			configurable: true,
		});
		el.dispatchEvent(new Event("durationchange"));

		expect(handler).not.toHaveBeenCalled();
	});

	it("initializes prevIsLive correctly for already-live element", () => {
		const el = makeVideo();
		Object.defineProperty(el, "duration", {
			value: Number.POSITIVE_INFINITY,
			configurable: true,
		});
		const player = createPlayer(el);
		const handler = vi.fn();
		player.on("livestatechange", handler);

		// Duration is still Number.POSITIVE_INFINITY — no state change
		el.dispatchEvent(new Event("durationchange"));
		expect(handler).not.toHaveBeenCalled();

		// Now switch to finite
		Object.defineProperty(el, "duration", {
			value: 600,
			configurable: true,
		});
		el.dispatchEvent(new Event("durationchange"));
		expect(handler).toHaveBeenCalledWith({ isLive: false });
	});
});

describe("<source> element auto-processing", () => {
	it("processes <source> element when handler is registered", () => {
		const el = document.createElement("video");
		const source = document.createElement("source");
		source.setAttribute("src", "https://example.com/stream.m3u8");
		source.setAttribute("type", "application/vnd.apple.mpegurl");
		el.appendChild(source);

		const load = vi.fn();
		const player = createPlayer(el);
		player.registerSourceHandler({
			canHandle: (_url, type) => type === "application/vnd.apple.mpegurl",
			load,
			unload: vi.fn(),
		});
		expect(load).toHaveBeenCalledWith("https://example.com/stream.m3u8", el);
		expect(player.src).toBe("https://example.com/stream.m3u8");
	});

	it("skips <source> auto-read if player.src was explicitly set", () => {
		const el = document.createElement("video");
		const source = document.createElement("source");
		source.setAttribute("src", "https://example.com/stream.m3u8");
		el.appendChild(source);

		const load = vi.fn();
		const player = createPlayer(el);
		player.src = "https://example.com/other.mp4";
		player.registerSourceHandler({
			canHandle: () => true,
			load,
			unload: vi.fn(),
		});
		expect(load).not.toHaveBeenCalled();
	});

	it("removes <source> elements after a handler claims one", () => {
		const el = document.createElement("video");
		const source1 = document.createElement("source");
		source1.setAttribute("src", "https://example.com/stream.m3u8");
		source1.setAttribute("type", "application/vnd.apple.mpegurl");
		el.appendChild(source1);
		const source2 = document.createElement("source");
		source2.setAttribute("src", "https://example.com/fallback.mp4");
		source2.setAttribute("type", "video/mp4");
		el.appendChild(source2);

		const player = createPlayer(el);
		player.registerSourceHandler({
			canHandle: (_url, type) => type === "application/vnd.apple.mpegurl",
			load: vi.fn(),
			unload: vi.fn(),
		});

		expect(el.querySelectorAll("source").length).toBe(0);
	});

	it("does not re-process sources if a handler already claimed one", () => {
		const el = document.createElement("video");
		const source = document.createElement("source");
		source.setAttribute("src", "https://example.com/stream.m3u8");
		el.appendChild(source);

		const load1 = vi.fn();
		const load2 = vi.fn();
		const player = createPlayer(el);
		player.registerSourceHandler({
			canHandle: () => true,
			load: load1,
			unload: vi.fn(),
		});
		expect(load1).toHaveBeenCalledTimes(1);
		// Second handler registration should not re-trigger
		player.registerSourceHandler({
			canHandle: () => true,
			load: load2,
			unload: vi.fn(),
		});
		expect(load2).not.toHaveBeenCalled();
	});
});

describe("Quality Level API", () => {
	it("qualities returns empty array by default", () => {
		const player = createPlayer(makeVideo());
		expect(player.qualities).toEqual([]);
	});

	it("currentQuality returns null by default", () => {
		const player = createPlayer(makeVideo());
		expect(player.currentQuality).toBeNull();
	});

	it("isAutoQuality returns true by default", () => {
		const player = createPlayer(makeVideo());
		expect(player.isAutoQuality).toBe(true);
	});

	it("qualities reflects pluginData", () => {
		const player = createPlayer(makeVideo());
		const levels = [
			{ id: 0, width: 1280, height: 720, bitrate: 2_000_000, label: "720p" },
		];
		player.setPluginData("qualities", levels);
		expect(player.qualities).toEqual(levels);
	});

	it("currentQuality reflects pluginData", () => {
		const player = createPlayer(makeVideo());
		const quality = {
			id: 0,
			width: 1280,
			height: 720,
			bitrate: 2_000_000,
			label: "720p",
		};
		player.setPluginData("currentQuality", quality);
		expect(player.currentQuality).toEqual(quality);
	});

	it("emits qualitiesavailable when qualities pluginData is set", () => {
		const player = createPlayer(makeVideo());
		const handler = vi.fn();
		player.on("qualitiesavailable", handler);
		const levels = [
			{ id: 0, width: 1280, height: 720, bitrate: 2_000_000, label: "720p" },
		];
		player.setPluginData("qualities", levels);
		expect(handler).toHaveBeenCalledWith({ qualities: levels });
	});

	it("emits qualitychange when currentQuality pluginData is set", () => {
		const player = createPlayer(makeVideo());
		const handler = vi.fn();
		player.on("qualitychange", handler);
		const quality = {
			id: 0,
			width: 1280,
			height: 720,
			bitrate: 2_000_000,
			label: "720p",
		};
		player.setPluginData("currentQuality", quality);
		expect(handler).toHaveBeenCalledWith({ from: null, to: quality });
	});

	it("qualitychange tracks previous quality", () => {
		const player = createPlayer(makeVideo());
		const handler = vi.fn();
		player.on("qualitychange", handler);
		const q1 = {
			id: 0,
			width: 1280,
			height: 720,
			bitrate: 2_000_000,
			label: "720p",
		};
		const q2 = {
			id: 1,
			width: 1920,
			height: 1080,
			bitrate: 5_000_000,
			label: "1080p",
		};
		player.setPluginData("currentQuality", q1);
		player.setPluginData("currentQuality", q2);
		expect(handler).toHaveBeenCalledTimes(2);
		expect(handler).toHaveBeenLastCalledWith({ from: q1, to: q2 });
	});

	it("setQuality calls registered qualitySetter callback", () => {
		const player = createPlayer(makeVideo());
		const setter = vi.fn();
		player.setPluginData("qualitySetter", setter);
		player.setQuality(2);
		expect(setter).toHaveBeenCalledWith(2);
	});

	it("setQuality(-1) passes -1 to qualitySetter", () => {
		const player = createPlayer(makeVideo());
		const setter = vi.fn();
		player.setPluginData("qualitySetter", setter);
		player.setQuality(-1);
		expect(setter).toHaveBeenCalledWith(-1);
	});

	it("setQuality is no-op when no qualitySetter is registered", () => {
		const player = createPlayer(makeVideo());
		expect(() => player.setQuality(0)).not.toThrow();
	});

	it("quality state clears on destroy", () => {
		const player = createPlayer(makeVideo());
		player.setPluginData("qualities", [
			{ id: 0, width: 1280, height: 720, bitrate: 2_000_000, label: "720p" },
		]);
		player.setPluginData("currentQuality", {
			id: 0,
			width: 1280,
			height: 720,
			bitrate: 2_000_000,
			label: "720p",
		});
		player.destroy();
		expect(player.qualities).toEqual([]);
		expect(player.currentQuality).toBeNull();
		expect(player.isAutoQuality).toBe(true);
	});

	it("quality state clears on source change", () => {
		const player = createPlayer(makeVideo());
		player.setPluginData("qualities", [
			{ id: 0, width: 1280, height: 720, bitrate: 2_000_000, label: "720p" },
		]);
		player.setPluginData("currentQuality", {
			id: 0,
			width: 1280,
			height: 720,
			bitrate: 2_000_000,
			label: "720p",
		});
		player.setPluginData("autoQuality", false);
		player.src = "https://example.com/new.mp4";
		expect(player.qualities).toEqual([]);
		expect(player.currentQuality).toBeNull();
		expect(player.isAutoQuality).toBe(true);
	});
});
