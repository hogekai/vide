import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h, provide, shallowRef } from "vue";
import { createPlayer } from "../../../src/core.js";
import type { Player } from "../../../src/types.js";
import { VideFullscreenButton } from "../../../src/vue/components/fullscreen.js";
import { VIDE_PLAYER_KEY } from "../../../src/vue/context.js";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	const playerRef = shallowRef<Player | null>(player);
	return { player, video, playerRef };
}

function mountFullscreen(
	playerRef: ReturnType<typeof shallowRef<Player | null>>,
) {
	const Parent = defineComponent({
		setup() {
			provide(VIDE_PLAYER_KEY, playerRef);
			return () => h(VideFullscreenButton);
		},
	});
	return mount(Parent);
}

describe("VideFullscreenButton", () => {
	it("renders with Fullscreen label", () => {
		const { playerRef, player } = setup();
		const wrapper = mountFullscreen(playerRef);
		expect(wrapper.find("button").attributes("aria-label")).toBe("Fullscreen");
		player.destroy();
	});

	it("does not set data-fullscreen initially", () => {
		const { playerRef, player } = setup();
		const wrapper = mountFullscreen(playerRef);
		expect(
			wrapper.find("button").attributes("data-fullscreen"),
		).toBeUndefined();
		player.destroy();
	});
});
