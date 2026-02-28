import { render, screen } from "@testing-library/svelte";
import { tick } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../../src/core.js";
import MuteButtonHost from "./MuteButtonHost.svelte";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

describe("MuteButton", () => {
	it("renders a button with Mute label", () => {
		const { player } = setup();

		render(MuteButtonHost, {
			props: {
				getPlayer: () => player,
			},
		});

		expect(screen.getByRole("button", { name: "Mute" })).toBeDefined();

		player.destroy();
	});

	it("toggles muted on click", async () => {
		const { player } = setup();

		render(MuteButtonHost, {
			props: {
				getPlayer: () => player,
			},
		});

		const button = screen.getByRole("button", { name: "Mute" });
		button.click();

		expect(player.muted).toBe(true);

		player.destroy();
	});

	it("applies class prop", () => {
		const { player } = setup();

		render(MuteButtonHost, {
			props: {
				getPlayer: () => player,
				class: "my-mute",
			},
		});

		const button = screen.getByRole("button");
		expect(button.className).toContain("my-mute");

		player.destroy();
	});
});
