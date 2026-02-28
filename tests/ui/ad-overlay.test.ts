import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { createAdOverlay } from "../../src/ui/components/ad-overlay.js";
import { createAdUIState } from "../../src/ui/utils.js";

function makeVideo(): HTMLVideoElement {
	return document.createElement("video");
}

describe("createAdOverlay", () => {
	it("mounts ad overlay", () => {
		const container = document.createElement("div");
		const comp = createAdOverlay(createAdUIState());
		comp.mount(container);
		expect(container.querySelector(".vide-ad-overlay")).not.toBeNull();
		comp.destroy();
	});

	it("click forwards to player.el", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");
		const comp = createAdOverlay(createAdUIState());
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

	it("opens clickThrough URL on click when available", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");
		const adState = createAdUIState();
		adState.set({
			adId: "test-ad",
			skipOffset: undefined,
			clickThrough: "https://example.com/landing",
			duration: 30,
		});
		const comp = createAdOverlay(adState);
		comp.mount(container);
		comp.connect(player);

		const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
		const overlay = container.querySelector<HTMLDivElement>(
			".vide-ad-overlay",
		) as HTMLDivElement;
		overlay.click();
		expect(openSpy).toHaveBeenCalledWith(
			"https://example.com/landing",
			"_blank",
		);
		openSpy.mockRestore();
		comp.destroy();
	});

	it("destroy removes the element", () => {
		const container = document.createElement("div");
		const comp = createAdOverlay(createAdUIState());
		comp.mount(container);
		comp.destroy();
		expect(container.querySelector(".vide-ad-overlay")).toBeNull();
	});
});
