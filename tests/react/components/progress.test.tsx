import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createPlayer } from "../../../src/core.js";
import { Progress } from "../../../src/react/components/progress.js";
import { VideContext } from "../../../src/react/context.js";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

describe("Progress", () => {
	it("renders with slider role", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<Progress />
			</VideContext.Provider>,
		);
		expect(screen.getByRole("slider", { name: "Seek" })).toBeDefined();
		player.destroy();
	});

	it("applies className prop", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<Progress className="my-progress" />
			</VideContext.Provider>,
		);
		expect(screen.getByRole("slider").className).toBe("vide-progress my-progress");
		player.destroy();
	});

	it("has correct ARIA attributes", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<Progress />
			</VideContext.Provider>,
		);
		const slider = screen.getByRole("slider");
		expect(slider.getAttribute("aria-valuemin")).toBe("0");
		expect(slider.getAttribute("aria-valuemax")).toBe("100");
		expect(slider.getAttribute("aria-valuenow")).toBe("0");
		player.destroy();
	});

	it("sets CSS custom properties", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<Progress />
			</VideContext.Provider>,
		);
		const slider = screen.getByRole("slider");
		expect(slider.style.getPropertyValue("--vide-progress")).toBe("0");
		expect(slider.style.getPropertyValue("--vide-progress-buffered")).toBe("0");
		player.destroy();
	});
});
