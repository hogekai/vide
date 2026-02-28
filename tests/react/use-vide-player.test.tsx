import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useVidePlayer } from "../../src/react/use-vide-player.js";

describe("useVidePlayer", () => {
	it("returns null player initially", () => {
		const { result } = renderHook(() => useVidePlayer());
		expect(result.current.player).toBeNull();
	});

	it("returns a stable _registerEl callback", () => {
		const { result, rerender } = renderHook(() => useVidePlayer());
		const reg1 = result.current._registerEl;
		rerender();
		expect(result.current._registerEl).toBe(reg1);
	});

	it("creates player when _registerEl receives a video element", () => {
		const { result } = renderHook(() => useVidePlayer());
		const video = document.createElement("video");

		act(() => {
			result.current._registerEl(video);
		});

		expect(result.current.player).not.toBeNull();
		expect(result.current.player!.el).toBe(video);
	});

	it("destroys player on unmount", () => {
		const { result, unmount } = renderHook(() => useVidePlayer());
		const video = document.createElement("video");

		act(() => {
			result.current._registerEl(video);
		});

		const player = result.current.player!;
		const destroySpy = vi.spyOn(player, "destroy");

		unmount();

		expect(destroySpy).toHaveBeenCalledOnce();
	});
});
