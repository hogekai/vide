import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h, provide, shallowRef } from "vue";
import { createPlayer } from "../../../src/core.js";
import type { Player } from "../../../src/types.js";
import { VideTimeDisplay } from "../../../src/vue/components/time-display.js";
import { VIDE_PLAYER_KEY } from "../../../src/vue/context.js";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	const playerRef = shallowRef<Player | null>(player);
	return { player, video, playerRef };
}

function mountTimeDisplay(
	playerRef: ReturnType<typeof shallowRef<Player | null>>,
	props?: Record<string, unknown>,
) {
	const Parent = defineComponent({
		setup() {
			provide(VIDE_PLAYER_KEY, playerRef);
			return () => h(VideTimeDisplay, props);
		},
	});
	return mount(Parent);
}

describe("VideTimeDisplay", () => {
	it("renders time display with default separator", () => {
		const { playerRef, player } = setup();
		const wrapper = mountTimeDisplay(playerRef);
		expect(wrapper.find("[aria-label='Time']").exists()).toBe(true);
		expect(wrapper.text()).toContain("/");
		player.destroy();
	});

	it("renders time display with custom separator", () => {
		const { playerRef, player } = setup();
		const wrapper = mountTimeDisplay(playerRef, { separator: " - " });
		expect(wrapper.text()).toContain(" - ");
		player.destroy();
	});

	it("shows 0:00 initially", () => {
		const { playerRef, player } = setup();
		const wrapper = mountTimeDisplay(playerRef);
		const spans = wrapper.findAll("span");
		expect(spans[0].text()).toBe("0:00");
		expect(spans[2].text()).toBe("0:00");
		player.destroy();
	});

	it("updates when timeupdate event fires", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountTimeDisplay(playerRef);

		player.emit("timeupdate", { currentTime: 65, duration: 300 });
		await wrapper.vm.$nextTick();

		const spans = wrapper.findAll("span");
		expect(spans[0].text()).toBe("1:05");
		expect(spans[2].text()).toBe("5:00");
		player.destroy();
	});
});
