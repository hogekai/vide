import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { createPlayer } from "../../../src/core.js";
import ProgressHost from "./ProgressHost.svelte";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

describe("Progress", () => {
	it("renders a slider element", () => {
		const { player } = setup();

		const { container } = render(ProgressHost, {
			props: {
				getPlayer: () => player,
			},
		});

		const slider = container.querySelector("[role='slider']");
		expect(slider).not.toBeNull();
		expect(slider!.getAttribute("aria-label")).toBe("Seek");

		player.destroy();
	});

	it("applies class prop", () => {
		const { player } = setup();

		const { container } = render(ProgressHost, {
			props: {
				getPlayer: () => player,
				class: "my-progress",
			},
		});

		const slider = container.querySelector("[role='slider']");
		expect(slider!.className).toContain("my-progress");

		player.destroy();
	});
});
