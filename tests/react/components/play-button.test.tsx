import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../../src/core.js";
import { PlayButton } from "../../../src/react/components/play-button.js";
import { VideContext } from "../../../src/react/context.js";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

function driveToPlaying(el: HTMLVideoElement) {
	act(() => {
		el.dispatchEvent(new Event("loadstart"));
		el.dispatchEvent(new Event("canplay"));
		el.dispatchEvent(new Event("play"));
	});
}

describe("PlayButton", () => {
	it("renders with Play label initially", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={player}>
				<PlayButton />
			</VideContext.Provider>,
		);
		expect(screen.getByRole("button", { name: "Play" })).toBeDefined();
		player.destroy();
	});

	it("applies className prop", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={player}>
				<PlayButton className="my-btn" />
			</VideContext.Provider>,
		);
		expect(screen.getByRole("button").className).toBe("my-btn");
		player.destroy();
	});

	it("renders children", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={player}>
				<PlayButton>
					<span data-testid="icon">▶</span>
				</PlayButton>
			</VideContext.Provider>,
		);
		expect(screen.getByTestId("icon").textContent).toBe("▶");
		player.destroy();
	});

	it("switches to Pause label when playing", () => {
		const { player, video } = setup();
		render(
			<VideContext.Provider value={player}>
				<PlayButton />
			</VideContext.Provider>,
		);

		driveToPlaying(video);

		expect(screen.getByRole("button", { name: "Pause" })).toBeDefined();
		player.destroy();
	});

	it("calls player.pause() when clicked while playing", () => {
		const { player, video } = setup();
		const pauseSpy = vi.spyOn(player, "pause");

		render(
			<VideContext.Provider value={player}>
				<PlayButton />
			</VideContext.Provider>,
		);

		driveToPlaying(video);
		fireEvent.click(screen.getByRole("button"));

		expect(pauseSpy).toHaveBeenCalledOnce();
		player.destroy();
	});

	it("calls player.play() when clicked while paused", () => {
		const { player } = setup();
		const playSpy = vi.spyOn(player, "play");

		render(
			<VideContext.Provider value={player}>
				<PlayButton />
			</VideContext.Provider>,
		);

		fireEvent.click(screen.getByRole("button"));

		expect(playSpy).toHaveBeenCalledOnce();
		player.destroy();
	});

	it("sets data-playing attribute when playing", () => {
		const { player, video } = setup();
		render(
			<VideContext.Provider value={player}>
				<PlayButton />
			</VideContext.Provider>,
		);

		expect(screen.getByRole("button").hasAttribute("data-playing")).toBe(false);

		driveToPlaying(video);

		expect(screen.getByRole("button").getAttribute("data-playing")).toBe(
			"true",
		);
		player.destroy();
	});
});
