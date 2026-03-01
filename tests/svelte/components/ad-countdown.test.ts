import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../../src/core.js";
import AdCountdownHost from "./AdCountdownHost.svelte";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

describe("AdCountdown", () => {
	it("renders nothing when no ad active", () => {
		const { player } = setup();

		render(AdCountdownHost, {
			props: {
				getPlayer: () => player,
			},
		});

		expect(document.querySelector(".vide-ad-countdown")).toBeNull();

		player.destroy();
	});

	it("shows 'Ad \u00b7 Ns' format after ad:start + timeupdate", async () => {
		const { player } = setup();

		render(AdCountdownHost, {
			props: {
				getPlayer: () => player,
			},
		});

		player.emit("ad:start", {
			adId: "ad-1",
			duration: 30,
		});
		await tick();

		player.emit("timeupdate", { currentTime: 10, duration: 30 });
		await tick();

		const el = document.querySelector(".vide-ad-countdown");
		expect(el).not.toBeNull();
		expect(el!.textContent).toContain("Ad \u00b7 20s");

		player.destroy();
	});

	it("applies class prop", async () => {
		const { player } = setup();

		render(AdCountdownHost, {
			props: {
				getPlayer: () => player,
				class: "my-class",
			},
		});

		player.emit("ad:start", {
			adId: "ad-1",
			duration: 30,
		});
		await tick();

		const el = document.querySelector(".vide-ad-countdown");
		expect(el).not.toBeNull();
		expect(el!.className).toContain("my-class");

		player.destroy();
	});
});
