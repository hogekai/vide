import { afterEach, describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { createOmidBridge } from "../../src/omid/bridge.js";
import type { OmidSession } from "../../src/omid/session.js";
import type { Player, PlayerState } from "../../src/types.js";

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

function setAdPlayingState(player: Player): void {
	const setState = (player as unknown as { _setState(s: PlayerState): void })
		._setState;
	setState("ad:playing");
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

	describe("quartile tracking", () => {
		it("calls firstQuartile at 25%", () => {
			const { player } = setupPlayer();
			const session = createMockSession();
			setAdPlayingState(player);

			createOmidBridge(player, session, 100);

			player.emit("timeupdate", { currentTime: 25, duration: 100 });

			expect(session.mediaEvents.firstQuartile).toHaveBeenCalled();
		});

		it("calls midpoint at 50%", () => {
			const { player } = setupPlayer();
			const session = createMockSession();
			setAdPlayingState(player);

			createOmidBridge(player, session, 100);

			player.emit("timeupdate", { currentTime: 50, duration: 100 });

			expect(session.mediaEvents.midpoint).toHaveBeenCalled();
		});

		it("calls thirdQuartile at 75%", () => {
			const { player } = setupPlayer();
			const session = createMockSession();
			setAdPlayingState(player);

			createOmidBridge(player, session, 100);

			player.emit("timeupdate", { currentTime: 75, duration: 100 });

			expect(session.mediaEvents.thirdQuartile).toHaveBeenCalled();
		});

		it("does not call mediaEvents.start or complete from quartile tracker", () => {
			const { player } = setupPlayer();
			const session = createMockSession();
			setAdPlayingState(player);

			createOmidBridge(player, session, 100);

			// Reset mock to clear the immediate start() call
			(session.mediaEvents.start as ReturnType<typeof vi.fn>).mockClear();

			// Trigger start quartile
			player.emit("timeupdate", { currentTime: 0, duration: 100 });
			expect(session.mediaEvents.start).not.toHaveBeenCalled();

			// Trigger complete quartile
			player.emit("timeupdate", { currentTime: 100, duration: 100 });
			expect(session.mediaEvents.complete).not.toHaveBeenCalled();
		});

		it("catches up missed quartiles on seek", () => {
			const { player } = setupPlayer();
			const session = createMockSession();
			setAdPlayingState(player);

			createOmidBridge(player, session, 100);

			// Jump to 60% - should fire firstQuartile and midpoint
			player.emit("timeupdate", { currentTime: 60, duration: 100 });

			expect(session.mediaEvents.firstQuartile).toHaveBeenCalled();
			expect(session.mediaEvents.midpoint).toHaveBeenCalled();
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

	describe("HTMLVideoElement direct listeners", () => {
		it("calls volumeChange on volumechange", () => {
			const { player, el } = setupPlayer();
			const session = createMockSession();

			createOmidBridge(player, session, 30);

			Object.defineProperty(el, "volume", {
				get: () => 0.5,
				configurable: true,
			});
			el.dispatchEvent(new Event("volumechange"));

			expect(session.mediaEvents.volumeChange).toHaveBeenCalledWith(0.5);
		});

		it("calls playerStateChange on fullscreenchange", () => {
			const { player } = setupPlayer();
			const session = createMockSession();

			createOmidBridge(player, session, 30);

			// Simulate fullscreen (fullscreenElement is read-only, so mock it)
			Object.defineProperty(document, "fullscreenElement", {
				get: () => player.el,
				configurable: true,
			});
			document.dispatchEvent(new Event("fullscreenchange"));

			expect(session.mediaEvents.playerStateChange).toHaveBeenCalledWith(
				"fullscreen",
			);

			// Exit fullscreen
			Object.defineProperty(document, "fullscreenElement", {
				get: () => null,
				configurable: true,
			});
			document.dispatchEvent(new Event("fullscreenchange"));

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
			const { player, el } = setupPlayer();
			const session = createMockSession();

			const cleanup = createOmidBridge(player, session, 30);
			cleanup();

			(
				session.mediaEvents.volumeChange as ReturnType<typeof vi.fn>
			).mockClear();

			el.dispatchEvent(new Event("volumechange"));

			expect(session.mediaEvents.volumeChange).not.toHaveBeenCalled();
		});
	});
});
