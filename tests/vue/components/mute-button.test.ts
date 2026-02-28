import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, provide, shallowRef } from "vue";
import { createPlayer } from "../../../src/core.js";
import type { Player } from "../../../src/types.js";
import { VideMuteButton } from "../../../src/vue/components/mute-button.js";
import { VIDE_PLAYER_KEY } from "../../../src/vue/context.js";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	const playerRef = shallowRef<Player | null>(player);
	return { player, video, playerRef };
}

function mountMuteButton(
	playerRef: ReturnType<typeof shallowRef<Player | null>>,
) {
	const Parent = defineComponent({
		setup() {
			provide(VIDE_PLAYER_KEY, playerRef);
			return () => h(VideMuteButton);
		},
	});
	return mount(Parent);
}

describe("VideMuteButton", () => {
	it("renders with Mute label initially", () => {
		const { playerRef, player } = setup();
		const wrapper = mountMuteButton(playerRef);
		expect(wrapper.find("button").attributes("aria-label")).toBe("Mute");
		player.destroy();
	});

	it("toggles muted on click", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountMuteButton(playerRef);

		player.muted = true;
		player.el.dispatchEvent(new Event("volumechange"));
		await wrapper.vm.$nextTick();

		expect(wrapper.find("button").attributes("aria-label")).toBe("Unmute");

		player.destroy();
	});

	it("sets data-muted attribute when muted", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountMuteButton(playerRef);

		expect(wrapper.find("button").attributes("data-muted")).toBeUndefined();

		player.muted = true;
		player.el.dispatchEvent(new Event("volumechange"));
		await wrapper.vm.$nextTick();

		expect(wrapper.find("button").attributes("data-muted")).toBe("true");

		player.destroy();
	});
});
