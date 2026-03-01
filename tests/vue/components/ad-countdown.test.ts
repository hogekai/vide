import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, provide, shallowRef } from "vue";
import { createPlayer } from "../../../src/core.js";
import type { Player } from "../../../src/types.js";
import { VideAdCountdown } from "../../../src/vue/components/ad-countdown.js";
import { VIDE_PLAYER_KEY } from "../../../src/vue/context.js";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	const playerRef = shallowRef<Player | null>(player);
	return { player, video, playerRef };
}

function mountComponent(
	playerRef: ReturnType<typeof shallowRef<Player | null>>,
	props?: Record<string, unknown>,
	slots?: Record<string, () => unknown>,
) {
	const Parent = defineComponent({
		setup() {
			provide(VIDE_PLAYER_KEY, playerRef);
			return () => h(VideAdCountdown, props, slots);
		},
	});
	return mount(Parent);
}

describe("VideAdCountdown", () => {
	it("renders nothing when no ad active", () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(playerRef);
		expect(wrapper.find(".vide-ad-countdown").exists()).toBe(false);
		player.destroy();
	});

	it("shows 'Ad . Ns' format after ad:start + timeupdate", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(playerRef);

		player.emit("ad:start", {
			adId: "ad-1",
			duration: 30,
		});
		await wrapper.vm.$nextTick();

		player.emit("timeupdate", { currentTime: 10, duration: 30 });
		await wrapper.vm.$nextTick();

		const el = wrapper.find(".vide-ad-countdown");
		expect(el.exists()).toBe(true);
		expect(el.text()).toBe("Ad \u00b7 20s");
		player.destroy();
	});

	it("applies class via attrs", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(playerRef, { class: "my-countdown" });

		player.emit("ad:start", {
			adId: "ad-1",
			duration: 30,
		});
		await wrapper.vm.$nextTick();

		expect(wrapper.find(".vide-ad-countdown").classes()).toContain(
			"my-countdown",
		);
		player.destroy();
	});
});
