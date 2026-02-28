import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import type { VidePlayerHandle } from "../../src/react/use-vide-player.js";
import { useVideEvent } from "../../src/react/use-vide-event.js";

function makeHandle(player = createPlayer(document.createElement("video"))): VidePlayerHandle {
	return { current: player, _registerEl: () => {} };
}

function nullHandle(): VidePlayerHandle {
	return { current: null, _registerEl: () => {} };
}

describe("useVideEvent", () => {
	it("subscribes to player event", () => {
		const player = createPlayer(document.createElement("video"));
		const handler = vi.fn();

		renderHook(() => useVideEvent(makeHandle(player), "play", handler));

		player.emit("play", undefined);
		expect(handler).toHaveBeenCalledOnce();

		player.destroy();
	});

	it("does nothing when player is null", () => {
		const handler = vi.fn();

		renderHook(() => useVideEvent(nullHandle(), "play", handler));

		// No error thrown, handler never called
		expect(handler).not.toHaveBeenCalled();
	});

	it("unsubscribes on unmount", () => {
		const player = createPlayer(document.createElement("video"));
		const handler = vi.fn();

		const { unmount } = renderHook(() =>
			useVideEvent(makeHandle(player), "play", handler),
		);

		unmount();

		player.emit("play", undefined);
		expect(handler).not.toHaveBeenCalled();

		player.destroy();
	});

	it("always calls the latest handler without re-subscribing", () => {
		const player = createPlayer(document.createElement("video"));
		const handle = makeHandle(player);
		const handler1 = vi.fn();
		const handler2 = vi.fn();

		const { rerender } = renderHook(
			({ handler }) => useVideEvent(handle, "play", handler),
			{ initialProps: { handler: handler1 } },
		);

		rerender({ handler: handler2 });

		player.emit("play", undefined);
		expect(handler1).not.toHaveBeenCalled();
		expect(handler2).toHaveBeenCalledOnce();

		player.destroy();
	});

	it("re-subscribes when event name changes", () => {
		const player = createPlayer(document.createElement("video"));
		const handle = makeHandle(player);
		const handler = vi.fn();

		const { rerender } = renderHook(
			({ event }) => useVideEvent(handle, event, handler),
			{ initialProps: { event: "play" as const } },
		);

		rerender({ event: "pause" as const });

		// Old event should not trigger
		player.emit("play", undefined);
		expect(handler).not.toHaveBeenCalled();

		// New event should trigger
		player.emit("pause", undefined);
		expect(handler).toHaveBeenCalledOnce();

		player.destroy();
	});
});
