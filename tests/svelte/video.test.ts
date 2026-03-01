import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import type { Player } from "../../src/types.js";
import VideoTestHost from "./VideoTestHost.svelte";

describe("VideVideo", () => {
	it("renders a video element", () => {
		const { container } = render(VideoTestHost);
		expect(container.querySelector("video")).not.toBeNull();
	});

	it("calls registerEl on mount", () => {
		let registeredEl: HTMLVideoElement | null = null;

		render(VideoTestHost, {
			props: {
				onRegister: (el: HTMLVideoElement) => {
					registeredEl = el;
				},
			},
		});

		expect(registeredEl).not.toBeNull();
		expect(registeredEl!.tagName).toBe("VIDEO");
	});
});
