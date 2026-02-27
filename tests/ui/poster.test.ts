import { describe, expect, it } from "vitest";
import { createPoster } from "../../src/ui/components/poster.js";

describe("createPoster", () => {
	it("mounts poster DOM with image", () => {
		const container = document.createElement("div");
		const comp = createPoster({ src: "poster.jpg" });
		comp.mount(container);
		expect(container.querySelector(".vide-poster")).not.toBeNull();
		const img = container.querySelector<HTMLImageElement>(
			".vide-poster__image",
		);
		expect(img).not.toBeNull();
		expect(img?.src).toContain("poster.jpg");
		comp.destroy();
	});

	it("destroy removes the element", () => {
		const container = document.createElement("div");
		const comp = createPoster({ src: "poster.jpg" });
		comp.mount(container);
		comp.destroy();
		expect(container.querySelector(".vide-poster")).toBeNull();
	});
});
