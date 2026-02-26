import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../src/core.js";
import type { Plugin } from "../src/types.js";

function makeVideo(): HTMLVideoElement {
	return document.createElement("video");
}

describe("player.use()", () => {
	it("calls plugin setup with the player", () => {
		const player = createPlayer(makeVideo());
		const setup = vi.fn();
		const plugin: Plugin = { name: "test", setup };
		player.use(plugin);
		expect(setup).toHaveBeenCalledWith(player);
	});

	it("calls cleanup on destroy", () => {
		const player = createPlayer(makeVideo());
		const cleanup = vi.fn();
		const plugin: Plugin = {
			name: "test",
			setup: () => cleanup,
		};
		player.use(plugin);
		expect(cleanup).not.toHaveBeenCalled();
		player.destroy();
		expect(cleanup).toHaveBeenCalledTimes(1);
	});

	it("handles plugins without cleanup", () => {
		const player = createPlayer(makeVideo());
		const plugin: Plugin = {
			name: "test",
			setup: () => {},
		};
		// Should not throw
		player.use(plugin);
		player.destroy();
	});

	it("supports multiple plugins", () => {
		const player = createPlayer(makeVideo());
		const cleanup1 = vi.fn();
		const cleanup2 = vi.fn();
		player.use({ name: "p1", setup: () => cleanup1 });
		player.use({ name: "p2", setup: () => cleanup2 });
		player.destroy();
		expect(cleanup1).toHaveBeenCalledTimes(1);
		expect(cleanup2).toHaveBeenCalledTimes(1);
	});

	it("warns when using plugin after destroy", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const player = createPlayer(makeVideo());
		player.destroy();
		const setup = vi.fn();
		player.use({ name: "test", setup });
		expect(setup).not.toHaveBeenCalled();
		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining("Cannot use plugin after destroy"),
		);
		warn.mockRestore();
	});
});

describe("plugin can subscribe to events", () => {
	it("plugin receives player events", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const handler = vi.fn();

		player.use({
			name: "test",
			setup(p) {
				p.on("statechange", handler);
			},
		});

		el.dispatchEvent(new Event("loadstart"));
		expect(handler).toHaveBeenCalledWith({ from: "idle", to: "loading" });
	});
});
