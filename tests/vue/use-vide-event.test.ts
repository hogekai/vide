import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, shallowRef } from "vue";
import { createPlayer } from "../../src/core.js";
import { useVideEvent } from "../../src/vue/use-vide-event.js";

function makePlayer() {
	return createPlayer(document.createElement("video"));
}

describe("useVideEvent", () => {
	it("subscribes to player event", async () => {
		const player = makePlayer();
		const playerRef = shallowRef(player);
		const handler = vi.fn();

		const Comp = defineComponent({
			setup() {
				useVideEvent(playerRef, "play", handler);
				return () => null;
			},
		});

		mount(Comp);

		player.emit("play", undefined);
		expect(handler).toHaveBeenCalledOnce();

		player.destroy();
	});

	it("does nothing when player is null", () => {
		const playerRef = shallowRef(null);
		const handler = vi.fn();

		const Comp = defineComponent({
			setup() {
				useVideEvent(playerRef, "play", handler);
				return () => null;
			},
		});

		mount(Comp);
		expect(handler).not.toHaveBeenCalled();
	});

	it("unsubscribes on unmount", () => {
		const player = makePlayer();
		const playerRef = shallowRef(player);
		const handler = vi.fn();

		const Comp = defineComponent({
			setup() {
				useVideEvent(playerRef, "play", handler);
				return () => null;
			},
		});

		const wrapper = mount(Comp);
		wrapper.unmount();

		player.emit("play", undefined);
		expect(handler).not.toHaveBeenCalled();

		player.destroy();
	});

	it("subscribes when player becomes available", async () => {
		const playerRef = shallowRef<ReturnType<typeof makePlayer> | null>(null);
		const handler = vi.fn();

		const Comp = defineComponent({
			setup() {
				useVideEvent(playerRef, "play", handler);
				return () => null;
			},
		});

		mount(Comp);

		const player = makePlayer();
		playerRef.value = player;
		await nextTick();

		player.emit("play", undefined);
		expect(handler).toHaveBeenCalledOnce();

		player.destroy();
	});

	it("unsubscribes from old player when player changes", async () => {
		const player1 = makePlayer();
		const player2 = makePlayer();
		const playerRef = shallowRef(player1);
		const handler = vi.fn();

		const Comp = defineComponent({
			setup() {
				useVideEvent(playerRef, "play", handler);
				return () => null;
			},
		});

		mount(Comp);

		playerRef.value = player2;
		await nextTick();

		// Old player should not trigger handler
		player1.emit("play", undefined);
		expect(handler).not.toHaveBeenCalled();

		// New player should trigger handler
		player2.emit("play", undefined);
		expect(handler).toHaveBeenCalledOnce();

		player1.destroy();
		player2.destroy();
	});
});
