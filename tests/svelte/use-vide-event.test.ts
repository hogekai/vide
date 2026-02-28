import { render } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import type { Player } from "../../src/types.js";
import UseEventHost from "./UseEventHost.svelte";

function makePlayer() {
	return createPlayer(document.createElement("video"));
}

describe("useVideEvent", () => {
	it("subscribes to player event", () => {
		const player = makePlayer();
		const handler = vi.fn();

		render(UseEventHost, {
			props: {
				getPlayer: () => player,
				event: "play",
				handler,
			},
		});

		player.emit("play", undefined as any);
		expect(handler).toHaveBeenCalledOnce();

		player.destroy();
	});

	it("does nothing when player is null", () => {
		const handler = vi.fn();

		render(UseEventHost, {
			props: {
				getPlayer: () => null,
				event: "play",
				handler,
			},
		});

		expect(handler).not.toHaveBeenCalled();
	});

	it("unsubscribes on unmount", () => {
		const player = makePlayer();
		const handler = vi.fn();

		const { unmount } = render(UseEventHost, {
			props: {
				getPlayer: () => player,
				event: "play",
				handler,
			},
		});

		unmount();

		player.emit("play", undefined as any);
		expect(handler).not.toHaveBeenCalled();

		player.destroy();
	});
});
