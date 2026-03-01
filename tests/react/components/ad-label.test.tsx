import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createPlayer } from "../../../src/core.js";
import { AdLabel } from "../../../src/react/components/ad-label.js";
import { VideContext } from "../../../src/react/context.js";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

describe("AdLabel", () => {
	it("renders nothing when no ad active", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdLabel />
			</VideContext.Provider>,
		);
		expect(container.querySelector(".vide-ad-label")).toBeNull();
		player.destroy();
	});

	it("shows 'Ad' text when ad:start fires", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdLabel />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1" });
		});

		const el = container.querySelector(".vide-ad-label");
		expect(el?.textContent).toBe("Ad");
		player.destroy();
	});

	it("hidden when ad:end fires", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdLabel />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1" });
		});
		expect(container.querySelector(".vide-ad-label")).not.toBeNull();

		act(() => {
			player.emit("ad:end", { adId: "a1" });
		});
		expect(container.querySelector(".vide-ad-label")).toBeNull();
		player.destroy();
	});

	it("applies className prop", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdLabel className="custom" />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1" });
		});

		const el = container.querySelector(".vide-ad-label");
		expect(el?.className).toBe("vide-ad-label custom");
		player.destroy();
	});

	it("renders children as custom text", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdLabel>
					<span data-testid="custom">Advertisement</span>
				</AdLabel>
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1" });
		});

		expect(screen.getByTestId("custom").textContent).toBe("Advertisement");
		player.destroy();
	});
});
