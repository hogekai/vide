import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, provide, shallowRef } from "vue";
import { createPlayer } from "../../../src/core.js";
import type { Player } from "../../../src/types.js";
import { VideAdLearnMore } from "../../../src/vue/components/ad-learn-more.js";
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
			return () => h(VideAdLearnMore, props, slots);
		},
	});
	return mount(Parent);
}

describe("VideAdLearnMore", () => {
	it("renders nothing when no ad active", () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(playerRef);
		expect(wrapper.find("button").exists()).toBe(false);
		player.destroy();
	});

	it("renders nothing when clickThrough is undefined", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(playerRef);

		player.emit("ad:start", { adId: "ad-1" });
		await wrapper.vm.$nextTick();

		expect(wrapper.find("button").exists()).toBe(false);
		player.destroy();
	});

	it("renders button when clickThrough exists, showing 'Learn More'", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(playerRef);

		player.emit("ad:start", {
			adId: "ad-1",
			clickThrough: "https://example.com",
		});
		await wrapper.vm.$nextTick();

		const button = wrapper.find("button");
		expect(button.exists()).toBe(true);
		expect(button.text()).toBe("Learn More");
		player.destroy();
	});

	it("on click calls window.open", async () => {
		const { playerRef, player } = setup();
		const openSpy = vi
			.spyOn(window, "open")
			.mockImplementation(() => null);
		vi.spyOn(player.el, "click").mockImplementation(() => {});
		vi.spyOn(player.el, "pause").mockImplementation(() => {});

		const wrapper = mountComponent(playerRef);

		player.emit("ad:start", {
			adId: "ad-1",
			clickThrough: "https://example.com",
		});
		await wrapper.vm.$nextTick();

		await wrapper.find("button").trigger("click");

		expect(openSpy).toHaveBeenCalledWith("https://example.com", "_blank");
		player.destroy();
	});

	it("applies class via attrs", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(playerRef, { class: "my-cta" });

		player.emit("ad:start", {
			adId: "ad-1",
			clickThrough: "https://example.com",
		});
		await wrapper.vm.$nextTick();

		expect(wrapper.find("button").classes()).toContain("my-cta");
		player.destroy();
	});

	it("shows ad title when showTitle prop is true", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(playerRef, { showTitle: true });

		player.emit("ad:start", {
			adId: "ad-1",
			clickThrough: "https://example.com",
			adTitle: "My Ad",
		});
		await wrapper.vm.$nextTick();

		expect(wrapper.find(".vide-ad-cta__title").text()).toBe("My Ad");
		player.destroy();
	});

	it("renders slot content", async () => {
		const { playerRef, player } = setup();
		const wrapper = mountComponent(
			playerRef,
			{},
			{
				default: () =>
					h("span", { "data-testid": "cta" }, "Visit Sponsor"),
			},
		);

		player.emit("ad:start", {
			adId: "ad-1",
			clickThrough: "https://example.com",
		});
		await wrapper.vm.$nextTick();

		expect(wrapper.find("[data-testid='cta']").text()).toBe("Visit Sponsor");
		player.destroy();
	});
});
