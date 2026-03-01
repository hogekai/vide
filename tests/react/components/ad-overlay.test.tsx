import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../../src/core.js";
import { AdOverlay } from "../../../src/react/components/ad-overlay.js";
import { VideContext } from "../../../src/react/context.js";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

describe("AdOverlay", () => {
	it("renders nothing when no ad active", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdOverlay />
			</VideContext.Provider>,
		);
		expect(container.querySelector(".vide-ad-overlay")).toBeNull();
		player.destroy();
	});

	it("renders overlay when ad:start fires", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdOverlay />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1" });
		});

		expect(container.querySelector(".vide-ad-overlay")).not.toBeNull();
		player.destroy();
	});

	it("hidden when ad:end fires", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdOverlay />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1" });
		});
		expect(container.querySelector(".vide-ad-overlay")).not.toBeNull();

		act(() => {
			player.emit("ad:end", { adId: "a1" });
		});
		expect(container.querySelector(".vide-ad-overlay")).toBeNull();
		player.destroy();
	});

	it("hidden when ad:skip fires", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdOverlay />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1" });
		});
		expect(container.querySelector(".vide-ad-overlay")).not.toBeNull();

		act(() => {
			player.emit("ad:skip", { adId: "a1" });
		});
		expect(container.querySelector(".vide-ad-overlay")).toBeNull();
		player.destroy();
	});

	it("applies className prop", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdOverlay className="custom" />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1" });
		});

		const el = container.querySelector(".vide-ad-overlay");
		expect(el?.className).toBe("vide-ad-overlay custom");
		player.destroy();
	});

	it("renders children content", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdOverlay>
					<span data-testid="child">Click here</span>
				</AdOverlay>
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1" });
		});

		expect(screen.getByTestId("child").textContent).toBe("Click here");
		player.destroy();
	});

	it("on click: calls player.el.click(), window.open(), player.el.pause() when clickThrough exists", () => {
		const { player } = setup();
		const clickSpy = vi.spyOn(player.el, "click");
		const pauseSpy = vi.spyOn(player.el, "pause");
		const openSpy = vi
			.spyOn(window, "open")
			.mockImplementation(() => null);

		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdOverlay />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", {
				adId: "a1",
				clickThrough: "https://example.com",
			});
		});

		fireEvent.click(container.querySelector(".vide-ad-overlay")!);

		expect(clickSpy).toHaveBeenCalledOnce();
		expect(openSpy).toHaveBeenCalledWith("https://example.com", "_blank");
		expect(pauseSpy).toHaveBeenCalledOnce();

		openSpy.mockRestore();
		player.destroy();
	});

	it("on click without clickThrough: toggles play/pause", () => {
		const { player } = setup();
		const pauseSpy = vi.spyOn(player.el, "pause");
		const playSpy = vi
			.spyOn(player.el, "play")
			.mockImplementation(() => Promise.resolve());

		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdOverlay />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1" });
		});

		// video.paused is true by default, so clicking should call play
		fireEvent.click(container.querySelector(".vide-ad-overlay")!);
		expect(playSpy).toHaveBeenCalledOnce();

		player.destroy();
	});
});
