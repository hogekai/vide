import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createPlayer } from "../../src/core.js";
import { VideContext } from "../../src/react/context.js";
import { VideControls, VideUI } from "../../src/react/ui.js";

describe("VideUI", () => {
	it("always renders children (even when player is null)", () => {
		render(
			<VideContext.Provider value={{ player: null, registerEl: () => {} }}>
				<VideUI>
					<div data-testid="child">hello</div>
				</VideUI>
			</VideContext.Provider>,
		);
		expect(screen.getByTestId("child").textContent).toBe("hello");
	});

	it("has vide-ui class", () => {
		render(
			<VideContext.Provider value={{ player: null, registerEl: () => {} }}>
				<VideUI data-testid="ui">
					<div>child</div>
				</VideUI>
			</VideContext.Provider>,
		);
		expect(screen.getByTestId("ui").className).toContain("vide-ui");
	});

	it("appends className after vide-ui", () => {
		const video = document.createElement("video");
		const player = createPlayer(video);

		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<VideUI className="custom" data-testid="ui">
					<div>child</div>
				</VideUI>
			</VideContext.Provider>,
		);

		const ui = screen.getByTestId("ui");
		expect(ui.className).toContain("vide-ui");
		expect(ui.className).toContain("custom");
		player.destroy();
	});

	it("has role=region", () => {
		render(
			<VideContext.Provider value={{ player: null, registerEl: () => {} }}>
				<VideUI>
					<div>child</div>
				</VideUI>
			</VideContext.Provider>,
		);
		expect(screen.getByRole("region")).toBeDefined();
	});
});

describe("VideControls", () => {
	it("renders nothing when player is null", () => {
		const { container } = render(
			<VideContext.Provider value={{ player: null, registerEl: () => {} }}>
				<VideControls>
					<div data-testid="child">hello</div>
				</VideControls>
			</VideContext.Provider>,
		);
		expect(screen.queryByTestId("child")).toBeNull();
	});

	it("renders children when player is available", () => {
		const video = document.createElement("video");
		const player = createPlayer(video);

		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<VideControls>
					<div data-testid="child">hello</div>
				</VideControls>
			</VideContext.Provider>,
		);

		expect(screen.getByTestId("child").textContent).toBe("hello");
		player.destroy();
	});

	it("has vide-controls class", () => {
		const video = document.createElement("video");
		const player = createPlayer(video);

		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<VideControls>
					<div>child</div>
				</VideControls>
			</VideContext.Provider>,
		);

		expect(container.firstElementChild!.className).toContain("vide-controls");
		player.destroy();
	});
});
