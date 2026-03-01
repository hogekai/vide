import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { ERR_IMA_SDK_LOAD } from "../../src/errors.js";
import type { Player } from "../../src/types.js";

// Mock the loader to avoid actual script injection
vi.mock("../../src/ima/loader.js", () => ({
	loadImaSdk: vi.fn(),
	getImaNamespace: vi.fn(() => null),
}));

import { ima } from "../../src/ima/index.js";
import { loadImaSdk } from "../../src/ima/loader.js";

const mockedLoadImaSdk = vi.mocked(loadImaSdk);

function createMockImaNamespace() {
	const adsManagerHandlers = new Map<string, ((e: unknown) => void)[]>();
	const adsLoaderHandlers = new Map<string, ((e: unknown) => void)[]>();

	const mockAdsManager = {
		addEventListener(event: string, handler: (e: unknown) => void) {
			const list = adsManagerHandlers.get(event) ?? [];
			list.push(handler);
			adsManagerHandlers.set(event, list);
		},
		init: vi.fn(),
		start: vi.fn(),
		pause: vi.fn(),
		resume: vi.fn(),
		skip: vi.fn(),
		stop: vi.fn(),
		resize: vi.fn(),
		destroy: vi.fn(),
		setVolume: vi.fn(),
		getVolume: vi.fn(() => 1),
		getRemainingTime: vi.fn(() => 10),
		getAdSkippableState: vi.fn(() => false),
		getCurrentAd: vi.fn(() => null),
	};

	const mockAdsLoader = {
		addEventListener(event: string, handler: (e: unknown) => void) {
			const list = adsLoaderHandlers.get(event) ?? [];
			list.push(handler);
			adsLoaderHandlers.set(event, list);
		},
		removeEventListener: vi.fn(),
		requestAds: vi.fn(),
		contentComplete: vi.fn(),
		destroy: vi.fn(),
	};

	const mockAdDisplayContainer = {
		initialize: vi.fn(),
		destroy: vi.fn(),
	};

	const sdk = {
		AdDisplayContainer: vi.fn(() => mockAdDisplayContainer),
		AdsLoader: vi.fn(() => mockAdsLoader),
		AdsRequest: vi.fn(() => ({
			adTagUrl: "",
			linearAdSlotWidth: 0,
			linearAdSlotHeight: 0,
			nonLinearAdSlotWidth: 0,
			nonLinearAdSlotHeight: 0,
		})),
		AdsRenderingSettings: vi.fn(() => ({})),
		AdsManagerLoadedEvent: {
			Type: { ADS_MANAGER_LOADED: "adsManagerLoaded" },
		},
		AdErrorEvent: { Type: { AD_ERROR: "adError" } },
		AdEvent: {
			Type: {
				LOADED: "loaded",
				STARTED: "started",
				FIRST_QUARTILE: "firstQuartile",
				MIDPOINT: "midpoint",
				THIRD_QUARTILE: "thirdQuartile",
				COMPLETE: "complete",
				PAUSED: "paused",
				RESUMED: "resumed",
				SKIPPED: "skipped",
				CLICK: "click",
				ALL_ADS_COMPLETED: "allAdsCompleted",
				CONTENT_PAUSE_REQUESTED: "contentPauseRequested",
				CONTENT_RESUME_REQUESTED: "contentResumeRequested",
				AD_BUFFERING: "adBuffering",
				LOG: "log",
				IMPRESSION: "impression",
				VOLUME_CHANGED: "volumeChanged",
				VOLUME_MUTED: "volumeMuted",
			},
		},
		ViewMode: { NORMAL: "normal", FULLSCREEN: "fullscreen" },
		settings: {
			setLocale: vi.fn(),
			setDisableCustomPlaybackForIOS10Plus: vi.fn(),
		},
	};

	return {
		sdk,
		mockAdsManager,
		mockAdsLoader,
		mockAdDisplayContainer,
		adsManagerHandlers,
		adsLoaderHandlers,
		fireAdsManagerLoaded() {
			for (const h of adsLoaderHandlers.get("adsManagerLoaded") ?? []) {
				h({
					getAdsManager: () => mockAdsManager,
				});
			}
		},
	};
}

let player: Player;
let adContainer: HTMLElement;

beforeEach(() => {
	vi.clearAllMocks();
	const video = document.createElement("video");
	const parent = document.createElement("div");
	adContainer = document.createElement("div");
	parent.appendChild(video);
	parent.appendChild(adContainer);
	document.body.appendChild(parent);
	player = createPlayer(video);
});

afterEach(() => {
	player.destroy();
});

describe("ima plugin", () => {
	it("loads SDK when player is ready", async () => {
		const mock = createMockImaNamespace();
		mockedLoadImaSdk.mockResolvedValue(mock.sdk as never);

		player.use(ima({ adTagUrl: "https://example.com/vast.xml", adContainer }));

		// Plugin waits for ready state — fire it
		player.emit("statechange", { from: "idle", to: "ready" });
		await vi.waitFor(() => {
			expect(mockedLoadImaSdk).toHaveBeenCalled();
		});
	});

	it("requests ads after SDK loads", async () => {
		const mock = createMockImaNamespace();
		mockedLoadImaSdk.mockResolvedValue(mock.sdk as never);

		player.use(ima({ adTagUrl: "https://example.com/vast.xml", adContainer }));
		player.emit("statechange", { from: "idle", to: "ready" });

		await vi.waitFor(() => {
			expect(mock.mockAdsLoader.requestAds).toHaveBeenCalled();
		});
	});

	it("initializes and starts adsManager on ADS_MANAGER_LOADED", async () => {
		const mock = createMockImaNamespace();
		mockedLoadImaSdk.mockResolvedValue(mock.sdk as never);

		player.use(ima({ adTagUrl: "https://example.com/vast.xml", adContainer }));
		player.emit("statechange", { from: "idle", to: "ready" });

		await vi.waitFor(() => {
			expect(mock.mockAdsLoader.requestAds).toHaveBeenCalled();
		});

		mock.fireAdsManagerLoaded();

		expect(mock.mockAdDisplayContainer.initialize).toHaveBeenCalled();
		expect(mock.mockAdsManager.init).toHaveBeenCalled();
		expect(mock.mockAdsManager.start).toHaveBeenCalled();
	});

	it("does not start adsManager when autoplayAdBreaks is false", async () => {
		const mock = createMockImaNamespace();
		mockedLoadImaSdk.mockResolvedValue(mock.sdk as never);

		player.use(
			ima({
				adTagUrl: "https://example.com/vast.xml",
				adContainer,
				autoplayAdBreaks: false,
			}),
		);
		player.emit("statechange", { from: "idle", to: "ready" });

		await vi.waitFor(() => {
			expect(mock.mockAdsLoader.requestAds).toHaveBeenCalled();
		});

		mock.fireAdsManagerLoaded();

		expect(mock.mockAdsManager.init).toHaveBeenCalled();
		expect(mock.mockAdsManager.start).not.toHaveBeenCalled();
	});

	it("handles SDK load failure gracefully (ad blocker)", async () => {
		mockedLoadImaSdk.mockRejectedValue(new Error("IMA SDK script load failed"));

		const errors: { source: string; code?: number }[] = [];
		player.on("ad:error", (data) => errors.push({ source: data.source }));
		player.on("error", (data) =>
			errors.push({ source: data.source, code: data.code }),
		);

		player.use(ima({ adTagUrl: "https://example.com/vast.xml", adContainer }));
		player.emit("statechange", { from: "idle", to: "ready" });

		await vi.waitFor(() => {
			expect(errors.length).toBeGreaterThanOrEqual(1);
		});

		expect(errors.some((e) => e.source === "ima")).toBe(true);
		expect(errors.some((e) => e.code === ERR_IMA_SDK_LOAD)).toBe(true);
	});

	it("sets locale on SDK", async () => {
		const mock = createMockImaNamespace();
		mockedLoadImaSdk.mockResolvedValue(mock.sdk as never);

		player.use(
			ima({
				adTagUrl: "https://example.com/vast.xml",
				adContainer,
				locale: "ja",
			}),
		);
		player.emit("statechange", { from: "idle", to: "ready" });

		await vi.waitFor(() => {
			expect(mock.sdk.settings.setLocale).toHaveBeenCalledWith("ja");
		});
	});

	it("calls configureAdsRequest callback", async () => {
		const mock = createMockImaNamespace();
		mockedLoadImaSdk.mockResolvedValue(mock.sdk as never);
		const configure = vi.fn();

		player.use(
			ima({
				adTagUrl: "https://example.com/vast.xml",
				adContainer,
				configureAdsRequest: configure,
			}),
		);
		player.emit("statechange", { from: "idle", to: "ready" });

		await vi.waitFor(() => {
			expect(configure).toHaveBeenCalled();
		});
	});

	it("exposes pluginData with requestAds", async () => {
		const mock = createMockImaNamespace();
		mockedLoadImaSdk.mockResolvedValue(mock.sdk as never);

		player.use(ima({ adTagUrl: "https://example.com/vast.xml", adContainer }));
		player.emit("statechange", { from: "idle", to: "ready" });

		await vi.waitFor(() => {
			expect(mock.mockAdsLoader.requestAds).toHaveBeenCalled();
		});

		mock.fireAdsManagerLoaded();

		const data = player.getPluginData("ima") as {
			requestAds: (url?: string) => void;
		};
		expect(data).toBeDefined();
		expect(typeof data.requestAds).toBe("function");

		// Call requestAds with a different tag
		mock.mockAdsLoader.requestAds.mockClear();
		data.requestAds("https://example.com/other.xml");
		expect(mock.mockAdsLoader.requestAds).toHaveBeenCalled();
	});

	it("destroys adsManager on cleanup", async () => {
		const mock = createMockImaNamespace();
		mockedLoadImaSdk.mockResolvedValue(mock.sdk as never);

		player.use(ima({ adTagUrl: "https://example.com/vast.xml", adContainer }));
		player.emit("statechange", { from: "idle", to: "ready" });

		await vi.waitFor(() => {
			expect(mock.mockAdsLoader.requestAds).toHaveBeenCalled();
		});

		mock.fireAdsManagerLoaded();

		player.destroy();
		expect(mock.mockAdsManager.destroy).toHaveBeenCalled();
	});

	it("creates overlay inside adContainer for AdDisplayContainer", async () => {
		const mock = createMockImaNamespace();
		mockedLoadImaSdk.mockResolvedValue(mock.sdk as never);

		player.use(ima({ adTagUrl: "https://example.com/vast.xml", adContainer }));
		player.emit("statechange", { from: "idle", to: "ready" });

		await vi.waitFor(() => {
			expect(mock.sdk.AdDisplayContainer).toHaveBeenCalled();
		});

		// IMA receives the internal overlay div, not the user's container directly
		const overlay = adContainer.querySelector("[data-vide-ima]");
		expect(overlay).not.toBeNull();
		expect(mock.sdk.AdDisplayContainer).toHaveBeenCalledWith(
			overlay,
			player.el,
		);
	});

	it("notifies IMA on content ended for post-roll", async () => {
		const mock = createMockImaNamespace();
		mockedLoadImaSdk.mockResolvedValue(mock.sdk as never);

		player.use(ima({ adTagUrl: "https://example.com/vast.xml", adContainer }));
		player.emit("statechange", { from: "idle", to: "ready" });

		await vi.waitFor(() => {
			expect(mock.mockAdsLoader.requestAds).toHaveBeenCalled();
		});

		player.emit("ended" as never, undefined as never);

		expect(mock.mockAdsLoader.contentComplete).toHaveBeenCalled();
	});
});
