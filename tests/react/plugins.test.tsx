import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { VideContext } from "../../src/react/context.js";
import { HlsPlugin } from "../../src/react/plugins.js";

describe("Plugin components", () => {
	it("HlsPlugin renders null", () => {
		const video = document.createElement("video");
		const player = createPlayer(video);

		const { container } = render(
			<VideContext.Provider value={player}>
				<HlsPlugin />
			</VideContext.Provider>,
		);

		// Plugin components render nothing
		expect(container.innerHTML).toBe("");

		player.destroy();
	});

	it("HlsPlugin calls plugin setup on mount", () => {
		const video = document.createElement("video");
		const player = createPlayer(video);

		// Spy on the player to verify registerSourceHandler is called
		// (hls plugin calls this during setup)
		const spy = vi.spyOn(player, "registerSourceHandler");

		render(
			<VideContext.Provider value={player}>
				<HlsPlugin />
			</VideContext.Provider>,
		);

		// hls plugin should have registered a source handler
		expect(spy).toHaveBeenCalled();

		player.destroy();
	});

	it("HlsPlugin cleans up on unmount", () => {
		const video = document.createElement("video");
		const player = createPlayer(video);

		const { unmount } = render(
			<VideContext.Provider value={player}>
				<HlsPlugin />
			</VideContext.Provider>,
		);

		// Should not throw on unmount
		unmount();

		player.destroy();
	});

	it("throws when used outside context", () => {
		// Suppress React error boundary noise
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		expect(() => {
			render(<HlsPlugin />);
		}).toThrow("useVideContext must be used within <Vide.Video>");

		consoleSpy.mockRestore();
	});
});
