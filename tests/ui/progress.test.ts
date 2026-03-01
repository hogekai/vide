import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import type { PluginPlayer } from "../../src/types.js";
import { createProgress } from "../../src/ui/components/progress.js";

function makeVideo(): HTMLVideoElement {
	return document.createElement("video");
}

function driveToPlaying(el: HTMLVideoElement): void {
	el.dispatchEvent(new Event("loadstart"));
	el.dispatchEvent(new Event("canplay"));
	el.dispatchEvent(new Event("play"));
}

describe("createProgress", () => {
	it("mounts progress bar DOM", () => {
		const container = document.createElement("div");
		const comp = createProgress();
		comp.mount(container);
		expect(container.querySelector(".vide-progress")).not.toBeNull();
		expect(container.querySelector(".vide-progress__bar")).not.toBeNull();
		expect(container.querySelector(".vide-progress__buffered")).not.toBeNull();
		expect(container.querySelector(".vide-progress__handle")).not.toBeNull();
		comp.destroy();
	});

	it("updates --vide-progress on timeupdate", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		driveToPlaying(el);

		const container = document.createElement("div");
		const comp = createProgress();
		comp.mount(container);
		comp.connect(player);

		// Simulate timeupdate with duration
		Object.defineProperty(el, "duration", { value: 100, writable: true });
		Object.defineProperty(el, "currentTime", { value: 25, writable: true });
		el.dispatchEvent(new Event("timeupdate"));

		const root = container.querySelector<HTMLDivElement>(
			".vide-progress",
		) as HTMLDivElement;
		expect(root.style.getPropertyValue("--vide-progress")).toBe("0.25");
		comp.destroy();
	});

	it("adds disabled class during ad states", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		driveToPlaying(el);

		const container = document.createElement("div");
		const comp = createProgress();
		comp.mount(container);
		comp.connect(player);

		// Simulate ad:loading transition
		const setState = (player as unknown as PluginPlayer).setState;
		setState("ad:loading");

		const root = container.querySelector<HTMLDivElement>(
			".vide-progress",
		) as HTMLDivElement;
		expect(root.classList.contains("vide-progress--disabled")).toBe(true);
		comp.destroy();
	});

	it("removes disabled class when leaving ad state", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		driveToPlaying(el);

		const container = document.createElement("div");
		const comp = createProgress();
		comp.mount(container);
		comp.connect(player);

		const setState = (player as unknown as PluginPlayer).setState;
		setState("ad:loading");
		setState("ad:playing");
		setState("playing");

		const root = container.querySelector<HTMLDivElement>(
			".vide-progress",
		) as HTMLDivElement;
		expect(root.classList.contains("vide-progress--disabled")).toBe(false);
		comp.destroy();
	});

	it("has ARIA slider attributes", () => {
		const container = document.createElement("div");
		const comp = createProgress();
		comp.mount(container);
		const root = container.querySelector<HTMLDivElement>(
			".vide-progress",
		) as HTMLDivElement;
		expect(root.getAttribute("role")).toBe("slider");
		expect(root.getAttribute("aria-label")).toBe("Seek");
		expect(root.getAttribute("aria-valuemin")).toBe("0");
		expect(root.getAttribute("aria-valuenow")).toBe("0");
		comp.destroy();
	});

	it("updates aria-valuenow on timeupdate", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		driveToPlaying(el);

		const container = document.createElement("div");
		const comp = createProgress();
		comp.mount(container);
		comp.connect(player);

		Object.defineProperty(el, "duration", { value: 100, writable: true });
		Object.defineProperty(el, "currentTime", { value: 42, writable: true });
		el.dispatchEvent(new Event("timeupdate"));

		const root = container.querySelector<HTMLDivElement>(
			".vide-progress",
		) as HTMLDivElement;
		expect(root.getAttribute("aria-valuenow")).toBe("42");
		expect(root.getAttribute("aria-valuemax")).toBe("100");
		comp.destroy();
	});

	it("destroy removes the element", () => {
		const container = document.createElement("div");
		const comp = createProgress();
		comp.mount(container);
		comp.destroy();
		expect(container.querySelector(".vide-progress")).toBeNull();
	});
});
