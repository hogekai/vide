import { render } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import type { PlayerGetter, RegisterFn } from "../../src/svelte/context.js";
import CreatePlayerHost from "./CreatePlayerHost.svelte";

describe("createVidePlayer", () => {
	it("returns null player initially", () => {
		let injectedGetPlayer: PlayerGetter | undefined;

		render(CreatePlayerHost, {
			props: {
				onCreated: ({ getPlayer }) => {
					injectedGetPlayer = getPlayer;
				},
			},
		});

		expect(injectedGetPlayer).toBeDefined();
		expect(injectedGetPlayer!()).toBeNull();
	});

	it("provides player and registerEl to children via context", () => {
		let injectedGetPlayer: PlayerGetter | undefined;
		let injectedRegisterEl: RegisterFn | undefined;

		render(CreatePlayerHost, {
			props: {
				onCreated: ({ getPlayer, registerEl }) => {
					injectedGetPlayer = getPlayer;
					injectedRegisterEl = registerEl;
				},
			},
		});

		expect(injectedGetPlayer).toBeDefined();
		expect(injectedRegisterEl).toBeDefined();
	});

	it("creates player when registerEl is called with an element", () => {
		let injectedGetPlayer: PlayerGetter | undefined;
		let injectedRegisterEl: RegisterFn | undefined;

		render(CreatePlayerHost, {
			props: {
				onCreated: ({ getPlayer, registerEl }) => {
					injectedGetPlayer = getPlayer;
					injectedRegisterEl = registerEl;
				},
			},
		});

		const video = document.createElement("video");
		injectedRegisterEl!(video);

		expect(injectedGetPlayer!()).not.toBeNull();
		expect(injectedGetPlayer!()!.el).toBe(video);
	});

	it("destroys old player when registerEl is called with a new element", () => {
		let injectedGetPlayer: PlayerGetter | undefined;
		let injectedRegisterEl: RegisterFn | undefined;

		render(CreatePlayerHost, {
			props: {
				onCreated: ({ getPlayer, registerEl }) => {
					injectedGetPlayer = getPlayer;
					injectedRegisterEl = registerEl;
				},
			},
		});

		const video1 = document.createElement("video");
		injectedRegisterEl!(video1);
		const player1 = injectedGetPlayer!()!;
		const destroySpy = vi.spyOn(player1, "destroy");

		const video2 = document.createElement("video");
		injectedRegisterEl!(video2);

		expect(destroySpy).toHaveBeenCalledOnce();
		expect(injectedGetPlayer!()).not.toBeNull();
		expect(injectedGetPlayer!()!.el).toBe(video2);
	});

	it("destroys player on unmount", () => {
		let injectedGetPlayer: PlayerGetter | undefined;
		let injectedRegisterEl: RegisterFn | undefined;

		const { unmount } = render(CreatePlayerHost, {
			props: {
				onCreated: ({ getPlayer, registerEl }) => {
					injectedGetPlayer = getPlayer;
					injectedRegisterEl = registerEl;
				},
			},
		});

		const video = document.createElement("video");
		injectedRegisterEl!(video);
		const player = injectedGetPlayer!()!;
		const destroySpy = vi.spyOn(player, "destroy");

		unmount();

		expect(destroySpy).toHaveBeenCalledOnce();
	});
});
