import { act, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createPlayer } from "../../../src/core.js";
import { AdCountdown } from "../../../src/react/components/ad-countdown.js";
import { VideContext } from "../../../src/react/context.js";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

describe("AdCountdown", () => {
	it("renders nothing when no ad active", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdCountdown />
			</VideContext.Provider>,
		);
		expect(container.querySelector(".vide-ad-countdown")).toBeNull();
		player.destroy();
	});

	it("shows 'Ad \u00b7 Ns' format", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdCountdown />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1", duration: 30 });
		});

		act(() => {
			player.emit("timeupdate", { currentTime: 10, duration: 30 });
		});

		const el = container.querySelector(".vide-ad-countdown");
		expect(el?.textContent).toBe("Ad \u00b7 20s");
		player.destroy();
	});

	it("updates remaining on timeupdate", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdCountdown />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1", duration: 30 });
		});

		act(() => {
			player.emit("timeupdate", { currentTime: 10, duration: 30 });
		});

		expect(container.querySelector(".vide-ad-countdown")?.textContent).toBe(
			"Ad \u00b7 20s",
		);

		act(() => {
			player.emit("timeupdate", { currentTime: 25, duration: 30 });
		});

		expect(container.querySelector(".vide-ad-countdown")?.textContent).toBe(
			"Ad \u00b7 5s",
		);
		player.destroy();
	});

	it("applies className prop", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdCountdown className="custom" />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1", duration: 30 });
		});

		const el = container.querySelector(".vide-ad-countdown");
		expect(el?.className).toBe("vide-ad-countdown custom");
		player.destroy();
	});

	it("uses custom format function when provided", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdCountdown format={(r) => `${r} seconds left`} />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1", duration: 30 });
		});

		act(() => {
			player.emit("timeupdate", { currentTime: 10, duration: 30 });
		});

		const el = container.querySelector(".vide-ad-countdown");
		expect(el?.textContent).toBe("20 seconds left");
		player.destroy();
	});
});
