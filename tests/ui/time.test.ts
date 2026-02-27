import { describe, expect, it } from "vitest";
import { createPlayer } from "../../src/core.js";
import { createTimeDisplay } from "../../src/ui/components/time.js";

function makeVideo(): HTMLVideoElement {
	return document.createElement("video");
}

describe("createTimeDisplay", () => {
	it("mounts time display DOM", () => {
		const container = document.createElement("div");
		const comp = createTimeDisplay();
		comp.mount(container);
		expect(container.querySelector(".vide-time")).not.toBeNull();
		expect(container.querySelector(".vide-time__current")).not.toBeNull();
		expect(container.querySelector(".vide-time__separator")).not.toBeNull();
		expect(container.querySelector(".vide-time__duration")).not.toBeNull();
		comp.destroy();
	});

	it("starts with 0:00 / 0:00", () => {
		const container = document.createElement("div");
		const comp = createTimeDisplay();
		comp.mount(container);
		expect(container.querySelector(".vide-time__current")?.textContent).toBe(
			"0:00",
		);
		expect(container.querySelector(".vide-time__duration")?.textContent).toBe(
			"0:00",
		);
		comp.destroy();
	});

	it("updates on timeupdate event", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");
		const comp = createTimeDisplay();
		comp.mount(container);
		comp.connect(player);

		player.emit("timeupdate", { currentTime: 65, duration: 300 });

		expect(container.querySelector(".vide-time__current")?.textContent).toBe(
			"1:05",
		);
		expect(container.querySelector(".vide-time__duration")?.textContent).toBe(
			"5:00",
		);
		comp.destroy();
	});

	it("handles hours", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");
		const comp = createTimeDisplay();
		comp.mount(container);
		comp.connect(player);

		player.emit("timeupdate", { currentTime: 3661, duration: 7200 });

		expect(container.querySelector(".vide-time__current")?.textContent).toBe(
			"1:01:01",
		);
		expect(container.querySelector(".vide-time__duration")?.textContent).toBe(
			"2:00:00",
		);
		comp.destroy();
	});

	it("destroy removes the element", () => {
		const container = document.createElement("div");
		const comp = createTimeDisplay();
		comp.mount(container);
		comp.destroy();
		expect(container.querySelector(".vide-time")).toBeNull();
	});
});
