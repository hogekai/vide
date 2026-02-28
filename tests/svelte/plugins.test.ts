import { render } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import type { Player } from "../../src/types.js";
import PluginTestHost from "./PluginTestHost.svelte";

describe("Plugin components", () => {
	it("HlsPlugin renders nothing", () => {
		const video = document.createElement("video");
		const player = createPlayer(video);

		const { container } = render(PluginTestHost, {
			props: {
				getPlayer: () => player,
			},
		});

		// Plugin components render nothing visible
		expect(container.querySelector("video")).toBeNull();

		player.destroy();
	});

	it("HlsPlugin calls plugin setup on mount", () => {
		const video = document.createElement("video");
		const player = createPlayer(video);

		const spy = vi.spyOn(player, "registerSourceHandler");

		render(PluginTestHost, {
			props: {
				getPlayer: () => player,
			},
		});

		expect(spy).toHaveBeenCalled();

		player.destroy();
	});

	it("HlsPlugin cleans up on unmount", () => {
		const video = document.createElement("video");
		const player = createPlayer(video);

		const { unmount } = render(PluginTestHost, {
			props: {
				getPlayer: () => player,
			},
		});

		// Should not throw on unmount
		unmount();

		player.destroy();
	});
});
