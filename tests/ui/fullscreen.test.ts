import { afterEach, describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { createFullscreen } from "../../src/ui/components/fullscreen.js";

/** Build a DOM tree: playerContainer > .vide-ui > .vide-controls */
function buildPlayerDOM() {
	const playerContainer = document.createElement("div");
	const uiRoot = document.createElement("div");
	uiRoot.className = "vide-ui";
	playerContainer.appendChild(uiRoot);
	const controls = document.createElement("div");
	controls.className = "vide-controls";
	uiRoot.appendChild(controls);
	document.body.appendChild(playerContainer);
	return { playerContainer, uiRoot, controls };
}

describe("createFullscreen", () => {
	afterEach(() => {
		// Clean up any webkit properties set on document
		(document as any).webkitFullscreenElement = undefined;
		(document as any).webkitExitFullscreen = undefined;
	});

	it("mounts fullscreen button", () => {
		const container = document.createElement("div");
		const comp = createFullscreen();
		comp.mount(container);
		expect(container.querySelector(".vide-fullscreen")).not.toBeNull();
		expect(
			container.querySelector(".vide-fullscreen")?.getAttribute("aria-label"),
		).toBe("Fullscreen");
		comp.destroy();
	});

	it("targets the parent of .vide-ui for fullscreen", () => {
		const { playerContainer, controls } = buildPlayerDOM();

		const comp = createFullscreen();
		comp.mount(controls);

		// The button should use playerContainer (parent of .vide-ui) for fullscreen
		playerContainer.requestFullscreen = vi.fn().mockResolvedValue(undefined);
		const btn = controls.querySelector<HTMLButtonElement>(
			".vide-fullscreen",
		) as HTMLButtonElement;
		comp.connect();
		btn.click();
		expect(playerContainer.requestFullscreen).toHaveBeenCalled();

		comp.destroy();
		document.body.removeChild(playerContainer);
	});

	it("destroy removes the element", () => {
		const container = document.createElement("div");
		const comp = createFullscreen();
		comp.mount(container);
		comp.destroy();
		expect(container.querySelector(".vide-fullscreen")).toBeNull();
	});

	it("falls back to webkitRequestFullscreen when requestFullscreen is undefined", () => {
		const { playerContainer, controls } = buildPlayerDOM();

		const comp = createFullscreen();
		comp.mount(controls);

		// Remove standard API, add webkit fallback
		(playerContainer as any).requestFullscreen = undefined;
		(playerContainer as any).webkitRequestFullscreen = vi.fn();

		const btn = controls.querySelector<HTMLButtonElement>(
			".vide-fullscreen",
		) as HTMLButtonElement;
		comp.connect();
		btn.click();
		expect((playerContainer as any).webkitRequestFullscreen).toHaveBeenCalled();

		comp.destroy();
		document.body.removeChild(playerContainer);
	});

	it("falls back to video webkitEnterFullscreen when no fullscreen API exists on container", () => {
		const { playerContainer, controls } = buildPlayerDOM();
		const video = document.createElement("video");
		playerContainer.appendChild(video);

		const comp = createFullscreen();
		comp.mount(controls);

		// Remove both standard and webkit fullscreen on the container
		(playerContainer as any).requestFullscreen = undefined;
		(playerContainer as any).webkitRequestFullscreen = undefined;
		(video as any).webkitEnterFullscreen = vi.fn();

		const btn = controls.querySelector<HTMLButtonElement>(
			".vide-fullscreen",
		) as HTMLButtonElement;
		comp.connect();
		btn.click();
		expect((video as any).webkitEnterFullscreen).toHaveBeenCalled();

		comp.destroy();
		document.body.removeChild(playerContainer);
	});

	it("falls back to webkitExitFullscreen when exitFullscreen is undefined", () => {
		const { playerContainer, controls } = buildPlayerDOM();

		const comp = createFullscreen();
		comp.mount(controls);

		// Simulate fullscreen active via webkit property
		const origExit = document.exitFullscreen;
		(document as any).exitFullscreen = undefined;
		(document as any).webkitFullscreenElement = playerContainer;
		(document as any).webkitExitFullscreen = vi.fn();

		const btn = controls.querySelector<HTMLButtonElement>(
			".vide-fullscreen",
		) as HTMLButtonElement;
		comp.connect();
		btn.click();
		expect((document as any).webkitExitFullscreen).toHaveBeenCalled();

		// Restore
		document.exitFullscreen = origExit;
		comp.destroy();
		document.body.removeChild(playerContainer);
	});

	it("webkitfullscreenchange event triggers icon update", () => {
		const { playerContainer, controls } = buildPlayerDOM();

		const comp = createFullscreen();
		comp.mount(controls);
		comp.connect();

		const btn = controls.querySelector<HTMLButtonElement>(
			".vide-fullscreen",
		) as HTMLButtonElement;

		// Simulate entering fullscreen via webkit
		(document as any).webkitFullscreenElement = playerContainer;
		document.dispatchEvent(new Event("webkitfullscreenchange"));

		expect(btn.classList.contains("vide-fullscreen--active")).toBe(true);
		expect(btn.getAttribute("aria-label")).toBe("Exit fullscreen");

		// Simulate exiting fullscreen
		(document as any).webkitFullscreenElement = null;
		document.dispatchEvent(new Event("webkitfullscreenchange"));

		expect(btn.classList.contains("vide-fullscreen--active")).toBe(false);
		expect(btn.getAttribute("aria-label")).toBe("Fullscreen");

		comp.destroy();
		document.body.removeChild(playerContainer);
	});

	it("checks webkitFullscreenElement for fullscreen state", () => {
		const { playerContainer, controls } = buildPlayerDOM();

		const comp = createFullscreen();
		comp.mount(controls);
		comp.connect();

		const btn = controls.querySelector<HTMLButtonElement>(
			".vide-fullscreen",
		) as HTMLButtonElement;

		// No standard fullscreenElement, but webkit reports fullscreen
		(document as any).webkitFullscreenElement = playerContainer;
		document.dispatchEvent(new Event("fullscreenchange"));

		expect(btn.classList.contains("vide-fullscreen--active")).toBe(true);

		comp.destroy();
		document.body.removeChild(playerContainer);
	});
});
