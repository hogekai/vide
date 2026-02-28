import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createPlayer } from "../../../src/core.js";
import { Volume } from "../../../src/react/components/volume.js";
import { VideContext } from "../../../src/react/context.js";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

describe("Volume", () => {
	it("renders mute button and slider", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={player}>
				<Volume />
			</VideContext.Provider>,
		);
		expect(screen.getByRole("button", { name: "Mute" })).toBeDefined();
		expect(screen.getByRole("slider", { name: "Volume" })).toBeDefined();
		player.destroy();
	});

	it("applies className prop", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={player}>
				<Volume className="my-volume" />
			</VideContext.Provider>,
		);
		expect(container.firstElementChild!.className).toBe("my-volume");
		player.destroy();
	});

	it("sets CSS custom property for volume", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={player}>
				<Volume />
			</VideContext.Provider>,
		);
		const root = container.firstElementChild as HTMLElement;
		expect(root.style.getPropertyValue("--vide-volume")).toBeDefined();
		player.destroy();
	});

	it("renders children in mute button", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={player}>
				<Volume>
					<span data-testid="icon">🔊</span>
				</Volume>
			</VideContext.Provider>,
		);
		expect(screen.getByTestId("icon")).toBeDefined();
		player.destroy();
	});
});
