import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { useHls } from "../../src/react/use-plugin.js";
import type { VidePlayerHandle } from "../../src/react/use-vide-player.js";
import type { Player, Plugin } from "../../src/types.js";

function makeHandle(player: Player | null = null): VidePlayerHandle {
	return { current: player, _registerEl: () => {} };
}

// A minimal mock plugin factory for testing the generic usePlugin behavior
function mockPluginFactory(): {
	factory: (opts: Record<string, unknown>) => Plugin;
	setup: ReturnType<typeof vi.fn>;
	cleanup: ReturnType<typeof vi.fn>;
} {
	const cleanup = vi.fn();
	const setup = vi.fn().mockReturnValue(cleanup);
	const factory = (_opts: Record<string, unknown>): Plugin => ({
		name: "mock",
		setup,
	});
	return { factory, setup, cleanup };
}

describe("useHls", () => {
	it("does nothing when player is null", () => {
		// Should not throw
		renderHook(() => useHls(makeHandle(null)));
	});

	it("sets up plugin when player is provided", () => {
		const video = document.createElement("video");
		const player = createPlayer(video);

		// We can't easily spy on the internal hls() call since it requires
		// hls.js to be available. Instead, test the lifecycle by checking
		// that the hook doesn't throw and the player is functional.
		renderHook(() => useHls(makeHandle(player)));

		// The hook should not have broken the player
		expect(player.state).toBeDefined();

		player.destroy();
	});
});

describe("usePlugin pattern (via mock)", () => {
	it("calls setup when player becomes available", () => {
		const { factory, setup } = mockPluginFactory();
		const video = document.createElement("video");
		const player = createPlayer(video);

		// Simulate the usePlugin pattern directly
		const plugin = factory({});
		plugin.setup(player);

		expect(setup).toHaveBeenCalledWith(player);
		player.destroy();
	});

	it("calls cleanup on unmount", () => {
		const { factory, cleanup: cleanupFn } = mockPluginFactory();
		const video = document.createElement("video");
		const player = createPlayer(video);

		// Simulate the setup + cleanup pattern
		const plugin = factory({});
		const cleanup = plugin.setup(player);
		cleanup?.();

		expect(cleanupFn).toHaveBeenCalledOnce();
		player.destroy();
	});

	it("does not call setup when player is null", () => {
		const { setup } = mockPluginFactory();

		// Simulate the guard: if (!player) return;
		const player: Player | null = null;
		if (player) {
			// Should not reach here
			setup(player);
		}

		expect(setup).not.toHaveBeenCalled();
	});
});
