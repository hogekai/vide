import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { createImaBridge } from "../../src/ima/bridge.js";
import type {
	ImaAd,
	ImaAdEvent,
	ImaAdPodInfo,
	ImaAdsManager,
	ImaNamespace,
} from "../../src/ima/types.js";
import type { Player, PluginPlayer } from "../../src/types.js";

// ── Helpers ─────────────────────────────────────────────────

type EventHandler = (event: ImaAdEvent) => void;

function createMockAdsManager(): ImaAdsManager & {
	handlers: Map<string, EventHandler[]>;
	fire(type: string, event?: Partial<ImaAdEvent>): void;
} {
	const handlers = new Map<string, EventHandler[]>();
	const manager = {
		handlers,
		addEventListener(event: string, handler: EventHandler) {
			const list = handlers.get(event) ?? [];
			list.push(handler);
			handlers.set(event, list);
		},
		fire(type: string, event?: Partial<ImaAdEvent>) {
			const ad: ImaAdEvent = {
				type,
				getAd: () => null,
				getAdData: () => null,
				...event,
			};
			for (const h of handlers.get(type) ?? []) {
				h(ad);
			}
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
	return manager;
}

function createMockAd(overrides?: Partial<ImaAd>): ImaAd {
	const podInfo: ImaAdPodInfo = {
		getAdPosition: () => 1,
		getTotalAds: () => 1,
		getPodIndex: () => 0,
		getTimeOffset: () => 0,
		getIsBumper: () => false,
	};
	return {
		getAdId: () => "ad-1",
		getTitle: () => "Test Ad",
		getDuration: () => 30,
		getSkipTimeOffset: () => -1,
		getAdPodInfo: () => podInfo,
		isLinear: () => true,
		isSkippable: () => false,
		getClickThroughUrl: () => "https://example.com",
		getContentType: () => "video/mp4",
		...overrides,
	};
}

const mockIma: ImaNamespace = {
	AdDisplayContainer: vi.fn() as unknown as ImaNamespace["AdDisplayContainer"],
	AdsLoader: vi.fn() as unknown as ImaNamespace["AdsLoader"],
	AdsRequest: vi.fn() as unknown as ImaNamespace["AdsRequest"],
	AdsRenderingSettings:
		vi.fn() as unknown as ImaNamespace["AdsRenderingSettings"],
	AdsManagerLoadedEvent: { Type: { ADS_MANAGER_LOADED: "adsManagerLoaded" } },
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
	settings: { setLocale: vi.fn() },
};

let player: Player;
let pluginPlayer: PluginPlayer;
let adsManager: ReturnType<typeof createMockAdsManager>;
let cleanup: () => void;

beforeEach(() => {
	const video = document.createElement("video");
	document.body.appendChild(video);
	player = createPlayer(video);
	pluginPlayer = player as PluginPlayer;
	adsManager = createMockAdsManager();
	cleanup = createImaBridge({
		player: pluginPlayer,
		adsManager,
		ima: mockIma,
	});
});

afterEach(() => {
	cleanup();
	player.destroy();
});

describe("createImaBridge", () => {
	it("maps CONTENT_PAUSE_REQUESTED to ad:breakStart and ad:loading state", () => {
		const events: string[] = [];
		player.on("ad:breakStart", () => events.push("ad:breakStart"));
		player.on("statechange", ({ to }) => events.push(`state:${to}`));

		// Need to be in a valid state first
		(pluginPlayer as PluginPlayer).setState("ready");
		(pluginPlayer as PluginPlayer).setState("playing");

		adsManager.fire("contentPauseRequested");

		expect(events).toContain("ad:breakStart");
		expect(player.state).toBe("ad:loading");
	});

	it("maps STARTED to ad:start with ad metadata", () => {
		const events: { adId: string; duration?: number }[] = [];
		player.on("ad:start", (data) => events.push(data));

		const ad = createMockAd();
		(pluginPlayer as PluginPlayer).setState("ready");
		(pluginPlayer as PluginPlayer).setState("playing");
		(pluginPlayer as PluginPlayer).setState("ad:loading");

		adsManager.fire("started", { getAd: () => ad });

		expect(events).toHaveLength(1);
		expect(events[0].adId).toBe("ad-1");
		expect(events[0].duration).toBe(30);
		expect(player.state).toBe("ad:playing");
	});

	it("maps quartile events", () => {
		const quartiles: string[] = [];
		player.on("ad:quartile", ({ quartile }) => quartiles.push(quartile));

		(pluginPlayer as PluginPlayer).setState("ready");
		(pluginPlayer as PluginPlayer).setState("playing");
		(pluginPlayer as PluginPlayer).setState("ad:loading");
		(pluginPlayer as PluginPlayer).setState("ad:playing");

		adsManager.fire("firstQuartile");
		adsManager.fire("midpoint");
		adsManager.fire("thirdQuartile");

		expect(quartiles).toEqual(["firstQuartile", "midpoint", "thirdQuartile"]);
	});

	it("maps COMPLETE to ad:quartile(complete) + ad:end", () => {
		const events: string[] = [];
		player.on("ad:quartile", ({ quartile }) =>
			events.push(`quartile:${quartile}`),
		);
		player.on("ad:end", () => events.push("ad:end"));

		(pluginPlayer as PluginPlayer).setState("ready");
		(pluginPlayer as PluginPlayer).setState("playing");
		(pluginPlayer as PluginPlayer).setState("ad:loading");
		(pluginPlayer as PluginPlayer).setState("ad:playing");

		adsManager.fire("complete");

		expect(events).toContain("quartile:complete");
		expect(events).toContain("ad:end");
	});

	it("maps PAUSED/RESUMED to ad:paused/ad:playing state", () => {
		(pluginPlayer as PluginPlayer).setState("ready");
		(pluginPlayer as PluginPlayer).setState("playing");
		(pluginPlayer as PluginPlayer).setState("ad:loading");
		(pluginPlayer as PluginPlayer).setState("ad:playing");

		adsManager.fire("paused");
		expect(player.state).toBe("ad:paused");

		adsManager.fire("resumed");
		expect(player.state).toBe("ad:playing");
	});

	it("maps SKIPPED to ad:skip + ad:end", () => {
		const events: string[] = [];
		player.on("ad:skip", () => events.push("ad:skip"));
		player.on("ad:end", () => events.push("ad:end"));

		(pluginPlayer as PluginPlayer).setState("ready");
		(pluginPlayer as PluginPlayer).setState("playing");
		(pluginPlayer as PluginPlayer).setState("ad:loading");
		(pluginPlayer as PluginPlayer).setState("ad:playing");

		adsManager.fire("skipped");

		expect(events).toContain("ad:skip");
		expect(events).toContain("ad:end");
	});

	it("maps CLICK to ad:click", () => {
		const clicks: { clickThrough: string | undefined }[] = [];
		player.on("ad:click", (data) => clicks.push(data));

		const ad = createMockAd();
		adsManager.getCurrentAd.mockReturnValue(ad);

		adsManager.fire("click");

		expect(clicks).toHaveLength(1);
		expect(clicks[0].clickThrough).toBe("https://example.com");
	});

	it("maps CONTENT_RESUME_REQUESTED to ad:breakEnd and playing state", () => {
		const events: string[] = [];
		player.on("ad:breakEnd", () => events.push("ad:breakEnd"));

		(pluginPlayer as PluginPlayer).setState("ready");
		(pluginPlayer as PluginPlayer).setState("playing");
		(pluginPlayer as PluginPlayer).setState("ad:loading");
		(pluginPlayer as PluginPlayer).setState("ad:playing");

		adsManager.fire("contentResumeRequested");

		expect(events).toContain("ad:breakEnd");
		expect(player.state).toBe("playing");
	});

	it("forwards vide ad:skip to adsManager.skip()", () => {
		player.emit("ad:skip", { adId: "ad-1" });
		expect(adsManager.skip).toHaveBeenCalled();
	});

	it("emits pod events for multi-ad pods", () => {
		const podEvents: string[] = [];
		player.on("ad:pod:start", () => podEvents.push("pod:start"));
		player.on("ad:pod:adstart", () => podEvents.push("pod:adstart"));

		const podInfo: ImaAdPodInfo = {
			getAdPosition: () => 1,
			getTotalAds: () => 3,
			getPodIndex: () => 0,
			getTimeOffset: () => 0,
			getIsBumper: () => false,
		};
		const ad = createMockAd({ getAdPodInfo: () => podInfo });

		(pluginPlayer as PluginPlayer).setState("ready");
		(pluginPlayer as PluginPlayer).setState("playing");
		(pluginPlayer as PluginPlayer).setState("ad:loading");

		adsManager.fire("started", { getAd: () => ad });

		expect(podEvents).toContain("pod:start");
		expect(podEvents).toContain("pod:adstart");
	});

	it("emits ad:pod:end when last pod ad completes", () => {
		const podEvents: string[] = [];
		player.on("ad:pod:adend", () => podEvents.push("pod:adend"));
		player.on("ad:pod:end", () => podEvents.push("pod:end"));

		const podInfo: ImaAdPodInfo = {
			getAdPosition: () => 2,
			getTotalAds: () => 2,
			getPodIndex: () => 0,
			getTimeOffset: () => 0,
			getIsBumper: () => false,
		};
		const ad = createMockAd({ getAdPodInfo: () => podInfo });
		adsManager.getCurrentAd.mockReturnValue(ad);

		(pluginPlayer as PluginPlayer).setState("ready");
		(pluginPlayer as PluginPlayer).setState("playing");
		(pluginPlayer as PluginPlayer).setState("ad:loading");
		(pluginPlayer as PluginPlayer).setState("ad:playing");

		adsManager.fire("complete");

		expect(podEvents).toContain("pod:adend");
		expect(podEvents).toContain("pod:end");
	});

	it("maps VOLUME_CHANGED to ad:volumeChange + ad:mute/unmute", () => {
		const events: string[] = [];
		player.on("ad:volumeChange", () => events.push("volumeChange"));
		player.on("ad:mute", () => events.push("mute"));
		player.on("ad:unmute", () => events.push("unmute"));

		// Volume goes to 0 (mute)
		adsManager.getVolume.mockReturnValue(0);
		adsManager.fire("volumeChanged");
		expect(events).toContain("mute");
		expect(events).toContain("volumeChange");

		events.length = 0;

		// Volume restored (unmute)
		adsManager.getVolume.mockReturnValue(0.8);
		adsManager.fire("volumeChanged");
		expect(events).toContain("unmute");
		expect(events).toContain("volumeChange");
	});

	it("cleanup removes event listeners", () => {
		cleanup();

		// After cleanup, ad:skip should not forward to adsManager
		adsManager.skip.mockClear();
		player.emit("ad:skip", { adId: "ad-1" });
		expect(adsManager.skip).not.toHaveBeenCalled();
	});
});
