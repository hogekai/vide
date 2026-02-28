import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createPlayer } from "../../../src/core.js";
import { TimeDisplay } from "../../../src/react/components/time-display.js";
import { VideContext } from "../../../src/react/context.js";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

describe("TimeDisplay", () => {
	it("renders initial time as 0:00/0:00", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<TimeDisplay />
			</VideContext.Provider>,
		);
		const el = screen.getByLabelText("Time");
		expect(el.textContent).toBe("0:00/0:00");
		player.destroy();
	});

	it("applies className prop", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<TimeDisplay className="my-time" />
			</VideContext.Provider>,
		);
		expect(screen.getByLabelText("Time").className).toBe("vide-time my-time");
		player.destroy();
	});

	it("uses custom separator", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<TimeDisplay separator=" - " />
			</VideContext.Provider>,
		);
		expect(screen.getByLabelText("Time").textContent).toBe("0:00 - 0:00");
		player.destroy();
	});

	it("updates on timeupdate event", () => {
		const { player, video } = setup();
		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<TimeDisplay />
			</VideContext.Provider>,
		);

		// Simulate time update
		Object.defineProperty(video, "duration", {
			value: 120,
			writable: true,
		});
		Object.defineProperty(video, "currentTime", {
			value: 65,
			writable: true,
		});
		act(() => {
			video.dispatchEvent(new Event("timeupdate"));
		});

		const el = screen.getByLabelText("Time");
		expect(el.textContent).toBe("1:05/2:00");
		player.destroy();
	});
});
