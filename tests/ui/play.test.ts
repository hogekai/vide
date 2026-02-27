import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { createPlayButton } from "../../src/ui/components/play.js";

function makeVideo(): HTMLVideoElement {
	return document.createElement("video");
}

function driveToPlaying(el: HTMLVideoElement): void {
	el.dispatchEvent(new Event("loadstart"));
	el.dispatchEvent(new Event("canplay"));
	el.dispatchEvent(new Event("play"));
}

describe("createPlayButton", () => {
	it("mounts a button into the container", () => {
		const container = document.createElement("div");
		const comp = createPlayButton();
		comp.mount(container);
		const btn = container.querySelector(".vide-play");
		expect(btn).not.toBeNull();
		expect(btn?.tagName).toBe("BUTTON");
		comp.destroy();
	});

	it("starts with paused class", () => {
		const container = document.createElement("div");
		const comp = createPlayButton();
		comp.mount(container);
		const btn = container.querySelector(".vide-play") as Element;
		expect(btn.classList.contains("vide-play--paused")).toBe(true);
		comp.destroy();
	});

	it("toggles to playing class on play", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");
		const comp = createPlayButton();
		comp.mount(container);
		comp.connect(player);

		driveToPlaying(el);
		const btn = container.querySelector(".vide-play") as Element;
		expect(btn.classList.contains("vide-play--playing")).toBe(true);
		expect(btn.classList.contains("vide-play--paused")).toBe(false);
		comp.destroy();
	});

	it("toggles back to paused class on pause", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");
		const comp = createPlayButton();
		comp.mount(container);
		comp.connect(player);

		driveToPlaying(el);
		el.dispatchEvent(new Event("pause"));
		const btn = container.querySelector(".vide-play") as Element;
		expect(btn.classList.contains("vide-play--paused")).toBe(true);
		comp.destroy();
	});

	it("click calls play when paused", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		el.dispatchEvent(new Event("loadstart"));
		el.dispatchEvent(new Event("canplay"));

		const container = document.createElement("div");
		const comp = createPlayButton();
		comp.mount(container);
		comp.connect(player);

		const spy = vi.spyOn(player, "play").mockResolvedValue();
		const btn = container.querySelector<HTMLButtonElement>(
			".vide-play",
		) as HTMLButtonElement;
		btn.click();
		expect(spy).toHaveBeenCalled();
		comp.destroy();
	});

	it("click calls pause when playing", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		driveToPlaying(el);

		const container = document.createElement("div");
		const comp = createPlayButton();
		comp.mount(container);
		comp.connect(player);

		const spy = vi.spyOn(player, "pause");
		const btn = container.querySelector<HTMLButtonElement>(
			".vide-play",
		) as HTMLButtonElement;
		btn.click();
		expect(spy).toHaveBeenCalled();
		comp.destroy();
	});

	it("destroy removes the element", () => {
		const container = document.createElement("div");
		const comp = createPlayButton();
		comp.mount(container);
		expect(container.querySelector(".vide-play")).not.toBeNull();
		comp.destroy();
		expect(container.querySelector(".vide-play")).toBeNull();
	});
});
