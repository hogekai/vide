import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h, provide, shallowRef } from "vue";
import { createPlayer } from "../../../src/core.js";
import type { Player } from "../../../src/types.js";
import { VideProgress } from "../../../src/vue/components/progress.js";
import { VIDE_PLAYER_KEY } from "../../../src/vue/context.js";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	const playerRef = shallowRef<Player | null>(player);
	return { player, video, playerRef };
}

function mountProgress(
	playerRef: ReturnType<typeof shallowRef<Player | null>>,
	props?: Record<string, unknown>,
) {
	const Parent = defineComponent({
		setup() {
			provide(VIDE_PLAYER_KEY, playerRef);
			return () => h(VideProgress, props);
		},
	});
	return mount(Parent);
}

describe("VideProgress", () => {
	it("renders a slider element", () => {
		const { playerRef, player } = setup();
		const wrapper = mountProgress(playerRef);
		const slider = wrapper.find("[role='slider']");
		expect(slider.exists()).toBe(true);
		expect(slider.attributes("aria-label")).toBe("Seek");
		player.destroy();
	});

	it("applies class via attrs", () => {
		const { playerRef, player } = setup();
		const wrapper = mountProgress(playerRef, { class: "my-progress" });
		const slider = wrapper.find("[role='slider']");
		expect(slider.classes()).toContain("my-progress");
		player.destroy();
	});

	it("sets aria-valuenow to 0 initially", () => {
		const { playerRef, player } = setup();
		const wrapper = mountProgress(playerRef);
		const slider = wrapper.find("[role='slider']");
		expect(slider.attributes("aria-valuenow")).toBe("0");
		player.destroy();
	});

	it("sets data-disabled during ad playback", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountProgress(playerRef);

		player.emit("statechange", { from: "playing", to: "ad:playing" });
		await wrapper.vm.$nextTick();

		const slider = wrapper.find("[role='slider']");
		expect(slider.attributes("data-disabled")).toBe("true");
		player.destroy();
	});
});
