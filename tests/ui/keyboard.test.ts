import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import type { PlayerState } from "../../src/types.js";
import { createKeyboard } from "../../src/ui/components/keyboard.js";
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
	const container = document.createElement("div");
	container.className = "vide-ui";
	const excluded = new Set<UIComponentName>(exclude);
	const comp = createKeyboard({ excluded });
	comp.mount(container);
	comp.connect(player);
	return { videoEl, player, container, comp };
}

function key(target: HTMLElement, keyValue: string): void {
	target.dispatchEvent(
		new KeyboardEvent("keydown", { key: keyValue, bubbles: true }),
	);
}

describe("createKeyboard", () => {
	it("sets tabindex on root", () => {
		const { container, comp } = setup();
		expect(container.getAttribute("tabindex")).toBe("0");
		comp.destroy();
	});

	it("removes tabindex on destroy", () => {
		const { container, comp } = setup();
		comp.destroy();
		expect(container.getAttribute("tabindex")).toBeNull();
	});

	it("Space toggles play/pause", () => {
		const { videoEl, player, container, comp } = setup();
		driveToReady(videoEl);
		const playSpy = vi.spyOn(player, "play").mockResolvedValue();
		key(container, " ");
		expect(playSpy).toHaveBeenCalled();

		driveToPlaying(videoEl);
		const pauseSpy = vi.spyOn(player, "pause");
		key(container, " ");
		expect(pauseSpy).toHaveBeenCalled();
		comp.destroy();
	});

	it("K toggles play/pause", () => {
		const { videoEl, player, container, comp } = setup();
		driveToReady(videoEl);
		const playSpy = vi.spyOn(player, "play").mockResolvedValue();
		key(container, "k");
		expect(playSpy).toHaveBeenCalled();
		comp.destroy();
	});

	it("ArrowLeft seeks back 5s", () => {
		const { videoEl, player, container, comp } = setup();
		driveToPlaying(videoEl);
		Object.defineProperty(videoEl, "currentTime", {
			value: 30,
			writable: true,
		});
		key(container, "ArrowLeft");
		expect(player.currentTime).toBe(25);
		comp.destroy();
	});

	it("ArrowRight seeks forward 5s", () => {
		const { videoEl, player, container, comp } = setup();
		driveToPlaying(videoEl);
		Object.defineProperty(videoEl, "duration", {
			value: 100,
			writable: true,
		});
		Object.defineProperty(videoEl, "currentTime", {
			value: 30,
			writable: true,
		});
		key(container, "ArrowRight");
		expect(player.currentTime).toBe(35);
		comp.destroy();
	});

	it("ArrowUp increases volume by 10%", () => {
		const { videoEl, player, container, comp } = setup();
		player.volume = 0.5;
		key(container, "ArrowUp");
		expect(player.volume).toBeCloseTo(0.6);
		comp.destroy();
	});

	it("ArrowDown decreases volume by 10%", () => {
		const { videoEl, player, container, comp } = setup();
		player.volume = 0.5;
		key(container, "ArrowDown");
		expect(player.volume).toBeCloseTo(0.4);
		comp.destroy();
	});

	it("M toggles mute", () => {
		const { videoEl, player, container, comp } = setup();
		expect(player.muted).toBe(false);
		key(container, "m");
		expect(player.muted).toBe(true);
		key(container, "m");
		expect(player.muted).toBe(false);
		comp.destroy();
	});

	it("F toggles fullscreen", () => {
		const { container, comp } = setup();
		// jsdom doesn't support fullscreen, just verify no error
		key(container, "f");
		comp.destroy();
	});

	it("0-9 seeks to percentage", () => {
		const { videoEl, player, container, comp } = setup();
		driveToPlaying(videoEl);
		Object.defineProperty(videoEl, "duration", {
			value: 100,
			writable: true,
		});
		key(container, "5");
		expect(player.currentTime).toBe(50);
		key(container, "0");
		expect(player.currentTime).toBe(0);
		comp.destroy();
	});

	it("seek keys disabled during ad state", () => {
		const { videoEl, player, container, comp } = setup();
		driveToPlaying(videoEl);
		Object.defineProperty(videoEl, "duration", {
			value: 100,
			writable: true,
		});
		Object.defineProperty(videoEl, "currentTime", {
			value: 30,
			writable: true,
		});

		const setState = (player as unknown as { _setState(s: PlayerState): void })
			._setState;
		setState("ad:loading");
		setState("ad:playing");

		key(container, "ArrowLeft");
		// currentTime should not change during ad
		expect(player.currentTime).toBe(30);

		key(container, "5");
		expect(player.currentTime).toBe(30);
		comp.destroy();
	});

	it("does not fire when keydown is on a different element", () => {
		const { videoEl, player, container, comp } = setup();
		driveToReady(videoEl);
		const playSpy = vi.spyOn(player, "play").mockResolvedValue();
		// Dispatch on document.body instead of container
		document.body.dispatchEvent(
			new KeyboardEvent("keydown", { key: " ", bubbles: false }),
		);
		expect(playSpy).not.toHaveBeenCalled();
		comp.destroy();
	});

	it("volume keys disabled when volume excluded", () => {
		const { player, container, comp } = setup(["volume"]);
		player.volume = 0.5;
		key(container, "ArrowUp");
		expect(player.volume).toBe(0.5);
		key(container, "m");
		expect(player.muted).toBe(false);
		comp.destroy();
	});

	it("seek keys disabled when progress excluded", () => {
		const { videoEl, player, container, comp } = setup(["progress"]);
		driveToPlaying(videoEl);
		Object.defineProperty(videoEl, "currentTime", {
			value: 30,
			writable: true,
		});
		key(container, "ArrowLeft");
		expect(player.currentTime).toBe(30);
		comp.destroy();
	});
});
