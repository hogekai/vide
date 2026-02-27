import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { createClickPlay } from "../../src/ui/components/clickplay.js";
import type { UIComponentName } from "../../src/ui/types.js";

function makeVideo(): HTMLVideoElement {
	return document.createElement("video");
}

function driveToPlaying(el: HTMLVideoElement): void {
	el.dispatchEvent(new Event("loadstart"));
	el.dispatchEvent(new Event("canplay"));
	el.dispatchEvent(new Event("play"));
}

function driveToReady(el: HTMLVideoElement): void {
	el.dispatchEvent(new Event("loadstart"));
	el.dispatchEvent(new Event("canplay"));
}

function setup(exclude: UIComponentName[] = []) {
	const videoEl = makeVideo();
	const player = createPlayer(videoEl);
	const root = document.createElement("div");
	root.className = "vide-ui";
	const excluded = new Set<UIComponentName>(exclude);
	const comp = createClickPlay(excluded);
	comp.mount(root);
	comp.connect(player);
	const overlay = root.querySelector<HTMLDivElement>(
		".vide-clickplay",
	) as HTMLDivElement;
	return { videoEl, player, root, comp, overlay };
}

describe("createClickPlay", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("mounts clickplay overlay", () => {
		const { root, comp } = setup();
		expect(root.querySelector(".vide-clickplay")).not.toBeNull();
		comp.destroy();
	});

	it("single click toggles play/pause", () => {
		const { videoEl, player, overlay, comp } = setup();
		driveToReady(videoEl);
		const playSpy = vi.spyOn(player, "play").mockResolvedValue();
		overlay.click();
		vi.advanceTimersByTime(250);
		expect(playSpy).toHaveBeenCalled();
		comp.destroy();
	});

	it("single click pauses when playing", () => {
		const { videoEl, player, overlay, comp } = setup();
		driveToPlaying(videoEl);
		const pauseSpy = vi.spyOn(player, "pause");
		overlay.click();
		vi.advanceTimersByTime(250);
		expect(pauseSpy).toHaveBeenCalled();
		comp.destroy();
	});

	it("double click does not fire play/pause", () => {
		const { videoEl, player, overlay, comp } = setup();
		driveToReady(videoEl);
		const playSpy = vi.spyOn(player, "play").mockResolvedValue();
		overlay.click();
		overlay.click();
		vi.advanceTimersByTime(250);
		// Double click should not trigger play (only fullscreen)
		expect(playSpy).not.toHaveBeenCalled();
		comp.destroy();
	});

	it("destroy removes overlay and clears timer", () => {
		const { root, comp } = setup();
		comp.destroy();
		expect(root.querySelector(".vide-clickplay")).toBeNull();
	});
});
