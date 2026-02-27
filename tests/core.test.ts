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
		// idle → playing is not valid
		el.dispatchEvent(new Event("play"));
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
