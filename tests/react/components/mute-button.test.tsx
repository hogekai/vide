import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createPlayer } from "../../../src/core.js";
import { MuteButton } from "../../../src/react/components/mute-button.js";
import { VideContext } from "../../../src/react/context.js";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

describe("MuteButton", () => {
	it("renders with Mute label initially", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={player}>
				<MuteButton />
			</VideContext.Provider>,
		);
		expect(screen.getByRole("button", { name: "Mute" })).toBeDefined();
		player.destroy();
	});

	it("applies className prop", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={player}>
				<MuteButton className="mute-btn" />
			</VideContext.Provider>,
		);
		expect(screen.getByRole("button").className).toBe("mute-btn");
		player.destroy();
	});

	it("toggles mute on click", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={player}>
				<MuteButton />
			</VideContext.Provider>,
		);

		expect(player.muted).toBe(false);

		fireEvent.click(screen.getByRole("button"));
		expect(player.muted).toBe(true);

		fireEvent.click(screen.getByRole("button"));
		expect(player.muted).toBe(false);

		player.destroy();
	});

	it("renders children", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={player}>
				<MuteButton>
					<span data-testid="icon">🔊</span>
				</MuteButton>
			</VideContext.Provider>,
		);
		expect(screen.getByTestId("icon")).toBeDefined();
		player.destroy();
	});
});
