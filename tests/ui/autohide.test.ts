import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import type { PlayerState } from "../../src/types.js";
import { createAutohide } from "../../src/ui/components/autohide.js";

function makeVideo(): HTMLVideoElement {
	return document.createElement("video");
}

function driveToPlaying(el: HTMLVideoElement): void {
	el.dispatchEvent(new Event("loadstart"));
	el.dispatchEvent(new Event("canplay"));
	el.dispatchEvent(new Event("play"));
}

function setup() {
	const videoEl = makeVideo();
	const player = createPlayer(videoEl);
	const root = document.createElement("div");
	root.className = "vide-ui";
	const comp = createAutohide();
	comp.mount(root);
	comp.connect(player);
	return { videoEl, player, root, comp };
}

describe("createAutohide", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("adds idle class after 3s of inactivity when playing", () => {
		const { videoEl, root, comp } = setup();
		driveToPlaying(videoEl);
		expect(root.classList.contains("vide-ui--idle")).toBe(false);
		vi.advanceTimersByTime(3000);
		expect(root.classList.contains("vide-ui--idle")).toBe(true);
		comp.destroy();
	});

	it("removes idle class on mousemove", () => {
		const { videoEl, root, comp } = setup();
		driveToPlaying(videoEl);
		vi.advanceTimersByTime(3000);
		expect(root.classList.contains("vide-ui--idle")).toBe(true);
		root.dispatchEvent(new MouseEvent("mousemove"));
		expect(root.classList.contains("vide-ui--idle")).toBe(false);
		comp.destroy();
	});

	it("resets timer on mousemove", () => {
		const { videoEl, root, comp } = setup();
		driveToPlaying(videoEl);
		vi.advanceTimersByTime(2000);
		root.dispatchEvent(new MouseEvent("mousemove"));
		vi.advanceTimersByTime(2000);
		// Should not be idle yet (only 2s since last activity)
		expect(root.classList.contains("vide-ui--idle")).toBe(false);
		vi.advanceTimersByTime(1000);
		// Now 3s since last activity
		expect(root.classList.contains("vide-ui--idle")).toBe(true);
		comp.destroy();
	});

	it("does not go idle when paused", () => {
		const { videoEl, root, comp } = setup();
		driveToPlaying(videoEl);
		videoEl.dispatchEvent(new Event("pause"));
		vi.advanceTimersByTime(5000);
		expect(root.classList.contains("vide-ui--idle")).toBe(false);
		comp.destroy();
	});

	it("does not go idle during ad state", () => {
		const { videoEl, player, root, comp } = setup();
		driveToPlaying(videoEl);
		const setState = (
			player as unknown as { _setState(s: PlayerState): void }
		)._setState;
		setState("ad:loading");
		setState("ad:playing");
		vi.advanceTimersByTime(5000);
		expect(root.classList.contains("vide-ui--idle")).toBe(false);
		comp.destroy();
	});

	it("clears idle class when paused", () => {
		const { videoEl, root, comp } = setup();
		driveToPlaying(videoEl);
		vi.advanceTimersByTime(3000);
		expect(root.classList.contains("vide-ui--idle")).toBe(true);
		videoEl.dispatchEvent(new Event("pause"));
		expect(root.classList.contains("vide-ui--idle")).toBe(false);
		comp.destroy();
	});

	it("removes idle class on destroy", () => {
		const { videoEl, root, comp } = setup();
		driveToPlaying(videoEl);
		vi.advanceTimersByTime(3000);
		expect(root.classList.contains("vide-ui--idle")).toBe(true);
		comp.destroy();
		expect(root.classList.contains("vide-ui--idle")).toBe(false);
	});

	it("removes idle class on keydown", () => {
		const { videoEl, root, comp } = setup();
		driveToPlaying(videoEl);
		vi.advanceTimersByTime(3000);
		expect(root.classList.contains("vide-ui--idle")).toBe(true);
		root.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
		expect(root.classList.contains("vide-ui--idle")).toBe(false);
		comp.destroy();
	});
});
