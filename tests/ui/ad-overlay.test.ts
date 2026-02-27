import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { createAdOverlay } from "../../src/ui/components/ad-overlay.js";

function makeVideo(): HTMLVideoElement {
	return document.createElement("video");
}

describe("createAdOverlay", () => {
	it("mounts ad overlay", () => {
		const container = document.createElement("div");
		const comp = createAdOverlay();
		comp.mount(container);
		expect(container.querySelector(".vide-ad-overlay")).not.toBeNull();
		comp.destroy();
	});

	it("click forwards to player.el", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");
		const comp = createAdOverlay();
		comp.mount(container);
		comp.connect(player);

		const clickSpy = vi.spyOn(el, "click");
		const overlay = container.querySelector<HTMLDivElement>(
			".vide-ad-overlay",
		) as HTMLDivElement;
		overlay.click();
		expect(clickSpy).toHaveBeenCalled();
		comp.destroy();
	});

	it("destroy removes the element", () => {
		const container = document.createElement("div");
		const comp = createAdOverlay();
		comp.mount(container);
		comp.destroy();
		expect(container.querySelector(".vide-ad-overlay")).toBeNull();
	});
});
