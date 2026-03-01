import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, provide, shallowRef } from "vue";
import { createPlayer } from "../../../src/core.js";
import type { Player } from "../../../src/types.js";
import { VideAdSkip } from "../../../src/vue/components/ad-skip.js";
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
			return () => h(VideAdSkip, props, slots);
		},
	});
	return mount(Parent);
}

describe("VideAdSkip", () => {
	it("renders nothing when no ad active", () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(playerRef);
		expect(wrapper.find("button").exists()).toBe(false);
		player.destroy();
	});

	it("renders nothing when skipOffset is undefined", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(playerRef);

		player.emit("ad:start", { adId: "ad-1" });
		await wrapper.vm.$nextTick();

		expect(wrapper.find("button").exists()).toBe(false);
		player.destroy();
	});

	it("shows disabled button with countdown before skipOffset", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(playerRef);

		player.emit("ad:start", {
			adId: "ad-1",
			skipOffset: 5,
			duration: 30,
		});
		await wrapper.vm.$nextTick();

		player.emit("timeupdate", { currentTime: 2, duration: 30 });
		await wrapper.vm.$nextTick();

		const button = wrapper.find("button");
		expect(button.exists()).toBe(true);
		expect(button.attributes("disabled")).toBeDefined();
		expect(button.text()).toBe("Skip in 3s");
		player.destroy();
	});

	it("shows enabled button after skipOffset", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(playerRef);

		player.emit("ad:start", {
			adId: "ad-1",
			skipOffset: 5,
			duration: 30,
		});
		await wrapper.vm.$nextTick();

		player.emit("timeupdate", { currentTime: 6, duration: 30 });
		await wrapper.vm.$nextTick();

		const button = wrapper.find("button");
		expect(button.exists()).toBe(true);
		expect(button.attributes("disabled")).toBeUndefined();
		expect(button.text()).toBe("Skip Ad");
		player.destroy();
	});

	it("button click emits ad:skip when can skip", async () => {
		const { playerRef, player } = setup();
		const skipSpy = vi.fn();
		player.on("ad:skip", skipSpy);
		const wrapper = mountComponent(playerRef);

		player.emit("ad:start", {
			adId: "ad-1",
			skipOffset: 5,
			duration: 30,
		});
		await wrapper.vm.$nextTick();

		player.emit("timeupdate", { currentTime: 6, duration: 30 });
		await wrapper.vm.$nextTick();

		await wrapper.find("button").trigger("click");

		expect(skipSpy).toHaveBeenCalledWith({ adId: "ad-1" });
		player.destroy();
	});

	it("applies class via attrs", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(playerRef, { class: "my-skip" });

		player.emit("ad:start", {
			adId: "ad-1",
			skipOffset: 5,
			duration: 30,
		});
		await wrapper.vm.$nextTick();

		player.emit("timeupdate", { currentTime: 2, duration: 30 });
		await wrapper.vm.$nextTick();

		expect(wrapper.find("button").classes()).toContain("my-skip");
		player.destroy();
	});
});
