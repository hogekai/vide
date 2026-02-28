import { describe, expect, it } from "vitest";
import { createPlayer } from "../../src/core.js";
import { ui } from "../../src/ui/index.js";

function makeVideo(): HTMLVideoElement {
	return document.createElement("video");
}

describe("ui() convenience plugin", () => {
	it("creates vide-ui root inside container", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");

		player.use(ui({ container }));
		expect(container.querySelector(".vide-ui")).not.toBeNull();
		player.destroy();
	});

	it("creates all default components", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");

		player.use(ui({ container }));
		const root = container.querySelector(".vide-ui") as Element;

		// Controls
		expect(root.querySelector(".vide-play")).not.toBeNull();
		expect(root.querySelector(".vide-progress")).not.toBeNull();
		expect(root.querySelector(".vide-time")).not.toBeNull();
		expect(root.querySelector(".vide-volume")).not.toBeNull();
		expect(root.querySelector(".vide-fullscreen")).not.toBeNull();

		// Overlays
		expect(root.querySelector(".vide-loader")).not.toBeNull();
		expect(root.querySelector(".vide-error")).not.toBeNull();
		expect(root.querySelector(".vide-bigplay")).not.toBeNull();

		// Ad
		expect(root.querySelector(".vide-ad")).not.toBeNull();
		expect(root.querySelector(".vide-ad-overlay")).not.toBeNull();
		expect(root.querySelector(".vide-ad-label")).not.toBeNull();
		expect(root.querySelector(".vide-ad-countdown")).not.toBeNull();
		expect(root.querySelector(".vide-skip")).not.toBeNull();

		player.destroy();
	});

	it("excludes specified components", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");

		player.use(ui({ container, exclude: ["ad-skip", "error", "poster"] }));
		const root = container.querySelector(".vide-ui") as Element;

		expect(root.querySelector(".vide-skip")).toBeNull();
		expect(root.querySelector(".vide-error")).toBeNull();
		expect(root.querySelector(".vide-poster")).toBeNull();

		// Others still present
		expect(root.querySelector(".vide-play")).not.toBeNull();
		expect(root.querySelector(".vide-progress")).not.toBeNull();

		player.destroy();
	});

	it("does not create poster without poster option", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");

		player.use(ui({ container }));
		expect(container.querySelector(".vide-poster")).toBeNull();

		player.destroy();
	});

	it("creates poster with poster option", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");

		player.use(ui({ container, poster: "poster.jpg" }));
		expect(container.querySelector(".vide-poster")).not.toBeNull();

		player.destroy();
	});

	it("adds initial state class on root", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");

		player.use(ui({ container }));
		const root = container.querySelector(".vide-ui") as Element;
		expect(root.classList.contains("vide-ui--idle")).toBe(true);

		player.destroy();
	});

	it("updates state class on transition", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");

		player.use(ui({ container }));
		const root = container.querySelector(".vide-ui") as Element;

		el.dispatchEvent(new Event("loadstart"));
		expect(root.classList.contains("vide-ui--loading")).toBe(true);
		expect(root.classList.contains("vide-ui--idle")).toBe(false);

		player.destroy();
	});

	it("destroy removes all DOM", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");

		player.use(ui({ container }));
		expect(container.querySelector(".vide-ui")).not.toBeNull();

		player.destroy();
		expect(container.querySelector(".vide-ui")).toBeNull();
	});

	it("getAdPlugin returns a function", () => {
		const uiPlugin = ui({
			container: document.createElement("div"),
		});
		const adPlugins = uiPlugin.getAdPlugin();
		expect(typeof adPlugins).toBe("function");
	});

	it("DOM structure follows expected hierarchy", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");

		player.use(ui({ container }));
		const root = container.querySelector(".vide-ui") as Element;

		// Controls bar is a direct child of root
		const controls = root.querySelector(":scope > .vide-controls");
		expect(controls).not.toBeNull();

		// Ad container is a direct child of root
		const ad = root.querySelector(":scope > .vide-ad");
		expect(ad).not.toBeNull();

		// Play button is inside controls
		expect(controls?.querySelector(".vide-play")).not.toBeNull();

		// Ad components are inside ad container
		expect(ad?.querySelector(".vide-ad-overlay")).not.toBeNull();
		expect(ad?.querySelector(".vide-skip")).not.toBeNull();

		player.destroy();
	});
});

describe("audio element auto-exclusion", () => {
	function makeAudio(): HTMLAudioElement {
		return document.createElement("audio");
	}

	it("auto-excludes fullscreen for audio elements", () => {
		const el = makeAudio();
		const player = createPlayer(el);
		const container = document.createElement("div");

		player.use(ui({ container }));
		const root = container.querySelector(".vide-ui") as Element;
		expect(root.querySelector(".vide-fullscreen")).toBeNull();
		player.destroy();
	});

	it("auto-excludes poster for audio elements", () => {
		const el = makeAudio();
		const player = createPlayer(el);
		const container = document.createElement("div");

		player.use(ui({ container, poster: "poster.jpg" }));
		const root = container.querySelector(".vide-ui") as Element;
		expect(root.querySelector(".vide-poster")).toBeNull();
		player.destroy();
	});

	it("sets aria-label to 'Audio player' for audio elements", () => {
		const el = makeAudio();
		const player = createPlayer(el);
		const container = document.createElement("div");

		player.use(ui({ container }));
		const root = container.querySelector(".vide-ui") as Element;
		expect(root.getAttribute("aria-label")).toBe("Audio player");
		player.destroy();
	});

	it("keeps other components for audio elements", () => {
		const el = makeAudio();
		const player = createPlayer(el);
		const container = document.createElement("div");

		player.use(ui({ container }));
		const root = container.querySelector(".vide-ui") as Element;
		expect(root.querySelector(".vide-play")).not.toBeNull();
		expect(root.querySelector(".vide-progress")).not.toBeNull();
		expect(root.querySelector(".vide-volume")).not.toBeNull();
		expect(root.querySelector(".vide-time")).not.toBeNull();
		player.destroy();
	});

	it("does not auto-exclude fullscreen for video elements", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");

		player.use(ui({ container }));
		const root = container.querySelector(".vide-ui") as Element;
		expect(root.querySelector(".vide-fullscreen")).not.toBeNull();
		player.destroy();
	});
});
