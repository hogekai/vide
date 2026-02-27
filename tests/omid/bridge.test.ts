import { afterEach, describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { createOmidBridge } from "../../src/omid/bridge.js";
import type { OmidSession } from "../../src/omid/session.js";
import type { Player } from "../../src/types.js";

function createMockSession(): OmidSession {
	return {
		adEvents: {
			impressionOccurred: vi.fn(),
			loaded: vi.fn(),
		},
		mediaEvents: {
			start: vi.fn(),
			firstQuartile: vi.fn(),
			midpoint: vi.fn(),
			thirdQuartile: vi.fn(),
			complete: vi.fn(),
			pause: vi.fn(),
			resume: vi.fn(),
			bufferStart: vi.fn(),
			bufferFinish: vi.fn(),
			skipped: vi.fn(),
			volumeChange: vi.fn(),
			playerStateChange: vi.fn(),
			adUserInteraction: vi.fn(),
		},
		vastProperties: {},
		started: true,
		waitForStart: vi.fn().mockResolvedValue(true),
		finish: vi.fn(),
		error: vi.fn(),
	};
}

function setupPlayer(): { player: Player; el: HTMLVideoElement } {
	const el = document.createElement("video");
	const container = document.createElement("div");
	container.appendChild(el);
	document.body.appendChild(container);

	// Stub volume
	Object.defineProperty(el, "volume", {
		get: () => 0.8,
		configurable: true,
	});
	Object.defineProperty(el, "muted", {
		get: () => false,
		configurable: true,
	});

	const player = createPlayer(el);
	return { player, el };
}

afterEach(() => {
	vi.restoreAllMocks();
	for (const div of document.body.querySelectorAll("div")) {
		div.remove();
	}
});

describe("createOmidBridge", () => {
	describe("immediate dispatches", () => {
		it("calls adEvents.loaded and impressionOccurred", () => {
			const { player } = setupPlayer();
			const session = createMockSession();

			createOmidBridge(player, session, 30);

			expect(session.adEvents.loaded).toHaveBeenCalledWith(
				session.vastProperties,
			);
			expect(session.adEvents.impressionOccurred).toHaveBeenCalled();
		});

		it("calls mediaEvents.start with duration and volume", () => {
			const { player } = setupPlayer();
			const session = createMockSession();

			createOmidBridge(player, session, 30);

			expect(session.mediaEvents.start).toHaveBeenCalledWith(30, 0.8);
		});

		it("calls mediaEvents.start with volume 0 when muted", () => {
			const { player, el } = setupPlayer();
			Object.defineProperty(el, "muted", {
				get: () => true,
				configurable: true,
			});
			const session = createMockSession();

			createOmidBridge(player, session, 30);

			expect(session.mediaEvents.start).toHaveBeenCalledWith(30, 0);
		});
	});

	describe("quartile tracking via ad:quartile events", () => {
		it("calls firstQuartile on ad:quartile event", () => {
			const { player } = setupPlayer();
			const session = createMockSession();

			createOmidBridge(player, session, 100);

			player.emit("ad:quartile", {
				adId: "ad1",
				quartile: "firstQuartile",
			});

			expect(session.mediaEvents.firstQuartile).toHaveBeenCalled();
		});

		it("calls midpoint on ad:quartile event", () => {
			const { player } = setupPlayer();
			const session = createMockSession();

			createOmidBridge(player, session, 100);

			player.emit("ad:quartile", { adId: "ad1", quartile: "midpoint" });

			expect(session.mediaEvents.midpoint).toHaveBeenCalled();
		});

		it("calls thirdQuartile on ad:quartile event", () => {
			const { player } = setupPlayer();
			const session = createMockSession();

			createOmidBridge(player, session, 100);

			player.emit("ad:quartile", {
				adId: "ad1",
				quartile: "thirdQuartile",
			});

			expect(session.mediaEvents.thirdQuartile).toHaveBeenCalled();
		});

		it("does not call mediaEvents.start or complete from ad:quartile", () => {
			const { player } = setupPlayer();
			const session = createMockSession();

			createOmidBridge(player, session, 100);

			// Reset mock to clear the immediate start() call
			(session.mediaEvents.start as ReturnType<typeof vi.fn>).mockClear();

			// Trigger start quartile
			player.emit("ad:quartile", { adId: "ad1", quartile: "start" });
			expect(session.mediaEvents.start).not.toHaveBeenCalled();

			// Trigger complete quartile
			player.emit("ad:quartile", { adId: "ad1", quartile: "complete" });
			expect(session.mediaEvents.complete).not.toHaveBeenCalled();
		});
	});

	describe("state changes", () => {
		it("calls mediaEvents.pause on statechange to ad:paused", () => {
			const { player } = setupPlayer();
			const session = createMockSession();

			createOmidBridge(player, session, 30);

			player.emit("statechange", {
				from: "ad:playing",
				to: "ad:paused",
			});

			expect(session.mediaEvents.pause).toHaveBeenCalled();
		});

		it("calls mediaEvents.resume on statechange from ad:paused to ad:playing", () => {
			const { player } = setupPlayer();
			const session = createMockSession();

			createOmidBridge(player, session, 30);

			player.emit("statechange", {
				from: "ad:paused",
				to: "ad:playing",
			});

			expect(session.mediaEvents.resume).toHaveBeenCalled();
		});

		it("does not call resume on initial ad:playing", () => {
			const { player } = setupPlayer();
			const session = createMockSession();

			createOmidBridge(player, session, 30);

			player.emit("statechange", {
				from: "ad:loading",
				to: "ad:playing",
			});

			expect(session.mediaEvents.resume).not.toHaveBeenCalled();
		});
	});

	describe("ad lifecycle events", () => {
		it("calls complete and finish on ad:end", () => {
			const { player } = setupPlayer();
			const session = createMockSession();

			createOmidBridge(player, session, 30);

			player.emit("ad:end", { adId: "ad1" });

			expect(session.mediaEvents.complete).toHaveBeenCalled();
			expect(session.finish).toHaveBeenCalled();
		});

		it("calls skipped and finish on ad:skip", () => {
			const { player } = setupPlayer();
			const session = createMockSession();

			createOmidBridge(player, session, 30);

			player.emit("ad:skip", { adId: "ad1" });

			expect(session.mediaEvents.skipped).toHaveBeenCalled();
			expect(session.finish).toHaveBeenCalled();
		});

		it("calls error and finish on ad:error", () => {
			const { player } = setupPlayer();
			const session = createMockSession();

			createOmidBridge(player, session, 30);

			player.emit("ad:error", { error: new Error("fail") });

			expect(session.error).toHaveBeenCalledWith("Ad playback error");
			expect(session.finish).toHaveBeenCalled();
		});

		it("calls finish on destroy", () => {
			const { player } = setupPlayer();
			const session = createMockSession();

			createOmidBridge(player, session, 30);

			player.emit("destroy", undefined as never);

			expect(session.finish).toHaveBeenCalled();
		});
	});

	describe("volume and fullscreen via PlayerEventMap", () => {
		it("calls volumeChange on ad:volumeChange", () => {
			const { player } = setupPlayer();
			const session = createMockSession();

			createOmidBridge(player, session, 30);

			player.emit("ad:volumeChange", { adId: "ad1", volume: 0.5 });

			expect(session.mediaEvents.volumeChange).toHaveBeenCalledWith(0.5);
		});

		it("calls playerStateChange on ad:fullscreen", () => {
			const { player } = setupPlayer();
			const session = createMockSession();

			createOmidBridge(player, session, 30);

			player.emit("ad:fullscreen", { adId: "ad1", fullscreen: true });

			expect(session.mediaEvents.playerStateChange).toHaveBeenCalledWith(
				"fullscreen",
			);

			player.emit("ad:fullscreen", { adId: "ad1", fullscreen: false });

			expect(session.mediaEvents.playerStateChange).toHaveBeenCalledWith(
				"normal",
			);
		});
	});

	describe("cleanup", () => {
		it("does not dispatch events after cleanup", () => {
			const { player } = setupPlayer();
			const session = createMockSession();

			const cleanup = createOmidBridge(player, session, 30);
			cleanup();

			// Reset mocks to check no more calls
			(session.mediaEvents.pause as ReturnType<typeof vi.fn>).mockClear();
			(session.finish as ReturnType<typeof vi.fn>).mockClear();

			player.emit("statechange", {
				from: "ad:playing",
				to: "ad:paused",
			});
			player.emit("ad:end", { adId: "ad1" });

			expect(session.mediaEvents.pause).not.toHaveBeenCalled();
			expect(session.finish).not.toHaveBeenCalled();
		});

		it("removes all event listeners", () => {
			const { player } = setupPlayer();
			const session = createMockSession();

			const cleanup = createOmidBridge(player, session, 30);
			cleanup();

			(
				session.mediaEvents.volumeChange as ReturnType<typeof vi.fn>
			).mockClear();

			player.emit("ad:volumeChange", { adId: "ad1", volume: 0.5 });

			expect(session.mediaEvents.volumeChange).not.toHaveBeenCalled();
		});
	});
});
