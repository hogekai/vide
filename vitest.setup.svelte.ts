import { cleanup } from "@testing-library/svelte";
import { afterEach, vi } from "vitest";

// jsdom does not implement HTMLMediaElement.prototype.play/pause.
HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
HTMLMediaElement.prototype.pause = vi.fn();

afterEach(() => {
	cleanup();
});
