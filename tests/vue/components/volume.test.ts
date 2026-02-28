import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h, provide, shallowRef } from "vue";
import { createPlayer } from "../../../src/core.js";
import type { Player } from "../../../src/types.js";
import { VideVolume } from "../../../src/vue/components/volume.js";
import { VIDE_PLAYER_KEY } from "../../../src/vue/context.js";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	const playerRef = shallowRef<Player | null>(player);
	return { player, video, playerRef };
}

function mountVolume(playerRef: ReturnType<typeof shallowRef<Player | null>>) {
	const Parent = defineComponent({
		setup() {
			provide(VIDE_PLAYER_KEY, playerRef);
			return () => h(VideVolume);
		},
	});
	return mount(Parent);
}

describe("VideVolume", () => {
	it("renders a mute button and volume slider", () => {
		const { playerRef, player } = setup();
		const wrapper = mountVolume(playerRef);
		expect(wrapper.find("button").exists()).toBe(true);
		expect(wrapper.find("[role='slider']").exists()).toBe(true);
		expect(wrapper.find("button").attributes("aria-label")).toBe("Mute");
		player.destroy();
	});

	it("sets data-muted when muted", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountVolume(playerRef);

		player.muted = true;
		player.el.dispatchEvent(new Event("volumechange"));
		await wrapper.vm.$nextTick();

		expect(wrapper.find("div").attributes("data-muted")).toBe("true");
		player.destroy();
	});

	it("shows Unmute label when muted", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountVolume(playerRef);

		player.muted = true;
		player.el.dispatchEvent(new Event("volumechange"));
		await wrapper.vm.$nextTick();

		expect(wrapper.find("button").attributes("aria-label")).toBe("Unmute");
		player.destroy();
	});
});
