import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../../src/core.js";
import { AdLearnMore } from "../../../src/react/components/ad-learn-more.js";
import { VideContext } from "../../../src/react/context.js";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

describe("AdLearnMore", () => {
	it("renders nothing when no ad active", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdLearnMore />
			</VideContext.Provider>,
		);
		expect(container.querySelector(".vide-ad-cta")).toBeNull();
		player.destroy();
	});

	it("renders nothing when clickThrough is undefined", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdLearnMore />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1" });
		});

		expect(container.querySelector(".vide-ad-cta")).toBeNull();
		player.destroy();
	});

	it("renders button when clickThrough exists", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdLearnMore />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", {
				adId: "a1",
				clickThrough: "https://example.com",
			});
		});

		expect(container.querySelector(".vide-ad-cta")).not.toBeNull();
		player.destroy();
	});

	it("shows hostname in default content", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdLearnMore />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", {
				adId: "a1",
				clickThrough: "https://example.com",
			});
		});

		const urlEl = container.querySelector(".vide-ad-cta__url");
		expect(urlEl?.textContent).toBe("example.com");
		player.destroy();
	});

	it("renders children as custom text", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdLearnMore>
					<span data-testid="custom">Visit Site</span>
				</AdLearnMore>
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", {
				adId: "a1",
				clickThrough: "https://example.com",
			});
		});

		expect(screen.getByTestId("custom").textContent).toBe("Visit Site");
		player.destroy();
	});

	it("on click: calls player.el.click(), window.open(), player.el.pause()", () => {
		const { player } = setup();
		const clickSpy = vi.spyOn(player.el, "click");
		const pauseSpy = vi.spyOn(player.el, "pause");
		const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdLearnMore />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", {
				adId: "a1",
				clickThrough: "https://example.com",
			});
		});

		fireEvent.click(container.querySelector(".vide-ad-cta")!);

		expect(clickSpy).toHaveBeenCalledOnce();
		expect(openSpy).toHaveBeenCalledWith("https://example.com", "_blank");
		expect(pauseSpy).toHaveBeenCalledOnce();

		openSpy.mockRestore();
		player.destroy();
	});

	it("shows ad title when adTitle is available", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdLearnMore />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", {
				adId: "a1",
				clickThrough: "https://example.com",
				adTitle: "Great Product",
			});
		});

		const titleEl = container.querySelector(".vide-ad-cta__title");
		expect(titleEl?.textContent).toBe("Great Product");
		player.destroy();
	});

	it("applies className prop", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdLearnMore className="custom" />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", {
				adId: "a1",
				clickThrough: "https://example.com",
			});
		});

		const btn = container.querySelector(".vide-ad-cta");
		expect(btn?.className).toBe("vide-ad-cta custom");
		player.destroy();
	});
});
