import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../../src/core.js";
import { AdSkip } from "../../../src/react/components/ad-skip.js";
import { VideContext } from "../../../src/react/context.js";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

describe("AdSkip", () => {
	it("renders nothing when no ad active", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdSkip />
			</VideContext.Provider>,
		);
		expect(container.querySelector(".vide-skip")).toBeNull();
		player.destroy();
	});

	it("renders nothing when skipOffset is undefined", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdSkip />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1" });
		});

		expect(container.querySelector(".vide-skip")).toBeNull();
		player.destroy();
	});

	it("shows 'Skip in Ns' before skipOffset reached", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdSkip />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1", skipOffset: 5 });
		});

		act(() => {
			player.emit("timeupdate", { currentTime: 2, duration: 30 });
		});

		const btn = container.querySelector(".vide-skip");
		expect(btn?.textContent).toBe("Skip in 3s");
		player.destroy();
	});

	it("shows 'Skip Ad' after skipOffset reached", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdSkip />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1", skipOffset: 5 });
		});

		act(() => {
			player.emit("timeupdate", { currentTime: 5, duration: 30 });
		});

		const btn = container.querySelector(".vide-skip");
		expect(btn?.textContent).toBe("Skip Ad");
		player.destroy();
	});

	it("button is disabled before skipOffset", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdSkip />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1", skipOffset: 5 });
		});

		act(() => {
			player.emit("timeupdate", { currentTime: 2, duration: 30 });
		});

		const btn = container.querySelector(".vide-skip") as HTMLButtonElement;
		expect(btn.disabled).toBe(true);
		player.destroy();
	});

	it("button click emits ad:skip when can skip", () => {
		const { player } = setup();
		const skipHandler = vi.fn();
		player.on("ad:skip", skipHandler);

		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdSkip />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1", skipOffset: 5 });
		});

		act(() => {
			player.emit("timeupdate", { currentTime: 6, duration: 30 });
		});

		fireEvent.click(container.querySelector(".vide-skip")!);

		expect(skipHandler).toHaveBeenCalledWith({ adId: "a1" });
		player.destroy();
	});

	it("applies className prop", () => {
		const { player } = setup();
		const { container } = render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdSkip className="custom" />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1", skipOffset: 5 });
		});

		act(() => {
			player.emit("timeupdate", { currentTime: 2, duration: 30 });
		});

		const btn = container.querySelector(".vide-skip");
		expect(btn?.className).toContain("custom");
		player.destroy();
	});

	it("renders children as custom text when canSkip", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<AdSkip>
					<span data-testid="custom">Close</span>
				</AdSkip>
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "a1", skipOffset: 5 });
		});

		act(() => {
			player.emit("timeupdate", { currentTime: 6, duration: 30 });
		});

		expect(screen.getByTestId("custom").textContent).toBe("Close");
		player.destroy();
	});
});
