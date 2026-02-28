import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { createPlayer } from "../../../src/core.js";
import VolumeHost from "./VolumeHost.svelte";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

describe("Volume", () => {
	it("renders a mute button and volume slider", () => {
		const { player } = setup();

		const { container } = render(VolumeHost, {
			props: {
				getPlayer: () => player,
			},
		});

		expect(screen.getByRole("button", { name: "Mute" })).toBeDefined();
		expect(container.querySelector("[role='slider']")).not.toBeNull();

		player.destroy();
	});

	it("applies class prop to wrapper", () => {
		const { player } = setup();

		const { container } = render(VolumeHost, {
			props: {
				getPlayer: () => player,
				class: "my-volume",
			},
		});

		const wrapper = container.firstElementChild;
		expect(wrapper!.className).toContain("my-volume");

		player.destroy();
	});
});
