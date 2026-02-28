import { vi } from "vitest";

// jsdom does not implement HTMLMediaElement.prototype.play/pause.
// Stub them to suppress "Not implemented" stderr noise in tests.
HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
HTMLMediaElement.prototype.pause = vi.fn();
