import { render, screen } from "@testing-library/svelte";
import { tick } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../../src/core.js";
import AdOverlayHost from "./AdOverlayHost.svelte";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

describe("AdOverlay", () => {
	it("renders nothing when no ad active", () => {
		const { player } = setup();

		render(AdOverlayHost, {
			props: {
				getPlayer: () => player,
			},
		});

		expect(document.querySelector(".vide-ad-overlay")).toBeNull();

		player.destroy();
	});

	it("renders overlay div when ad:start fires", async () => {
		const { player } = setup();

		render(AdOverlayHost, {
			props: {
				getPlayer: () => player,
			},
		});

		player.emit("ad:start", {
			adId: "ad-1",
			clickThrough: "https://example.com",
		});
		await tick();

		expect(document.querySelector(".vide-ad-overlay")).not.toBeNull();

		player.destroy();
	});

	it("hidden when ad:end fires", async () => {
		const { player } = setup();

		render(AdOverlayHost, {
			props: {
				getPlayer: () => player,
			},
		});

		player.emit("ad:start", { adId: "ad-1" });
		await tick();
		expect(document.querySelector(".vide-ad-overlay")).not.toBeNull();

		player.emit("ad:end", { adId: "ad-1" });
		await tick();
		expect(document.querySelector(".vide-ad-overlay")).toBeNull();

		player.destroy();
	});

	it("applies class prop", async () => {
		const { player } = setup();

		render(AdOverlayHost, {
			props: {
				getPlayer: () => player,
				class: "my-class",
			},
		});

		player.emit("ad:start", { adId: "ad-1" });
		await tick();

		const el = document.querySelector(".vide-ad-overlay");
		expect(el).not.toBeNull();
		expect(el!.className).toContain("my-class");

		player.destroy();
	});

	it("calls window.open when clickThrough exists on click", async () => {
		const { player } = setup();
		const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

		render(AdOverlayHost, {
			props: {
				getPlayer: () => player,
			},
		});

		player.emit("ad:start", {
			adId: "ad-1",
			clickThrough: "https://example.com",
		});
		await tick();

		const overlay = document.querySelector(".vide-ad-overlay") as HTMLElement;
		overlay.click();

		expect(openSpy).toHaveBeenCalledWith("https://example.com", "_blank");

		openSpy.mockRestore();
		player.destroy();
	});
});
