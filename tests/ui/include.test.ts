import { describe, expect, it } from "vitest";
import { createPlayer } from "../../src/core.js";
import { ui } from "../../src/ui/index.js";

function makeVideo(): HTMLVideoElement {
	return document.createElement("video");
}

describe("ui() include option", () => {
	it("ad-learn-more excluded by default", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");

		player.use(ui({ container }));
		const root = container.querySelector(".vide-ui") as Element;
		expect(root.querySelector(".vide-ad-cta")).toBeNull();

		player.destroy();
	});

	it("ad-learn-more included with include option", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");

		player.use(ui({ container, include: ["ad-learn-more"] }));
		const root = container.querySelector(".vide-ui") as Element;
		expect(root.querySelector(".vide-ad-cta")).not.toBeNull();

		player.destroy();
	});

	it("exclude takes precedence over include", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");

		player.use(
			ui({
				container,
				include: ["ad-learn-more"],
				exclude: ["ad-learn-more"],
			}),
		);
		const root = container.querySelector(".vide-ui") as Element;
		expect(root.querySelector(".vide-ad-cta")).toBeNull();

		player.destroy();
	});

	it("other components still work normally", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");

		player.use(ui({ container }));
		const root = container.querySelector(".vide-ui") as Element;
		expect(root.querySelector(".vide-play")).not.toBeNull();

		player.destroy();
	});
});
