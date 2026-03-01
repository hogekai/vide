import { render, screen } from "@testing-library/svelte";
import { tick } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../../src/core.js";
import AdLearnMoreHost from "./AdLearnMoreHost.svelte";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

describe("AdLearnMore", () => {
	it("renders nothing when no ad active", () => {
		const { player } = setup();

		render(AdLearnMoreHost, {
			props: {
				getPlayer: () => player,
			},
		});

		expect(document.querySelector(".vide-ad-cta")).toBeNull();

		player.destroy();
	});

	it("renders nothing when clickThrough is undefined", async () => {
		const { player } = setup();

		render(AdLearnMoreHost, {
			props: {
				getPlayer: () => player,
			},
		});

		player.emit("ad:start", { adId: "ad-1" });
		await tick();

		expect(document.querySelector(".vide-ad-cta")).toBeNull();

		player.destroy();
	});

	it("renders button when clickThrough exists", async () => {
		const { player } = setup();

		render(AdLearnMoreHost, {
			props: {
				getPlayer: () => player,
			},
		});

		player.emit("ad:start", {
			adId: "ad-1",
			clickThrough: "https://example.com",
		});
		await tick();

		expect(document.querySelector(".vide-ad-cta")).not.toBeNull();

		player.destroy();
	});

	it("shows hostname as default text", async () => {
		const { player } = setup();

		render(AdLearnMoreHost, {
			props: {
				getPlayer: () => player,
			},
		});

		player.emit("ad:start", {
			adId: "ad-1",
			clickThrough: "https://example.com",
		});
		await tick();

		const url = document.querySelector(".vide-ad-cta__url");
		expect(url).not.toBeNull();
		expect(url!.textContent).toBe("example.com");

		player.destroy();
	});

	it("calls window.open on click", async () => {
		const { player } = setup();
		const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

		render(AdLearnMoreHost, {
			props: {
				getPlayer: () => player,
			},
		});

		player.emit("ad:start", {
			adId: "ad-1",
			clickThrough: "https://example.com",
		});
		await tick();

		const button = document.querySelector(".vide-ad-cta") as HTMLElement;
		button.click();

		expect(openSpy).toHaveBeenCalledWith("https://example.com", "_blank");

		openSpy.mockRestore();
		player.destroy();
	});

	it("shows ad title when adTitle is available", async () => {
		const { player } = setup();

		render(AdLearnMoreHost, {
			props: {
				getPlayer: () => player,
			},
		});

		player.emit("ad:start", {
			adId: "ad-1",
			clickThrough: "https://example.com",
			adTitle: "My Ad Title",
		});
		await tick();

		const title = document.querySelector(".vide-ad-cta__title");
		expect(title).not.toBeNull();
		expect(title!.textContent).toBe("My Ad Title");

		player.destroy();
	});

	it("applies class prop", async () => {
		const { player } = setup();

		render(AdLearnMoreHost, {
			props: {
				getPlayer: () => player,
				class: "my-class",
			},
		});

		player.emit("ad:start", {
			adId: "ad-1",
			clickThrough: "https://example.com",
		});
		await tick();

		const el = document.querySelector(".vide-ad-cta");
		expect(el).not.toBeNull();
		expect(el!.className).toContain("my-class");

		player.destroy();
	});
});
