import { describe, expect, it } from "vitest";
import { createLoader } from "../../src/ui/components/loader.js";

describe("createLoader", () => {
	it("mounts loader DOM", () => {
		const container = document.createElement("div");
		const comp = createLoader();
		comp.mount(container);
		const loader = container.querySelector(".vide-loader");
		expect(loader).not.toBeNull();
		expect(container.querySelector(".vide-loader__spinner")).not.toBeNull();
		expect(loader?.getAttribute("role")).toBe("status");
		expect(loader?.getAttribute("aria-label")).toBe("Loading");
		comp.destroy();
	});

	it("destroy removes the element", () => {
		const container = document.createElement("div");
		const comp = createLoader();
		comp.mount(container);
		comp.destroy();
		expect(container.querySelector(".vide-loader")).toBeNull();
	});
});
