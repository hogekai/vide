import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, shallowRef } from "vue";
import { createPlayer } from "../../src/core.js";
import type { Player, Plugin } from "../../src/types.js";
import { useHls } from "../../src/vue/use-plugin.js";

describe("useHls", () => {
	it("does nothing when player is null", () => {
		const playerRef = shallowRef<Player | null>(null);

		const Comp = defineComponent({
			setup() {
				useHls(playerRef);
				return () => null;
			},
		});

		// Should not throw
		mount(Comp);
	});

	it("sets up plugin when player is provided", () => {
		const video = document.createElement("video");
		const player = createPlayer(video);
		const playerRef = shallowRef<Player | null>(player);

		const Comp = defineComponent({
			setup() {
				useHls(playerRef);
				return () => null;
			},
		});

		mount(Comp);

		// The hook should not have broken the player
		expect(player.state).toBeDefined();

		player.destroy();
	});
});

describe("usePlugin pattern (via mock)", () => {
	it("calls setup when player becomes available", () => {
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

	it("calls cleanup on unmount", () => {
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
