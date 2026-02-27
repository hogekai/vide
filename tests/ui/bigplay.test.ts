import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { createBigPlay } from "../../src/ui/components/bigplay.js";

function makeVideo(): HTMLVideoElement {
	return document.createElement("video");
}

describe("createBigPlay", () => {
	it("mounts big play button", () => {
		const container = document.createElement("div");
		const comp = createBigPlay();
		comp.mount(container);
		expect(container.querySelector(".vide-bigplay")).not.toBeNull();
		comp.destroy();
	});

	it("click calls player.play()", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");
		const comp = createBigPlay();
		comp.mount(container);
		comp.connect(player);

		const spy = vi.spyOn(player, "play").mockResolvedValue();
		const btn = container.querySelector<HTMLButtonElement>(
			".vide-bigplay",
		) as HTMLButtonElement;
		btn.click();
		expect(spy).toHaveBeenCalled();
		comp.destroy();
	});

	it("resets currentTime to 0 when state is ended", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		// Drive to ended state
		el.dispatchEvent(new Event("loadstart"));
		el.dispatchEvent(new Event("canplay"));
		el.dispatchEvent(new Event("play"));
		el.dispatchEvent(new Event("ended"));

		const container = document.createElement("div");
		const comp = createBigPlay();
		comp.mount(container);
		comp.connect(player);

		vi.spyOn(player, "play").mockResolvedValue();
		const btn = container.querySelector<HTMLButtonElement>(
			".vide-bigplay",
		) as HTMLButtonElement;
		btn.click();
		expect(player.currentTime).toBe(0);
		comp.destroy();
	});

	it("destroy removes the element", () => {
		const container = document.createElement("div");
		const comp = createBigPlay();
		comp.mount(container);
		comp.destroy();
		expect(container.querySelector(".vide-bigplay")).toBeNull();
	});
});
