import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import type { PlayerState } from "../../src/types.js";
import { createAdSkip } from "../../src/ui/components/ad-skip.js";
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

describe("createAdSkip", () => {
	it("mounts skip button hidden and disabled", () => {
		const adState = createAdUIState();
		const container = document.createElement("div");
		const comp = createAdSkip(adState);
		comp.mount(container);
		const btn = container.querySelector(".vide-skip") as HTMLElement;
		expect(btn).not.toBeNull();
		expect(btn.classList.contains("vide-skip--disabled")).toBe(true);
		expect(btn.style.display).toBe("none");
		comp.destroy();
	});

	it("shows countdown before skipOffset", () => {
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
		const comp = createAdSkip(adState);
		comp.mount(container);
		comp.connect(player);

		Object.defineProperty(el, "currentTime", { value: 2, writable: true });
		player.emit("timeupdate", { currentTime: 2, duration: 30 });

		const btn = container.querySelector(".vide-skip") as Element;
		expect(btn.textContent).toBe("Skip in 3s");
		expect(btn.classList.contains("vide-skip--disabled")).toBe(true);
		comp.destroy();
	});

	it("enables after skipOffset reached", () => {
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
		const comp = createAdSkip(adState);
		comp.mount(container);
		comp.connect(player);

		Object.defineProperty(el, "currentTime", { value: 6, writable: true });
		player.emit("timeupdate", { currentTime: 6, duration: 30 });

		const btn = container.querySelector(".vide-skip") as Element;
		expect(btn.textContent).toBe("Skip Ad");
		expect(btn.classList.contains("vide-skip--disabled")).toBe(false);
		comp.destroy();
	});

	it("click emits ad:skip when enabled", () => {
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
		const comp = createAdSkip(adState);
		comp.mount(container);
		comp.connect(player);

		// Reach skip offset
		Object.defineProperty(el, "currentTime", { value: 6, writable: true });
		player.emit("timeupdate", { currentTime: 6, duration: 30 });

		const spy = vi.fn();
		player.on("ad:skip", spy);

		const btn = container.querySelector<HTMLButtonElement>(
			".vide-skip",
		) as HTMLButtonElement;
		btn.click();
		expect(spy).toHaveBeenCalledWith({ adId: "ad1" });
		comp.destroy();
	});

	it("click does nothing when disabled", () => {
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
		const comp = createAdSkip(adState);
		comp.mount(container);
		comp.connect(player);

		const spy = vi.fn();
		player.on("ad:skip", spy);

		// Still before skipOffset
		const btn = container.querySelector<HTMLButtonElement>(
			".vide-skip",
		) as HTMLButtonElement;
		btn.click();
		expect(spy).not.toHaveBeenCalled();
		comp.destroy();
	});

	it("destroy removes the element", () => {
		const adState = createAdUIState();
		const container = document.createElement("div");
		const comp = createAdSkip(adState);
		comp.mount(container);
		comp.destroy();
		expect(container.querySelector(".vide-skip")).toBeNull();
	});
});
