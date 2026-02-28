import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, provide, shallowRef } from "vue";
import { createPlayer } from "../../../src/core.js";
import type { Player } from "../../../src/types.js";
import { VidePlayButton } from "../../../src/vue/components/play-button.js";
import { VIDE_PLAYER_KEY } from "../../../src/vue/context.js";

function setup() {
	const video = document.createElement("video");
	const player = createPlayer(video);
	const playerRef = shallowRef<Player | null>(player);
	return { player, video, playerRef };
}

function driveToPlaying(el: HTMLVideoElement) {
	el.dispatchEvent(new Event("loadstart"));
	el.dispatchEvent(new Event("canplay"));
	el.dispatchEvent(new Event("play"));
}

function mountPlayButton(
	playerRef: ReturnType<typeof shallowRef<Player | null>>,
	props?: Record<string, unknown>,
	slots?: Record<string, () => unknown>,
) {
	const Parent = defineComponent({
		setup() {
			provide(VIDE_PLAYER_KEY, playerRef);
			return () => h(VidePlayButton, props, slots);
		},
	});
	return mount(Parent);
}

describe("VidePlayButton", () => {
	it("renders with Play label initially", () => {
		const { playerRef, player } = setup();
		const wrapper = mountPlayButton(playerRef);
		expect(wrapper.find("button").attributes("aria-label")).toBe("Play");
		player.destroy();
	});

	it("applies class via attrs", () => {
		const { playerRef, player } = setup();
		const wrapper = mountPlayButton(playerRef, { class: "my-btn" });
		expect(wrapper.find("button").classes()).toContain("my-btn");
		player.destroy();
	});

	it("renders slot content", () => {
		const { playerRef, player } = setup();
		const wrapper = mountPlayButton(
			playerRef,
			{},
			{
				default: () => h("span", { "data-testid": "icon" }, "▶"),
			},
		);
		expect(wrapper.find("[data-testid='icon']").text()).toBe("▶");
		player.destroy();
	});

	it("switches to Pause label when playing", async () => {
		const { playerRef, player, video } = setup();
		const wrapper = mountPlayButton(playerRef);

		driveToPlaying(video);
		await wrapper.vm.$nextTick();

		expect(wrapper.find("button").attributes("aria-label")).toBe("Pause");
		player.destroy();
	});

	it("calls player.pause() when clicked while playing", async () => {
		const { playerRef, player, video } = setup();
		const pauseSpy = vi.spyOn(player, "pause");
		const wrapper = mountPlayButton(playerRef);

		driveToPlaying(video);
		await wrapper.vm.$nextTick();

		await wrapper.find("button").trigger("click");
		expect(pauseSpy).toHaveBeenCalledOnce();
		player.destroy();
	});

	it("calls player.play() when clicked while paused", async () => {
		const { playerRef, player } = setup();
		const playSpy = vi.spyOn(player, "play");
		const wrapper = mountPlayButton(playerRef);

		await wrapper.find("button").trigger("click");
		expect(playSpy).toHaveBeenCalledOnce();
		player.destroy();
	});

	it("sets data-playing attribute when playing", async () => {
		const { playerRef, player, video } = setup();
		const wrapper = mountPlayButton(playerRef);

		expect(wrapper.find("button").attributes("data-playing")).toBeUndefined();

		driveToPlaying(video);
		await wrapper.vm.$nextTick();

		expect(wrapper.find("button").attributes("data-playing")).toBe("true");
		player.destroy();
	});
});
