import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createPlayer } from "../../../src/core.js";
import { FullscreenButton } from "../../../src/react/components/fullscreen.js";
import { VideContext } from "../../../src/react/context.js";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

describe("FullscreenButton", () => {
	it("renders with Fullscreen label", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<FullscreenButton />
			</VideContext.Provider>,
		);
		expect(screen.getByRole("button", { name: "Fullscreen" })).toBeDefined();
		player.destroy();
	});

	it("applies className prop", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<FullscreenButton className="fs-btn" />
			</VideContext.Provider>,
		);
		expect(screen.getByRole("button").className).toBe("vide-fullscreen fs-btn");
		player.destroy();
	});

	it("renders children", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<FullscreenButton>
					<span data-testid="icon">⛶</span>
				</FullscreenButton>
			</VideContext.Provider>,
		);
		expect(screen.getByTestId("icon")).toBeDefined();
		player.destroy();
	});

	it("has data-fullscreen attribute set to undefined when not fullscreen", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<FullscreenButton />
			</VideContext.Provider>,
		);
		expect(screen.getByRole("button").hasAttribute("data-fullscreen")).toBe(
			false,
		);
		player.destroy();
	});
});
