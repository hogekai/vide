import { describe, expect, it } from "vitest";
import { createAdLabel } from "../../src/ui/components/ad-label.js";

describe("createAdLabel", () => {
	it("mounts ad label with text", () => {
		const container = document.createElement("div");
		const comp = createAdLabel();
		comp.mount(container);
		const el = container.querySelector(".vide-ad-label");
		expect(el).not.toBeNull();
		expect(el?.textContent).toBe("Ad");
		comp.destroy();
	});

	it("destroy removes the element", () => {
		const container = document.createElement("div");
		const comp = createAdLabel();
		comp.mount(container);
		comp.destroy();
		expect(container.querySelector(".vide-ad-label")).toBeNull();
	});
});
