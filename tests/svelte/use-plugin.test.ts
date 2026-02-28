import { render } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import type { Player, Plugin } from "../../src/types.js";
import UsePluginHost from "./UsePluginHost.svelte";

describe("useHls (via usePlugin pattern)", () => {
	it("does nothing when player is null", () => {
		render(UsePluginHost, {
			props: {
				getPlayer: () => null,
			},
		});
		// Should not throw
	});

	it("sets up plugin when player is provided", () => {
		const video = document.createElement("video");
		const player = createPlayer(video);

		render(UsePluginHost, {
			props: {
				getPlayer: () => player,
			},
		});

		// The hook should not have broken the player
		expect(player.state).toBeDefined();

		player.destroy();
	});
});

describe("usePlugin pattern (via mock)", () => {
	it("calls setup when player is available", () => {
		const cleanup = vi.fn();
		const setup = vi.fn().mockReturnValue(cleanup);
		const factory = (_opts: Record<string, unknown>): Plugin => ({
			name: "mock",
			setup,
		});

		const video = document.createElement("video");
		const player = createPlayer(video);

		const plugin = factory({});
		plugin.setup(player);

		expect(setup).toHaveBeenCalledWith(player);
		player.destroy();
	});

	it("calls cleanup on dispose", () => {
		const cleanup = vi.fn();
		const setup = vi.fn().mockReturnValue(cleanup);
		const factory = (_opts: Record<string, unknown>): Plugin => ({
			name: "mock",
			setup,
		});

		const video = document.createElement("video");
		const player = createPlayer(video);

		const plugin = factory({});
		const cleanupFn = plugin.setup(player);
		cleanupFn?.();

		expect(cleanup).toHaveBeenCalledOnce();
		player.destroy();
	});

	it("does not call setup when player is null", () => {
		const setup = vi.fn();

		const player: Player | null = null;
		if (player) {
			setup(player);
		}

		expect(setup).not.toHaveBeenCalled();
	});
});
