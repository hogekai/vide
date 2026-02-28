import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createPlayer } from "../../src/core.js";
import { useVideContext } from "../../src/react/context.js";
import { VideRoot } from "../../src/react/root.js";
import type { VidePlayerHandle } from "../../src/react/use-vide-player.js";

function makeHandle(player: import("../../src/types.js").Player | null = null): VidePlayerHandle {
	return {
		current: player,
		_registerEl: () => {},
	};
}

describe("VideRoot", () => {
	it("renders children when player is null", () => {
		render(
			<VideRoot player={makeHandle()}>
				<div data-testid="child">hello</div>
			</VideRoot>,
		);
		expect(screen.getByTestId("child").textContent).toBe("hello");
	});

	it("provides player via context", () => {
		const video = document.createElement("video");
		const player = createPlayer(video);

		function ContextReader() {
			const ctx = useVideContext();
			return <div data-testid="ctx">{ctx ? "has-player" : "no-player"}</div>;
		}

		render(
			<VideRoot player={makeHandle(player)}>
				<ContextReader />
			</VideRoot>,
		);

		expect(screen.getByTestId("ctx").textContent).toBe("has-player");
		player.destroy();
	});

	it("renders children even when player is null (so Video can mount)", () => {
		render(
			<VideRoot player={makeHandle()}>
				<div data-testid="child">mounted</div>
			</VideRoot>,
		);
		expect(screen.getByTestId("child")).toBeDefined();
	});
});
