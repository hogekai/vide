import { render, screen } from "@testing-library/svelte";
import { tick } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../../src/core.js";
import AdSkipHost from "./AdSkipHost.svelte";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

describe("AdSkip", () => {
	it("renders nothing when no ad active", () => {
		const { player } = setup();

		render(AdSkipHost, {
			props: {
				getPlayer: () => player,
			},
		});

		expect(document.querySelector(".vide-skip")).toBeNull();

		player.destroy();
	});

	it("renders nothing when skipOffset is undefined", async () => {
		const { player } = setup();

		render(AdSkipHost, {
			props: {
				getPlayer: () => player,
			},
		});

		player.emit("ad:start", { adId: "ad-1" });
		await tick();

		expect(document.querySelector(".vide-skip")).toBeNull();

		player.destroy();
	});

	it("shows disabled button with countdown before skipOffset", async () => {
		const { player } = setup();

		render(AdSkipHost, {
			props: {
				getPlayer: () => player,
			},
		});

		player.emit("ad:start", {
			adId: "ad-1",
			skipOffset: 5,
			duration: 30,
		});
		await tick();

		player.emit("timeupdate", { currentTime: 2, duration: 30 });
		await tick();

		const button = screen.getByRole("button", { name: "Skip ad" });
		expect(button).toBeDefined();
		expect(button.hasAttribute("disabled")).toBe(true);
		expect(button.textContent).toContain("Skip in");

		player.destroy();
	});

	it("shows enabled button after skipOffset", async () => {
		const { player } = setup();

		render(AdSkipHost, {
			props: {
				getPlayer: () => player,
			},
		});

		player.emit("ad:start", {
			adId: "ad-1",
			skipOffset: 5,
			duration: 30,
		});
		await tick();

		player.emit("timeupdate", { currentTime: 6, duration: 30 });
		await tick();

		const button = screen.getByRole("button", { name: "Skip ad" });
		expect(button).toBeDefined();
		expect(button.hasAttribute("disabled")).toBe(false);
		expect(button.textContent).toContain("Skip Ad");

		player.destroy();
	});

	it("applies class prop", async () => {
		const { player } = setup();

		render(AdSkipHost, {
			props: {
				getPlayer: () => player,
				class: "my-class",
			},
		});

		player.emit("ad:start", {
			adId: "ad-1",
			skipOffset: 5,
			duration: 30,
		});
		await tick();

		player.emit("timeupdate", { currentTime: 2, duration: 30 });
		await tick();

		const button = screen.getByRole("button", { name: "Skip ad" });
		expect(button.className).toContain("my-class");

		player.destroy();
	});
});
