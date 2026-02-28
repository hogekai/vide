import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useVidePlayer } from "../../src/react/use-vide-player.js";

describe("useVidePlayer", () => {
	it("returns null player initially", () => {
		const { result } = renderHook(() => useVidePlayer());
		expect(result.current.player).toBeNull();
	});

	it("returns a stable ref callback", () => {
		const { result, rerender } = renderHook(() => useVidePlayer());
		const ref1 = result.current.ref;
		rerender();
		expect(result.current.ref).toBe(ref1);
	});

	it("creates player when ref receives a video element", () => {
		const { result } = renderHook(() => useVidePlayer());
		const video = document.createElement("video");

		act(() => {
			result.current.ref(video);
		});

		expect(result.current.player).not.toBeNull();
		expect(result.current.player!.el).toBe(video);
	});

	it("destroys player when ref receives null", () => {
		const { result } = renderHook(() => useVidePlayer());
		const video = document.createElement("video");

		act(() => {
			result.current.ref(video);
		});

		const player = result.current.player!;
		const destroySpy = vi.spyOn(player, "destroy");

		act(() => {
			result.current.ref(null);
		});

		expect(destroySpy).toHaveBeenCalledOnce();
		expect(result.current.player).toBeNull();
	});

	it("destroys old player when ref receives a new element", () => {
		const { result } = renderHook(() => useVidePlayer());
		const video1 = document.createElement("video");
		const video2 = document.createElement("video");

		act(() => {
			result.current.ref(video1);
		});

		const player1 = result.current.player!;
		const destroySpy = vi.spyOn(player1, "destroy");

		act(() => {
			result.current.ref(video2);
		});

		expect(destroySpy).toHaveBeenCalledOnce();
		expect(result.current.player).not.toBeNull();
		expect(result.current.player!.el).toBe(video2);
	});
});
