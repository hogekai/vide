import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createPlayer } from "../../src/core.js";
import { VideContext } from "../../src/react/context.js";
import { useAdState } from "../../src/react/use-ad-state.js";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	return { player, video };
}

function TestComponent({
	player,
}: { player: ReturnType<typeof createPlayer> }) {
	const state = useAdState(player);
	return <div data-testid="state">{JSON.stringify(state)}</div>;
}

describe("useAdState", () => {
	it("returns { active: false, meta: null } initially", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<TestComponent player={player} />
			</VideContext.Provider>,
		);

		const state = JSON.parse(screen.getByTestId("state").textContent!);
		expect(state.active).toBe(false);
		expect(state.meta).toBeNull();
		player.destroy();
	});

	it("returns active: true and populated meta after ad:start", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<TestComponent player={player} />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", {
				adId: "ad-1",
				clickThrough: "https://example.com",
				skipOffset: 5,
				duration: 30,
				adTitle: "Test Ad",
			});
		});

		const state = JSON.parse(screen.getByTestId("state").textContent!);
		expect(state.active).toBe(true);
		expect(state.meta.adId).toBe("ad-1");
		expect(state.meta.clickThrough).toBe("https://example.com");
		expect(state.meta.skipOffset).toBe(5);
		expect(state.meta.duration).toBe(30);
		expect(state.meta.adTitle).toBe("Test Ad");
		player.destroy();
	});

	it("returns active: false and meta: null after ad:end", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<TestComponent player={player} />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "ad-1" });
		});

		act(() => {
			player.emit("ad:end", { adId: "ad-1" });
		});

		const state = JSON.parse(screen.getByTestId("state").textContent!);
		expect(state.active).toBe(false);
		expect(state.meta).toBeNull();
		player.destroy();
	});

	it("returns active: false and meta: null after ad:skip", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<TestComponent player={player} />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", { adId: "ad-1" });
		});

		act(() => {
			player.emit("ad:skip", { adId: "ad-1" });
		});

		const state = JSON.parse(screen.getByTestId("state").textContent!);
		expect(state.active).toBe(false);
		expect(state.meta).toBeNull();
		player.destroy();
	});

	it("meta contains adId, clickThrough, skipOffset, duration, adTitle, adStartTime", () => {
		const { player } = setup();
		render(
			<VideContext.Provider value={{ player, registerEl: () => {} }}>
				<TestComponent player={player} />
			</VideContext.Provider>,
		);

		act(() => {
			player.emit("ad:start", {
				adId: "ad-2",
				clickThrough: "https://example.com",
				skipOffset: 10,
				duration: 60,
				adTitle: "Product Ad",
			});
		});

		const state = JSON.parse(screen.getByTestId("state").textContent!);
		expect(state.meta).toHaveProperty("adId", "ad-2");
		expect(state.meta).toHaveProperty("clickThrough", "https://example.com");
		expect(state.meta).toHaveProperty("skipOffset", 10);
		expect(state.meta).toHaveProperty("duration", 60);
		expect(state.meta).toHaveProperty("adTitle", "Product Ad");
		expect(state.meta).toHaveProperty("adStartTime");
		expect(typeof state.meta.adStartTime).toBe("number");
		player.destroy();
	});
});
