import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, provide, shallowRef } from "vue";
import { createPlayer } from "../../../src/core.js";
import type { Player } from "../../../src/types.js";
import { VideAdOverlay } from "../../../src/vue/components/ad-overlay.js";
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
			return () => h(VideAdOverlay, props, slots);
		},
	});
	return mount(Parent);
}

describe("VideAdOverlay", () => {
	it("renders nothing when no ad active", () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(playerRef);
		expect(wrapper.find(".vide-ad-overlay").exists()).toBe(false);
		player.destroy();
	});

	it("renders overlay div when ad:start fires", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(playerRef);

		player.emit("ad:start", {
			adId: "ad-1",
			clickThrough: "https://example.com",
		});
		await wrapper.vm.$nextTick();

		expect(wrapper.find(".vide-ad-overlay").exists()).toBe(true);
		player.destroy();
	});

	it("hidden when ad:end fires", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(playerRef);

		player.emit("ad:start", { adId: "ad-1" });
		await wrapper.vm.$nextTick();
		expect(wrapper.find(".vide-ad-overlay").exists()).toBe(true);

		player.emit("ad:end", { adId: "ad-1" });
		await wrapper.vm.$nextTick();
		expect(wrapper.find(".vide-ad-overlay").exists()).toBe(false);
		player.destroy();
	});

	it("applies class via attrs", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(playerRef, { class: "my-overlay" });

		player.emit("ad:start", { adId: "ad-1" });
		await wrapper.vm.$nextTick();

		expect(wrapper.find(".vide-ad-overlay").classes()).toContain("my-overlay");
		player.destroy();
	});

	it("renders slot content", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(
			playerRef,
			{},
			{
				default: () => h("span", { "data-testid": "slot" }, "Click here"),
			},
		);

		player.emit("ad:start", { adId: "ad-1" });
		await wrapper.vm.$nextTick();

		expect(wrapper.find("[data-testid='slot']").text()).toBe("Click here");
		player.destroy();
	});

	it("on click calls window.open when clickThrough exists", async () => {
		const { playerRef, player } = setup();
		const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
		vi.spyOn(player.el, "click").mockImplementation(() => {});
		vi.spyOn(player.el, "pause").mockImplementation(() => {});

		const wrapper = mountComponent(playerRef);

		player.emit("ad:start", {
			adId: "ad-1",
			clickThrough: "https://example.com",
		});
		await wrapper.vm.$nextTick();

		await wrapper.find(".vide-ad-overlay").trigger("click");

		expect(openSpy).toHaveBeenCalledWith("https://example.com", "_blank");
		player.destroy();
	});
});
