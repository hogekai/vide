import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createPlayer } from "../../src/core.js";
import { useVideContext } from "../../src/react/context.js";
import type { UseVidePlayerHandle } from "../../src/react/use-vide-player.js";
import { VideVideo } from "../../src/react/video.js";
import type { Player } from "../../src/types.js";

function makeDummyHandle(player: Player | null = null): UseVidePlayerHandle {
	return {
		player,
		_registerEl: () => {},
	};
}

describe("VideVideo", () => {
	it("renders a video element", () => {
		render(<VideVideo player={makeDummyHandle()} data-testid="vid" />);
		expect(screen.getByTestId("vid").tagName).toBe("VIDEO");
	});

	it("passes HTML attributes to the video element", () => {
		render(
			<VideVideo
				player={makeDummyHandle()}
				data-testid="vid"
				className="my-class"
				autoPlay
				muted
			/>,
		);
		const video = screen.getByTestId("vid");
		expect(video.className).toBe("my-class");
		expect(video).toHaveProperty("autoplay", true);
		expect(video).toHaveProperty("muted", true);
	});

	it("provides player via context to children", () => {
		const video = document.createElement("video");
		const player = createPlayer(video);

		function ContextReader() {
			const ctx = useVideContext();
			return <div data-testid="ctx">{ctx ? "has-player" : "no-player"}</div>;
		}

		render(
			<VideVideo player={makeDummyHandle(player)}>
				<ContextReader />
			</VideVideo>,
		);

		expect(screen.getByTestId("ctx").textContent).toBe("has-player");
		player.destroy();
	});

	it("does not render children when player is null", () => {
		render(
			<VideVideo player={makeDummyHandle()}>
				<div data-testid="child">hello</div>
			</VideVideo>,
		);
		expect(screen.queryByTestId("child")).toBeNull();
	});

	it("renders children when player is available", () => {
		const video = document.createElement("video");
		const player = createPlayer(video);

		render(
			<VideVideo player={makeDummyHandle(player)}>
				<div data-testid="child">hello</div>
			</VideVideo>,
		);
		expect(screen.getByTestId("child").textContent).toBe("hello");
		player.destroy();
	});

	it("calls _registerEl with video element on mount", () => {
		let registered: HTMLVideoElement | null = null;
		const handle: UseVidePlayerHandle = {
			player: null,
			_registerEl: (el) => {
				registered = el;
			},
		};

		render(<VideVideo player={handle} data-testid="vid" />);
		expect(registered).not.toBeNull();
		expect(registered!.tagName).toBe("VIDEO");
	});
});
