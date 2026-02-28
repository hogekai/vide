import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { createPlayer } from "../../../src/core.js";
import TimeDisplayHost from "./TimeDisplayHost.svelte";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

describe("TimeDisplay", () => {
	it("renders time with default separator", () => {
		const { player } = setup();

		const { container } = render(TimeDisplayHost, {
			props: {
				getPlayer: () => player,
			},
		});

		const div = container.querySelector("[aria-label='Time']");
		expect(div).not.toBeNull();
		// Default separator is "/"
		expect(div!.textContent).toContain("/");

		player.destroy();
	});

	it("applies class prop", () => {
		const { player } = setup();

		const { container } = render(TimeDisplayHost, {
			props: {
				getPlayer: () => player,
				class: "my-time",
			},
		});

		const div = container.querySelector("[aria-label='Time']");
		expect(div!.className).toContain("my-time");

		player.destroy();
	});

	it("uses custom separator", () => {
		const { player } = setup();

		const { container } = render(TimeDisplayHost, {
			props: {
				getPlayer: () => player,
				separator: " - ",
			},
		});

		const div = container.querySelector("[aria-label='Time']");
		expect(div!.textContent).toContain(" - ");

		player.destroy();
	});
});
