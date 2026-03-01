import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../../src/core.js";
import type { PlayerState } from "../../../src/types.js";
import { createAdLearnMore } from "../../../src/ui/components/ad-learn-more.js";
import { createAdUIState } from "../../../src/ui/utils.js";

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

describe("createAdLearnMore", () => {
	it("mounts correctly with class vide-ad-cta, initially hidden", () => {
		const adState = createAdUIState();
		const container = document.createElement("div");
		const comp = createAdLearnMore(adState);
		comp.mount(container);

		const btn = container.querySelector(".vide-ad-cta") as HTMLElement;
		expect(btn).not.toBeNull();
		expect(btn.tagName).toBe("BUTTON");
		expect(btn.style.display).toBe("none");

		comp.destroy();
	});

	it("shows when ad starts with clickThrough", () => {
		const adState = createAdUIState();
		adState.set({
			adId: "a1",
			clickThrough: "https://example.com",
			skipOffset: undefined,
			duration: 30,
		});

		const el = makeVideo();
		const player = createPlayer(el);
		driveToAdPlaying(el, player);

		const container = document.createElement("div");
		const comp = createAdLearnMore(adState);
		comp.mount(container);
		comp.connect(player);

		player.emit("ad:start", { adId: "a1" });

		const btn = container.querySelector(".vide-ad-cta") as HTMLElement;
		expect(btn.style.display).not.toBe("none");

		comp.destroy();
	});

	it("hides when no clickThrough", () => {
		const adState = createAdUIState();
		adState.set({
			adId: "a1",
			clickThrough: undefined,
			skipOffset: undefined,
			duration: 30,
		});

		const el = makeVideo();
		const player = createPlayer(el);
		driveToAdPlaying(el, player);

		const container = document.createElement("div");
		const comp = createAdLearnMore(adState);
		comp.mount(container);
		comp.connect(player);

		player.emit("ad:start", { adId: "a1" });

		const btn = container.querySelector(".vide-ad-cta") as HTMLElement;
		expect(btn.style.display).toBe("none");

		comp.destroy();
	});

	it("displays hostname in .vide-ad-cta__url", () => {
		const adState = createAdUIState();
		adState.set({
			adId: "a1",
			clickThrough: "https://example.com/landing?ref=ad",
			skipOffset: undefined,
			duration: 30,
		});

		const el = makeVideo();
		const player = createPlayer(el);
		driveToAdPlaying(el, player);

		const container = document.createElement("div");
		const comp = createAdLearnMore(adState);
		comp.mount(container);
		comp.connect(player);

		player.emit("ad:start", { adId: "a1" });

		const urlEl = container.querySelector(".vide-ad-cta__url") as HTMLElement;
		expect(urlEl.textContent).toBe("example.com");

		comp.destroy();
	});

	it("displays adTitle when available", () => {
		const adState = createAdUIState();
		adState.set({
			adId: "a1",
			adTitle: "Learn More About Our Product",
			clickThrough: "https://example.com",
			skipOffset: undefined,
			duration: 30,
		});

		const el = makeVideo();
		const player = createPlayer(el);
		driveToAdPlaying(el, player);

		const container = document.createElement("div");
		const comp = createAdLearnMore(adState);
		comp.mount(container);
		comp.connect(player);

		player.emit("ad:start", { adId: "a1" });

		const titleEl = container.querySelector(
			".vide-ad-cta__title",
		) as HTMLElement;
		expect(titleEl.style.display).not.toBe("none");
		expect(titleEl.textContent).toBe("Learn More About Our Product");

		comp.destroy();
	});

	it("hides title when no adTitle", () => {
		const adState = createAdUIState();
		adState.set({
			adId: "a1",
			clickThrough: "https://example.com",
			skipOffset: undefined,
			duration: 30,
		});

		const el = makeVideo();
		const player = createPlayer(el);
		driveToAdPlaying(el, player);

		const container = document.createElement("div");
		const comp = createAdLearnMore(adState);
		comp.mount(container);
		comp.connect(player);

		player.emit("ad:start", { adId: "a1" });

		const titleEl = container.querySelector(
			".vide-ad-cta__title",
		) as HTMLElement;
		expect(titleEl.style.display).toBe("none");

		comp.destroy();
	});

	it("click opens URL and pauses", () => {
		const adState = createAdUIState();
		adState.set({
			adId: "a1",
			clickThrough: "https://example.com/landing",
			skipOffset: undefined,
			duration: 30,
		});

		const el = makeVideo();
		const player = createPlayer(el);
		driveToAdPlaying(el, player);

		const container = document.createElement("div");
		const comp = createAdLearnMore(adState);
		comp.mount(container);
		comp.connect(player);

		const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
		const clickSpy = vi.spyOn(el, "click");
		const pauseSpy = vi.spyOn(el, "pause");

		const btn = container.querySelector(".vide-ad-cta") as HTMLButtonElement;
		btn.click();

		expect(clickSpy).toHaveBeenCalled();
		expect(openSpy).toHaveBeenCalledWith(
			"https://example.com/landing",
			"_blank",
		);
		expect(pauseSpy).toHaveBeenCalled();

		openSpy.mockRestore();
		comp.destroy();
	});

	it("hides on ad:end", () => {
		const adState = createAdUIState();
		adState.set({
			adId: "a1",
			clickThrough: "https://example.com",
			skipOffset: undefined,
			duration: 30,
		});

		const el = makeVideo();
		const player = createPlayer(el);
		driveToAdPlaying(el, player);

		const container = document.createElement("div");
		const comp = createAdLearnMore(adState);
		comp.mount(container);
		comp.connect(player);

		player.emit("ad:start", { adId: "a1" });

		const btn = container.querySelector(".vide-ad-cta") as HTMLElement;
		expect(btn.style.display).not.toBe("none");

		// Clear ad state and emit ad:end
		adState.clear();
		player.emit("ad:end", { adId: "a1" });

		expect(btn.style.display).toBe("none");

		comp.destroy();
	});

	it("destroy removes DOM", () => {
		const adState = createAdUIState();
		const container = document.createElement("div");
		const comp = createAdLearnMore(adState);
		comp.mount(container);

		expect(container.querySelector(".vide-ad-cta")).not.toBeNull();

		comp.destroy();

		expect(container.querySelector(".vide-ad-cta")).toBeNull();
	});
});
