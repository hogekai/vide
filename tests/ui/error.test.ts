import { describe, expect, it } from "vitest";
import { createPlayer } from "../../src/core.js";
import { createErrorDisplay } from "../../src/ui/components/error.js";

function makeVideo(): HTMLVideoElement {
	return document.createElement("video");
}

describe("createErrorDisplay", () => {
	it("mounts error display DOM", () => {
		const container = document.createElement("div");
		const comp = createErrorDisplay();
		comp.mount(container);
		expect(container.querySelector(".vide-error")).not.toBeNull();
		expect(container.querySelector(".vide-error__message")).not.toBeNull();
		comp.destroy();
	});

	it("updates message on error event", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");
		const comp = createErrorDisplay();
		comp.mount(container);
		comp.connect(player);

		player.emit("error", { code: 4, message: "Media not supported" });

		expect(container.querySelector(".vide-error__message")?.textContent).toBe(
			"Media not supported",
		);
		comp.destroy();
	});

	it("destroy removes the element", () => {
		const container = document.createElement("div");
		const comp = createErrorDisplay();
		comp.mount(container);
		comp.destroy();
		expect(container.querySelector(".vide-error")).toBeNull();
	});
});
