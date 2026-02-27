import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { createVolume } from "../../src/ui/components/volume.js";

function makeVideo(): HTMLVideoElement {
	return document.createElement("video");
}

describe("createVolume", () => {
	it("mounts volume DOM", () => {
		const container = document.createElement("div");
		const comp = createVolume();
		comp.mount(container);
		expect(container.querySelector(".vide-volume")).not.toBeNull();
		expect(container.querySelector(".vide-volume__button")).not.toBeNull();
		expect(container.querySelector(".vide-volume__slider")).not.toBeNull();
		comp.destroy();
	});

	it("mute button toggles player.muted", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");
		const comp = createVolume();
		comp.mount(container);
		comp.connect(player);

		expect(player.muted).toBe(false);
		const muteBtn = container.querySelector<HTMLButtonElement>(
			".vide-volume__button",
		) as HTMLButtonElement;
		muteBtn.click();
		expect(player.muted).toBe(true);
		muteBtn.click();
		expect(player.muted).toBe(false);
		comp.destroy();
	});

	it("adds muted class when muted", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");
		const comp = createVolume();
		comp.mount(container);
		comp.connect(player);

		const muteBtn = container.querySelector<HTMLButtonElement>(
			".vide-volume__button",
		) as HTMLButtonElement;
		muteBtn.click();
		const root = container.querySelector<HTMLDivElement>(
			".vide-volume",
		) as HTMLDivElement;
		expect(root.classList.contains("vide-volume--muted")).toBe(true);
		comp.destroy();
	});

	it("syncs on volumechange event", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");
		const comp = createVolume();
		comp.mount(container);
		comp.connect(player);

		player.volume = 0.5;
		el.dispatchEvent(new Event("volumechange"));

		const root = container.querySelector<HTMLDivElement>(
			".vide-volume",
		) as HTMLDivElement;
		expect(root.style.getPropertyValue("--vide-volume")).toBe("0.5");
		comp.destroy();
	});

	it("destroy removes the element", () => {
		const container = document.createElement("div");
		const comp = createVolume();
		comp.mount(container);
		comp.destroy();
		expect(container.querySelector(".vide-volume")).toBeNull();
	});
});
