import { describe, expect, it } from "vitest";
import { createPlayer } from "../../src/core.js";
import {
	connectStateClasses,
	isAdState,
	stateToClass,
} from "../../src/ui/state.js";

function makeVideo(): HTMLVideoElement {
	return document.createElement("video");
}

describe("stateToClass", () => {
	it("converts simple state", () => {
		expect(stateToClass("playing")).toBe("vide-ui--playing");
		expect(stateToClass("paused")).toBe("vide-ui--paused");
		expect(stateToClass("idle")).toBe("vide-ui--idle");
	});

	it("converts colon states to hyphen", () => {
		expect(stateToClass("ad:playing")).toBe("vide-ui--ad-playing");
		expect(stateToClass("ad:loading")).toBe("vide-ui--ad-loading");
		expect(stateToClass("ad:paused")).toBe("vide-ui--ad-paused");
	});
});

describe("isAdState", () => {
	it("returns true for ad states", () => {
		expect(isAdState("ad:loading")).toBe(true);
		expect(isAdState("ad:playing")).toBe(true);
		expect(isAdState("ad:paused")).toBe(true);
	});

	it("returns false for content states", () => {
		expect(isAdState("playing")).toBe(false);
		expect(isAdState("paused")).toBe(false);
		expect(isAdState("idle")).toBe(false);
		expect(isAdState("loading")).toBe(false);
	});
});

describe("connectStateClasses", () => {
	it("adds initial state class", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const root = document.createElement("div");
		connectStateClasses(root, player);
		expect(root.classList.contains("vide-ui--idle")).toBe(true);
	});

	it("updates class on state transition", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const root = document.createElement("div");
		connectStateClasses(root, player);

		el.dispatchEvent(new Event("loadstart"));
		expect(root.classList.contains("vide-ui--loading")).toBe(true);
		expect(root.classList.contains("vide-ui--idle")).toBe(false);
	});

	it("cleanup removes listener", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const root = document.createElement("div");
		const cleanup = connectStateClasses(root, player);

		cleanup();
		el.dispatchEvent(new Event("loadstart"));
		// Class should NOT be updated after cleanup
		expect(root.classList.contains("vide-ui--idle")).toBe(true);
		expect(root.classList.contains("vide-ui--loading")).toBe(false);
	});
});
