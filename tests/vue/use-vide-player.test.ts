import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { type ShallowRef, defineComponent, h, inject, nextTick } from "vue";
import type { Player } from "../../src/types.js";
import { VIDE_PLAYER_KEY, VIDE_REGISTER_KEY } from "../../src/vue/context.js";
import { useVidePlayer } from "../../src/vue/use-vide-player.js";

describe("useVidePlayer", () => {
	it("returns shallowRef(null) initially", () => {
		let playerRef!: ShallowRef<Player | null>;

		const Comp = defineComponent({
			setup() {
				playerRef = useVidePlayer();
				return () => null;
			},
		});

		mount(Comp);
		expect(playerRef.value).toBeNull();
	});

	it("provides player and registerEl to children via inject", () => {
		let injectedPlayer: ShallowRef<Player | null> | undefined;
		let injectedRegister: ((el: HTMLVideoElement) => void) | undefined;

		const Child = defineComponent({
			setup() {
				injectedPlayer = inject(VIDE_PLAYER_KEY);
				injectedRegister = inject(VIDE_REGISTER_KEY);
				return () => null;
			},
		});

		const Parent = defineComponent({
			setup() {
				useVidePlayer();
				return () => h(Child);
			},
		});

		mount(Parent);
		expect(injectedPlayer).toBeDefined();
		expect(injectedRegister).toBeDefined();
	});

	it("creates player when registerEl is called with an element", () => {
		let playerRef!: ShallowRef<Player | null>;
		let register!: (el: HTMLVideoElement) => void;

		const Child = defineComponent({
			setup() {
				register = inject(VIDE_REGISTER_KEY)!;
				return () => null;
			},
		});

		const Parent = defineComponent({
			setup() {
				playerRef = useVidePlayer();
				return () => h(Child);
			},
		});

		mount(Parent);

		const video = document.createElement("video");
		register(video);

		expect(playerRef.value).not.toBeNull();
		expect(playerRef.value!.el).toBe(video);
	});

	it("destroys old player when registerEl is called with a new element", () => {
		let playerRef!: ShallowRef<Player | null>;
		let register!: (el: HTMLVideoElement) => void;

		const Child = defineComponent({
			setup() {
				register = inject(VIDE_REGISTER_KEY)!;
				return () => null;
			},
		});

		const Parent = defineComponent({
			setup() {
				playerRef = useVidePlayer();
				return () => h(Child);
			},
		});

		mount(Parent);

		const video1 = document.createElement("video");
		register(video1);
		const player1 = playerRef.value!;
		const destroySpy = vi.spyOn(player1, "destroy");

		const video2 = document.createElement("video");
		register(video2);

		expect(destroySpy).toHaveBeenCalledOnce();
		expect(playerRef.value).not.toBeNull();
		expect(playerRef.value!.el).toBe(video2);
	});

	it("destroys player on unmount", () => {
		let playerRef!: ShallowRef<Player | null>;
		let register!: (el: HTMLVideoElement) => void;

		const Child = defineComponent({
			setup() {
				register = inject(VIDE_REGISTER_KEY)!;
				return () => null;
			},
		});

		const Parent = defineComponent({
			setup() {
				playerRef = useVidePlayer();
				return () => h(Child);
			},
		});

		const wrapper = mount(Parent);

		const video = document.createElement("video");
		register(video);
		const player = playerRef.value!;
		const destroySpy = vi.spyOn(player, "destroy");

		wrapper.unmount();

		expect(destroySpy).toHaveBeenCalledOnce();
	});
});
