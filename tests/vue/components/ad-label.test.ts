import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, provide, shallowRef } from "vue";
import { createPlayer } from "../../../src/core.js";
import type { Player } from "../../../src/types.js";
import { VideAdLabel } from "../../../src/vue/components/ad-label.js";
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
			return () => h(VideAdLabel, props, slots);
		},
	});
	return mount(Parent);
}

describe("VideAdLabel", () => {
	it("renders nothing when no ad active", () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(playerRef);
		expect(wrapper.find(".vide-ad-label").exists()).toBe(false);
		player.destroy();
	});

	it("shows 'Ad' text when ad:start fires", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(playerRef);

		player.emit("ad:start", { adId: "ad-1" });
		await wrapper.vm.$nextTick();

		const el = wrapper.find(".vide-ad-label");
		expect(el.exists()).toBe(true);
		expect(el.text()).toBe("Ad");
		player.destroy();
	});

	it("hidden when ad:end fires", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(playerRef);

		player.emit("ad:start", { adId: "ad-1" });
		await wrapper.vm.$nextTick();
		expect(wrapper.find(".vide-ad-label").exists()).toBe(true);

		player.emit("ad:end", { adId: "ad-1" });
		await wrapper.vm.$nextTick();
		expect(wrapper.find(".vide-ad-label").exists()).toBe(false);
		player.destroy();
	});

	it("applies class via attrs", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(playerRef, { class: "my-label" });

		player.emit("ad:start", { adId: "ad-1" });
		await wrapper.vm.$nextTick();

		expect(wrapper.find(".vide-ad-label").classes()).toContain("my-label");
		player.destroy();
	});

	it("renders slot content", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(
			playerRef,
			{},
			{
				default: () => h("span", { "data-testid": "custom" }, "Advertisement"),
			},
		);

		player.emit("ad:start", { adId: "ad-1" });
		await wrapper.vm.$nextTick();

		expect(wrapper.find("[data-testid='custom']").text()).toBe("Advertisement");
		player.destroy();
	});
});
