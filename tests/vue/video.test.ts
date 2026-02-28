import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h, inject, provide, shallowRef } from "vue";
import { createPlayer } from "../../src/core.js";
import type { Player } from "../../src/types.js";
import {
	VIDE_PLAYER_KEY,
	VIDE_REGISTER_KEY,
	useVideContext,
} from "../../src/vue/context.js";
import { VideVideo } from "../../src/vue/video.js";

describe("VideVideo", () => {
	it("renders a video element inside a wrapper div", () => {
		const Parent = defineComponent({
			setup() {
				const player = shallowRef<Player | null>(null);
				provide(VIDE_PLAYER_KEY, player);
				provide(VIDE_REGISTER_KEY, () => {});
				return () => h(VideVideo);
			},
		});

		const wrapper = mount(Parent);
		expect(wrapper.find("video").exists()).toBe(true);
		expect(wrapper.find("div").exists()).toBe(true);
	});

	it("passes HTML attributes to the video element", () => {
		const Parent = defineComponent({
			setup() {
				const player = shallowRef<Player | null>(null);
				provide(VIDE_PLAYER_KEY, player);
				provide(VIDE_REGISTER_KEY, () => {});
				return () =>
					h(VideVideo, { src: "video.mp4", muted: true, autoplay: true });
			},
		});

		const wrapper = mount(Parent);
		const video = wrapper.find("video");
		expect(video.attributes("src")).toBe("video.mp4");
	});

	it("applies class to wrapper div, not video", () => {
		const Parent = defineComponent({
			setup() {
				const player = shallowRef<Player | null>(null);
				provide(VIDE_PLAYER_KEY, player);
				provide(VIDE_REGISTER_KEY, () => {});
				return () => h(VideVideo, { class: "my-player" });
			},
		});

		const wrapper = mount(Parent);
		expect(wrapper.find("div").classes()).toContain("my-player");
	});

	it("renders children in default slot", () => {
		const Parent = defineComponent({
			setup() {
				const player = shallowRef<Player | null>(null);
				provide(VIDE_PLAYER_KEY, player);
				provide(VIDE_REGISTER_KEY, () => {});
				return () =>
					h(VideVideo, null, {
						default: () => h("span", { "data-testid": "child" }, "hello"),
					});
			},
		});

		const wrapper = mount(Parent);
		expect(wrapper.find("[data-testid='child']").text()).toBe("hello");
	});

	it("calls registerEl on mount", () => {
		let registeredEl: HTMLVideoElement | null = null;

		const Parent = defineComponent({
			setup() {
				const player = shallowRef<Player | null>(null);
				provide(VIDE_PLAYER_KEY, player);
				provide(VIDE_REGISTER_KEY, (el: HTMLVideoElement) => {
					registeredEl = el;
				});
				return () => h(VideVideo);
			},
		});

		mount(Parent);
		expect(registeredEl).not.toBeNull();
		expect(registeredEl!.tagName).toBe("VIDEO");
	});
});
