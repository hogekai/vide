import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { createPlayer } from "../../../src/core.js";
import FullscreenHost from "./FullscreenHost.svelte";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

describe("FullscreenButton", () => {
	it("renders a button with Fullscreen label", () => {
		const { player } = setup();

		render(FullscreenHost, {
			props: {
				getPlayer: () => player,
			},
		});

		expect(screen.getByRole("button", { name: "Fullscreen" })).toBeDefined();

		player.destroy();
	});

	it("applies class prop", () => {
		const { player } = setup();

		render(FullscreenHost, {
			props: {
				getPlayer: () => player,
				class: "my-fs",
			},
		});

		const button = screen.getByRole("button");
		expect(button.className).toContain("my-fs");

		player.destroy();
	});
});
