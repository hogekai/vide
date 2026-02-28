import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VideContext } from "../../src/react/context.js";
import { VideVideo } from "../../src/react/video.js";

describe("VideVideo", () => {
	it("renders a video element", () => {
		render(
			<VideContext.Provider value={{ player: null, registerEl: () => {} }}>
				<VideVideo data-testid="vid" />
			</VideContext.Provider>,
		);
		expect(screen.getByTestId("vid").tagName).toBe("VIDEO");
	});

	it("passes HTML attributes to the video element", () => {
		render(
			<VideContext.Provider value={{ player: null, registerEl: () => {} }}>
				<VideVideo data-testid="vid" className="my-class" autoPlay muted />
			</VideContext.Provider>,
		);
		const video = screen.getByTestId("vid");
		expect(video.className).toBe("my-class");
		expect(video).toHaveProperty("autoplay", true);
		expect(video).toHaveProperty("muted", true);
	});

	it("calls registerEl with video element on mount", () => {
		let registered: HTMLVideoElement | null = null;

		render(
			<VideContext.Provider
				value={{
					player: null,
					registerEl: (el) => {
						registered = el;
					},
				}}
			>
				<VideVideo data-testid="vid" />
			</VideContext.Provider>,
		);
		expect(registered).not.toBeNull();
		expect(registered!.tagName).toBe("VIDEO");
	});

	it("throws when used outside Vide.Root", () => {
		expect(() => {
			render(<VideVideo />);
		}).toThrow("Vide.Video must be used within <Vide.Root>");
	});
});
