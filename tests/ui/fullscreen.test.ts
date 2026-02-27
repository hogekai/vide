import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { createFullscreen } from "../../src/ui/components/fullscreen.js";

describe("createFullscreen", () => {
	it("mounts fullscreen button", () => {
		const container = document.createElement("div");
		const comp = createFullscreen();
		comp.mount(container);
		expect(container.querySelector(".vide-fullscreen")).not.toBeNull();
		expect(
			container.querySelector(".vide-fullscreen")?.getAttribute("aria-label"),
		).toBe("Fullscreen");
		comp.destroy();
	});

	it("targets the parent of .vide-ui for fullscreen", () => {
		// Simulate real DOM: playerContainer > .vide-ui > .vide-controls > button
		const playerContainer = document.createElement("div");
		const uiRoot = document.createElement("div");
		uiRoot.className = "vide-ui";
		playerContainer.appendChild(uiRoot);
		const controls = document.createElement("div");
		controls.className = "vide-controls";
		uiRoot.appendChild(controls);
		document.body.appendChild(playerContainer);

		const comp = createFullscreen();
		comp.mount(controls);

		// The button should use playerContainer (parent of .vide-ui) for fullscreen
		playerContainer.requestFullscreen = vi.fn().mockResolvedValue(undefined);
		const btn = controls.querySelector<HTMLButtonElement>(
			".vide-fullscreen",
		) as HTMLButtonElement;
		comp.connect();
		btn.click();
		expect(playerContainer.requestFullscreen).toHaveBeenCalled();

		comp.destroy();
		document.body.removeChild(playerContainer);
	});

	it("destroy removes the element", () => {
		const container = document.createElement("div");
		const comp = createFullscreen();
		comp.mount(container);
		comp.destroy();
		expect(container.querySelector(".vide-fullscreen")).toBeNull();
	});
});
