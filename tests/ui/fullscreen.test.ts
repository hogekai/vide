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

	it("destroy removes the element", () => {
		const container = document.createElement("div");
		const comp = createFullscreen();
		comp.mount(container);
		comp.destroy();
		expect(container.querySelector(".vide-fullscreen")).toBeNull();
	});
});
