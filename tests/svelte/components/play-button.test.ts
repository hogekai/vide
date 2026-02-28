import { render, screen } from "@testing-library/svelte";
import { tick } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../../src/core.js";
import PlayButtonHost from "./PlayButtonHost.svelte";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

describe("PlayButton", () => {
	it("renders a button with Play label", () => {
		const { player } = setup();

		render(PlayButtonHost, {
			props: {
				getPlayer: () => player,
			},
		});

		expect(screen.getByRole("button", { name: "Play" })).toBeDefined();

		player.destroy();
	});

	it("switches to Pause label when playing", async () => {
		const { player, video } = setup();

		render(PlayButtonHost, {
			props: {
				getPlayer: () => player,
			},
		});

		// Simulate play state
		video.dispatchEvent(new Event("loadstart"));
		video.dispatchEvent(new Event("canplay"));
		video.dispatchEvent(new Event("play"));
		await tick();

		expect(screen.getByRole("button", { name: "Pause" })).toBeDefined();

		player.destroy();
	});

	it("calls player.pause() when clicked while playing", async () => {
		const { player, video } = setup();
		const pauseSpy = vi.spyOn(player, "pause");

		render(PlayButtonHost, {
			props: {
				getPlayer: () => player,
			},
		});

		// Simulate play state
		video.dispatchEvent(new Event("loadstart"));
		video.dispatchEvent(new Event("canplay"));
		video.dispatchEvent(new Event("play"));
		await tick();

		const button = screen.getByRole("button", { name: "Pause" });
		button.click();

		expect(pauseSpy).toHaveBeenCalledOnce();

		player.destroy();
	});

	it("applies class prop", () => {
		const { player } = setup();

		render(PlayButtonHost, {
			props: {
				getPlayer: () => player,
				class: "my-class",
			},
		});

		const button = screen.getByRole("button");
		expect(button.className).toContain("my-class");

		player.destroy();
	});
});
