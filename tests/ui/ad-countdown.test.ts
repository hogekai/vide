import { describe, expect, it } from "vitest";
import { createPlayer } from "../../src/core.js";
import type { PlayerState } from "../../src/types.js";
import { createAdCountdown } from "../../src/ui/components/ad-countdown.js";
import { createAdUIState } from "../../src/ui/utils.js";

function makeVideo(): HTMLVideoElement {
	return document.createElement("video");
}

function driveToAdPlaying(
	el: HTMLVideoElement,
	player: ReturnType<typeof createPlayer>,
): void {
	el.dispatchEvent(new Event("loadstart"));
	el.dispatchEvent(new Event("canplay"));
	el.dispatchEvent(new Event("play"));
	const setState = (player as unknown as { _setState(s: PlayerState): void })
		._setState;
	setState("ad:loading");
	setState("ad:playing");
}

describe("createAdCountdown", () => {
	it("mounts ad countdown", () => {
		const adState = createAdUIState();
		const container = document.createElement("div");
		const comp = createAdCountdown(adState);
		comp.mount(container);
		expect(container.querySelector(".vide-ad-countdown")).not.toBeNull();
		comp.destroy();
	});

	it("shows remaining time during ad playback", () => {
		const adState = createAdUIState();
		adState.set({
			adId: "ad1",
			skipOffset: 5,
			clickThrough: undefined,
			duration: 30,
		});

		const el = makeVideo();
		const player = createPlayer(el);
		driveToAdPlaying(el, player);

		const container = document.createElement("div");
		const comp = createAdCountdown(adState);
		comp.mount(container);
		comp.connect(player);

		// Simulate 10s into a 30s ad
		Object.defineProperty(el, "currentTime", {
			value: 10,
			writable: true,
		});
		player.emit("timeupdate", { currentTime: 10, duration: 30 });

		const root = container.querySelector(".vide-ad-countdown") as Element;
		expect(root.textContent).toBe("20s");
		comp.destroy();
	});

	it("falls back to player.el.duration when no AdUIState", () => {
		const adState = createAdUIState();
		// No adState.set() called

		const el = makeVideo();
		const player = createPlayer(el);
		driveToAdPlaying(el, player);

		const container = document.createElement("div");
		const comp = createAdCountdown(adState);
		comp.mount(container);
		comp.connect(player);

		Object.defineProperty(el, "duration", { value: 20, writable: true });
		Object.defineProperty(el, "currentTime", { value: 5, writable: true });
		player.emit("timeupdate", { currentTime: 5, duration: 20 });

		const root = container.querySelector(".vide-ad-countdown") as Element;
		expect(root.textContent).toBe("15s");
		comp.destroy();
	});

	it("destroy removes the element", () => {
		const adState = createAdUIState();
		const container = document.createElement("div");
		const comp = createAdCountdown(adState);
		comp.mount(container);
		comp.destroy();
		expect(container.querySelector(".vide-ad-countdown")).toBeNull();
	});
});
