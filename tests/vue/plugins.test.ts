import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, provide, shallowRef } from "vue";
import { createPlayer } from "../../src/core.js";
import type { Player } from "../../src/types.js";
import { VIDE_PLAYER_KEY } from "../../src/vue/context.js";
import { VideHlsPlugin } from "../../src/vue/plugins.js";

describe("Plugin components", () => {
	it("VideHlsPlugin renders nothing", () => {
		const video = document.createElement("video");
		const player = createPlayer(video);
		const playerRef = shallowRef<Player | null>(player);

		const Parent = defineComponent({
			setup() {
				provide(VIDE_PLAYER_KEY, playerRef);
				return () => h(VideHlsPlugin);
			},
		});

		const wrapper = mount(Parent);
		// Plugin components render nothing visible
		expect(wrapper.find("video").exists()).toBe(false);

		player.destroy();
	});

	it("VideHlsPlugin calls plugin setup on mount", () => {
		const video = document.createElement("video");
		const player = createPlayer(video);
		const playerRef = shallowRef<Player | null>(player);

		const spy = vi.spyOn(player, "registerSourceHandler");

		const Parent = defineComponent({
			setup() {
				provide(VIDE_PLAYER_KEY, playerRef);
				return () => h(VideHlsPlugin);
			},
		});

		mount(Parent);

		expect(spy).toHaveBeenCalled();

		player.destroy();
	});

	it("VideHlsPlugin cleans up on unmount", () => {
		const video = document.createElement("video");
		const player = createPlayer(video);
		const playerRef = shallowRef<Player | null>(player);

		const Parent = defineComponent({
			setup() {
				provide(VIDE_PLAYER_KEY, playerRef);
				return () => h(VideHlsPlugin);
			},
		});

		const wrapper = mount(Parent);
		// Should not throw on unmount
		wrapper.unmount();

		player.destroy();
	});

	it("throws when used outside context", () => {
		expect(() => {
			mount(VideHlsPlugin);
		}).toThrow("useVideContext must be used within <VideVideo>");
	});
});
