import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../../src/core.js";
import AdLabelHost from "./AdLabelHost.svelte";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

describe("AdLabel", () => {
	it("renders nothing when no ad active", () => {
		const { player } = setup();

		render(AdLabelHost, {
			props: {
				getPlayer: () => player,
			},
		});

		expect(document.querySelector(".vide-ad-label")).toBeNull();

		player.destroy();
	});

	it("shows 'Ad' text when ad:start fires", async () => {
		const { player } = setup();

		render(AdLabelHost, {
			props: {
				getPlayer: () => player,
			},
		});

		player.emit("ad:start", { adId: "ad-1" });
		await tick();

		const el = document.querySelector(".vide-ad-label");
		expect(el).not.toBeNull();
		expect(el!.textContent?.trim()).toBe("Ad");

		player.destroy();
	});

	it("hidden when ad:end fires", async () => {
		const { player } = setup();

		render(AdLabelHost, {
			props: {
				getPlayer: () => player,
			},
		});

		player.emit("ad:start", { adId: "ad-1" });
		await tick();
		expect(document.querySelector(".vide-ad-label")).not.toBeNull();

		player.emit("ad:end", { adId: "ad-1" });
		await tick();
		expect(document.querySelector(".vide-ad-label")).toBeNull();

		player.destroy();
	});

	it("applies class prop", async () => {
		const { player } = setup();

		render(AdLabelHost, {
			props: {
				getPlayer: () => player,
				class: "my-class",
			},
		});

		player.emit("ad:start", { adId: "ad-1" });
		await tick();

		const el = document.querySelector(".vide-ad-label");
		expect(el).not.toBeNull();
		expect(el!.className).toContain("my-class");

		player.destroy();
	});
});
