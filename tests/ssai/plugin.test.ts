import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { ssai } from "../../src/ssai/index.js";

// --- mock hls.js instance ---

function createMockHls() {
	const listeners = new Map<string, (...args: unknown[]) => void>();
	return {
		on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
			listeners.set(event, handler);
		}),
		off: vi.fn(),
		_fire(event: string, ...args: unknown[]) {
			listeners.get(event)?.(...args);
		},
	};
}

function createMockDash() {
	const listeners = new Map<string, (e: unknown) => void>();
	return {
		on: vi.fn((event: string, handler: (e: unknown) => void) => {
			listeners.set(event, handler);
		}),
		off: vi.fn(),
		_fire(event: string, data: unknown) {
			listeners.get(event)?.(data);
		},
	};
}

// --- helpers ---

function makeVideo(): HTMLVideoElement {
	const el = document.createElement("video");
	el.play = vi.fn().mockResolvedValue(undefined);
	el.pause = vi.fn();
	el.load = vi.fn();
	el.canPlayType = vi.fn().mockReturnValue("");
	return el;
}

function emitTimeUpdate(
	player: ReturnType<typeof createPlayer>,
	currentTime: number,
	duration = 600,
): void {
	player.emit("timeupdate", { currentTime, duration });
}

// Mock sendBeacon
const mockSendBeacon = vi.fn().mockReturnValue(true);

beforeEach(() => {
	vi.restoreAllMocks();
	Object.defineProperty(navigator, "sendBeacon", {
		value: mockSendBeacon,
		writable: true,
		configurable: true,
	});
	mockSendBeacon.mockClear();
});

describe("ssai plugin — HLS integration", () => {
	it("emits ad:breakStart and ad:start when currentTime reaches startTime", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const mockHls = createMockHls();
		player.setPluginData("hls", mockHls);
		player.use(ssai());

		// Inject a daterange ad break
		mockHls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: {
				dateRanges: {
					"ad-1": {
						attr: {
							ID: "ad-1",
							CLASS: "com.apple.hls.interstitial",
							"START-DATE": "1970-01-01T00:05:00Z",
							DURATION: "30",
						},
					},
				},
			},
		});

		const breakStartHandler = vi.fn();
		const adStartHandler = vi.fn();
		player.on("ad:breakStart", breakStartHandler);
		player.on("ad:start", adStartHandler);

		emitTimeUpdate(player, 300);

		expect(breakStartHandler).toHaveBeenCalledWith({ breakId: "ad-1" });
		expect(adStartHandler).toHaveBeenCalledWith({ adId: "ad-1" });
	});

	it("emits ad:end and ad:breakEnd when currentTime reaches startTime + duration", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const mockHls = createMockHls();
		player.setPluginData("hls", mockHls);
		player.use(ssai());

		mockHls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: {
				dateRanges: {
					"ad-1": {
						attr: {
							ID: "ad-1",
							CLASS: "com.apple.hls.interstitial",
							"START-DATE": "1970-01-01T00:05:00Z",
							DURATION: "30",
						},
					},
				},
			},
		});

		const adEndHandler = vi.fn();
		const breakEndHandler = vi.fn();
		player.on("ad:end", adEndHandler);
		player.on("ad:breakEnd", breakEndHandler);

		// Start the ad
		emitTimeUpdate(player, 300);
		// End the ad
		emitTimeUpdate(player, 330);

		expect(adEndHandler).toHaveBeenCalledWith({ adId: "ad-1" });
		expect(breakEndHandler).toHaveBeenCalledWith({ breakId: "ad-1" });
	});

	it("fires tracking URLs via track()", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const mockHls = createMockHls();
		player.setPluginData("hls", mockHls);
		player.use(ssai());

		// Use custom parser that returns tracking URLs
		const playerWithTracking = createPlayer(makeVideo());
		const mockHls2 = createMockHls();
		playerWithTracking.setPluginData("hls", mockHls2);
		playerWithTracking.use(
			ssai({
				parser: () => [
					{
						id: "tracked-ad",
						startTime: 100,
						duration: 30,
						trackingUrls: [
							"https://example.com/track1",
							"https://example.com/track2",
						],
					},
				],
			}),
		);

		mockHls2._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: {
				dateRanges: {
					"dr-1": {
						attr: { ID: "dr-1" },
					},
				},
			},
		});

		emitTimeUpdate(playerWithTracking, 100);

		expect(mockSendBeacon).toHaveBeenCalledWith("https://example.com/track1");
		expect(mockSendBeacon).toHaveBeenCalledWith("https://example.com/track2");
	});

	it("each ad break fires at most once", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const mockHls = createMockHls();
		player.setPluginData("hls", mockHls);
		player.use(ssai());

		mockHls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: {
				dateRanges: {
					"ad-1": {
						attr: {
							ID: "ad-1",
							CLASS: "com.apple.hls.interstitial",
							"START-DATE": "1970-01-01T00:05:00Z",
							DURATION: "30",
						},
					},
				},
			},
		});

		const adStartHandler = vi.fn();
		player.on("ad:start", adStartHandler);

		emitTimeUpdate(player, 300);
		emitTimeUpdate(player, 301);
		emitTimeUpdate(player, 310);

		expect(adStartHandler).toHaveBeenCalledTimes(1);
	});

	it("emits ad:impression on ad start", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const mockHls = createMockHls();
		player.setPluginData("hls", mockHls);
		player.use(ssai());

		mockHls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: {
				dateRanges: {
					"ad-1": {
						attr: {
							ID: "ad-1",
							CLASS: "com.apple.hls.interstitial",
							"START-DATE": "1970-01-01T00:05:00Z",
							DURATION: "30",
						},
					},
				},
			},
		});

		const impressionHandler = vi.fn();
		player.on("ad:impression", impressionHandler);

		emitTimeUpdate(player, 300);

		expect(impressionHandler).toHaveBeenCalledWith({ adId: "ad-1" });
	});
});

describe("ssai plugin — custom parser", () => {
	it("uses custom parser override", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const mockHls = createMockHls();
		player.setPluginData("hls", mockHls);

		const customParser = vi
			.fn()
			.mockReturnValue([{ id: "custom-ad", startTime: 50, duration: 10 }]);
		player.use(ssai({ parser: customParser }));

		mockHls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: {
				dateRanges: {
					"dr-1": {
						attr: { ID: "dr-1", CLASS: "vendor.custom" },
					},
				},
			},
		});

		expect(customParser).toHaveBeenCalledWith({
			source: "daterange",
			attributes: { ID: "dr-1", CLASS: "vendor.custom" },
		});

		const adStartHandler = vi.fn();
		player.on("ad:start", adStartHandler);
		emitTimeUpdate(player, 50);
		expect(adStartHandler).toHaveBeenCalledWith({ adId: "custom-ad" });
	});

	it("ignores when custom parser returns empty array", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const mockHls = createMockHls();
		player.setPluginData("hls", mockHls);

		player.use(ssai({ parser: () => [] }));

		mockHls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: {
				dateRanges: {
					"dr-1": {
						attr: { ID: "dr-1" },
					},
				},
			},
		});

		const adStartHandler = vi.fn();
		player.on("ad:start", adStartHandler);
		emitTimeUpdate(player, 0);
		emitTimeUpdate(player, 100);
		expect(adStartHandler).not.toHaveBeenCalled();
	});
});

describe("ssai plugin — DASH fallback", () => {
	it("attaches to DASH when HLS pluginData is absent", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const mockDash = createMockDash();
		player.setPluginData("dash", mockDash);
		player.use(ssai());

		expect(mockDash.on).toHaveBeenCalledWith(
			"eventModeOnReceive",
			expect.any(Function),
		);

		mockDash._fire("eventModeOnReceive", {
			event: {
				schemeIdUri: "urn:scte:scte35:2013:xml",
				value: "",
				calculatedPresentationTime: 200,
				duration: 15,
				id: "dash-ad-1",
			},
		});

		const adStartHandler = vi.fn();
		player.on("ad:start", adStartHandler);
		emitTimeUpdate(player, 200);
		expect(adStartHandler).toHaveBeenCalledWith({ adId: "dash-ad-1" });
	});
});

describe("ssai plugin — deferred attach", () => {
	it("attaches on statechange when instance not yet available", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(ssai());

		// Instance not yet available — set it now
		const mockHls = createMockHls();
		player.setPluginData("hls", mockHls);

		// Trigger statechange to cause attachment
		player.emit("statechange", { from: "idle", to: "loading" });

		// Now the monitor should be attached
		expect(mockHls.on).toHaveBeenCalledWith(
			"hlsLevelUpdated",
			expect.any(Function),
		);

		mockHls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: {
				dateRanges: {
					"ad-1": {
						attr: {
							ID: "ad-1",
							CLASS: "com.apple.hls.interstitial",
							"START-DATE": "1970-01-01T00:01:40Z",
							DURATION: "10",
						},
					},
				},
			},
		});

		const adStartHandler = vi.fn();
		player.on("ad:start", adStartHandler);
		emitTimeUpdate(player, 100);
		expect(adStartHandler).toHaveBeenCalledWith({ adId: "ad-1" });
	});
});

describe("ssai plugin — lifecycle", () => {
	it("does not fire events after destroy", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const mockHls = createMockHls();
		player.setPluginData("hls", mockHls);

		const cleanup = ssai().setup(player) as () => void;

		mockHls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: {
				dateRanges: {
					"ad-1": {
						attr: {
							ID: "ad-1",
							CLASS: "com.apple.hls.interstitial",
							"START-DATE": "1970-01-01T00:05:00Z",
							DURATION: "30",
						},
					},
				},
			},
		});

		cleanup();

		const adStartHandler = vi.fn();
		player.on("ad:start", adStartHandler);
		emitTimeUpdate(player, 300);
		expect(adStartHandler).not.toHaveBeenCalled();
	});

	it("cleanup removes hls monitor subscriptions", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const mockHls = createMockHls();
		player.setPluginData("hls", mockHls);

		const cleanup = ssai().setup(player) as () => void;
		cleanup();

		expect(mockHls.off).toHaveBeenCalledWith(
			"hlsLevelUpdated",
			expect.any(Function),
		);
		expect(mockHls.off).toHaveBeenCalledWith(
			"hlsFragParsingMetadata",
			expect.any(Function),
		);
	});
});

describe("ssai plugin — tolerance", () => {
	it("custom tolerance adjusts matching window", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const mockHls = createMockHls();
		player.setPluginData("hls", mockHls);
		player.use(ssai({ tolerance: 1.0 }));

		mockHls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: {
				dateRanges: {
					"ad-1": {
						attr: {
							ID: "ad-1",
							CLASS: "com.apple.hls.interstitial",
							"START-DATE": "1970-01-01T00:05:00Z",
							DURATION: "30",
						},
					},
				},
			},
		});

		const adStartHandler = vi.fn();
		player.on("ad:start", adStartHandler);

		// At tolerance=1.0, ad should fire at 300-1.0 = 299
		emitTimeUpdate(player, 299);
		expect(adStartHandler).toHaveBeenCalledTimes(1);
	});

	it("default tolerance fires within 0.5s", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const mockHls = createMockHls();
		player.setPluginData("hls", mockHls);
		player.use(ssai());

		mockHls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: {
				dateRanges: {
					"ad-1": {
						attr: {
							ID: "ad-1",
							CLASS: "com.apple.hls.interstitial",
							"START-DATE": "1970-01-01T00:05:00Z",
							DURATION: "30",
						},
					},
				},
			},
		});

		const adStartHandler = vi.fn();
		player.on("ad:start", adStartHandler);

		// 299.4 is within 0.5s tolerance of 300
		emitTimeUpdate(player, 299.4);
		expect(adStartHandler).not.toHaveBeenCalled();

		emitTimeUpdate(player, 299.6);
		expect(adStartHandler).toHaveBeenCalledTimes(1);
	});
});

describe("ssai plugin — structured tracking", () => {
	function setupWithTracking(tracking: Record<string, string[]>) {
		const el = makeVideo();
		const player = createPlayer(el);
		const mockHls = createMockHls();
		player.setPluginData("hls", mockHls);
		player.use(
			ssai({
				parser: () => [
					{
						id: "ad-1",
						startTime: 100,
						duration: 40,
						tracking,
					},
				],
			}),
		);
		// Trigger metadata ingestion
		mockHls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: { dateRanges: { dr: { attr: { ID: "dr" } } } },
		});
		return player;
	}

	it("fires tracking.impression at ad:start", () => {
		const player = setupWithTracking({
			impression: ["https://example.com/imp"],
		});
		emitTimeUpdate(player, 100);
		expect(mockSendBeacon).toHaveBeenCalledWith("https://example.com/imp");
	});

	it("fires tracking.start at ad:start via quartile tracker", () => {
		const player = setupWithTracking({
			start: ["https://example.com/start"],
		});
		emitTimeUpdate(player, 100);
		expect(mockSendBeacon).toHaveBeenCalledWith("https://example.com/start");
	});

	it("fires tracking.firstQuartile at 25% of ad duration", () => {
		const player = setupWithTracking({
			firstQuartile: ["https://example.com/q1"],
		});
		emitTimeUpdate(player, 100); // ad:start
		mockSendBeacon.mockClear();
		emitTimeUpdate(player, 110); // 25% of 40s
		expect(mockSendBeacon).toHaveBeenCalledWith("https://example.com/q1");
	});

	it("fires tracking.midpoint at 50% of ad duration", () => {
		const player = setupWithTracking({
			midpoint: ["https://example.com/mid"],
		});
		emitTimeUpdate(player, 100);
		mockSendBeacon.mockClear();
		emitTimeUpdate(player, 120); // 50% of 40s
		expect(mockSendBeacon).toHaveBeenCalledWith("https://example.com/mid");
	});

	it("fires tracking.thirdQuartile at 75% of ad duration", () => {
		const player = setupWithTracking({
			thirdQuartile: ["https://example.com/q3"],
		});
		emitTimeUpdate(player, 100);
		mockSendBeacon.mockClear();
		emitTimeUpdate(player, 130); // 75% of 40s
		expect(mockSendBeacon).toHaveBeenCalledWith("https://example.com/q3");
	});

	it("fires tracking.complete at 100% of ad duration", () => {
		const player = setupWithTracking({
			complete: ["https://example.com/complete"],
		});
		emitTimeUpdate(player, 100);
		mockSendBeacon.mockClear();
		emitTimeUpdate(player, 140); // 100% of 40s
		expect(mockSendBeacon).toHaveBeenCalledWith("https://example.com/complete");
	});

	it("emits ad:quartile events at each quartile", () => {
		const player = setupWithTracking({});
		const handler = vi.fn();
		player.on("ad:quartile", handler);

		emitTimeUpdate(player, 100); // start
		emitTimeUpdate(player, 110); // firstQuartile
		emitTimeUpdate(player, 120); // midpoint
		emitTimeUpdate(player, 130); // thirdQuartile
		emitTimeUpdate(player, 140); // complete

		expect(handler).toHaveBeenCalledWith({
			adId: "ad-1",
			quartile: "start",
		});
		expect(handler).toHaveBeenCalledWith({
			adId: "ad-1",
			quartile: "firstQuartile",
		});
		expect(handler).toHaveBeenCalledWith({
			adId: "ad-1",
			quartile: "midpoint",
		});
		expect(handler).toHaveBeenCalledWith({
			adId: "ad-1",
			quartile: "thirdQuartile",
		});
		expect(handler).toHaveBeenCalledWith({
			adId: "ad-1",
			quartile: "complete",
		});
	});

	it("each quartile fires only once", () => {
		const player = setupWithTracking({
			firstQuartile: ["https://example.com/q1"],
		});
		emitTimeUpdate(player, 100);
		mockSendBeacon.mockClear();
		emitTimeUpdate(player, 110);
		emitTimeUpdate(player, 111);
		emitTimeUpdate(player, 112);
		expect(mockSendBeacon).toHaveBeenCalledTimes(1);
	});

	it("does not error when tracking is not set", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const mockHls = createMockHls();
		player.setPluginData("hls", mockHls);
		player.use(
			ssai({
				parser: () => [{ id: "ad-1", startTime: 100, duration: 30 }],
			}),
		);
		mockHls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: { dateRanges: { dr: { attr: { ID: "dr" } } } },
		});

		// Should not throw
		emitTimeUpdate(player, 100);
		emitTimeUpdate(player, 130);
		expect(mockSendBeacon).not.toHaveBeenCalled();
	});
});

describe("ssai plugin — backward compatibility", () => {
	it("trackingUrls fires as impression tracking", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const mockHls = createMockHls();
		player.setPluginData("hls", mockHls);
		player.use(
			ssai({
				parser: () => [
					{
						id: "ad-1",
						startTime: 100,
						duration: 30,
						trackingUrls: ["https://example.com/legacy"],
					},
				],
			}),
		);
		mockHls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: { dateRanges: { dr: { attr: { ID: "dr" } } } },
		});

		emitTimeUpdate(player, 100);
		expect(mockSendBeacon).toHaveBeenCalledWith("https://example.com/legacy");
	});

	it("merges trackingUrls with tracking.impression", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const mockHls = createMockHls();
		player.setPluginData("hls", mockHls);
		player.use(
			ssai({
				parser: () => [
					{
						id: "ad-1",
						startTime: 100,
						duration: 30,
						trackingUrls: ["https://example.com/legacy"],
						tracking: {
							impression: ["https://example.com/new"],
						},
					},
				],
			}),
		);
		mockHls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: { dateRanges: { dr: { attr: { ID: "dr" } } } },
		});

		emitTimeUpdate(player, 100);
		expect(mockSendBeacon).toHaveBeenCalledWith("https://example.com/new");
		expect(mockSendBeacon).toHaveBeenCalledWith("https://example.com/legacy");
	});
});

describe("ssai plugin — pause/resume tracking", () => {
	function setupWithTracking(tracking: Record<string, string[]>) {
		const el = makeVideo();
		const player = createPlayer(el);
		const mockHls = createMockHls();
		player.setPluginData("hls", mockHls);
		player.use(
			ssai({
				parser: () => [
					{
						id: "ad-1",
						startTime: 100,
						duration: 40,
						tracking,
					},
				],
			}),
		);
		mockHls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: { dateRanges: { dr: { attr: { ID: "dr" } } } },
		});
		return player;
	}

	it("fires pause tracking URLs when paused during ad", () => {
		const player = setupWithTracking({
			pause: ["https://example.com/pause"],
		});
		emitTimeUpdate(player, 100); // start ad
		mockSendBeacon.mockClear();
		player.emit("pause", undefined);
		expect(mockSendBeacon).toHaveBeenCalledWith("https://example.com/pause");
	});

	it("fires resume tracking URLs when resumed during ad", () => {
		const player = setupWithTracking({
			resume: ["https://example.com/resume"],
		});
		emitTimeUpdate(player, 100); // start ad
		mockSendBeacon.mockClear();
		player.emit("play", undefined);
		expect(mockSendBeacon).toHaveBeenCalledWith("https://example.com/resume");
	});

	it("does not fire pause/resume when not in ad break", () => {
		const player = setupWithTracking({
			pause: ["https://example.com/pause"],
			resume: ["https://example.com/resume"],
		});
		// No ad started yet
		player.emit("pause", undefined);
		player.emit("play", undefined);
		expect(mockSendBeacon).not.toHaveBeenCalled();
	});

	it("does not fire pause/resume after ad ends", () => {
		const player = setupWithTracking({
			pause: ["https://example.com/pause"],
		});
		emitTimeUpdate(player, 100); // start ad
		emitTimeUpdate(player, 140); // end ad
		mockSendBeacon.mockClear();
		player.emit("pause", undefined);
		expect(mockSendBeacon).not.toHaveBeenCalled();
	});
});

describe("ssai plugin — skip tracking", () => {
	it("fires skip tracking URLs on ad:skip", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const mockHls = createMockHls();
		player.setPluginData("hls", mockHls);
		player.use(
			ssai({
				parser: () => [
					{
						id: "ad-1",
						startTime: 100,
						duration: 40,
						tracking: {
							skip: ["https://example.com/skip"],
							complete: ["https://example.com/complete"],
						},
					},
				],
			}),
		);
		mockHls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: { dateRanges: { dr: { attr: { ID: "dr" } } } },
		});

		emitTimeUpdate(player, 100); // start ad
		mockSendBeacon.mockClear();
		player.emit("ad:skip", { adId: "ad-1" });

		expect(mockSendBeacon).toHaveBeenCalledWith("https://example.com/skip");
	});

	it("does not fire complete on skip", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const mockHls = createMockHls();
		player.setPluginData("hls", mockHls);
		player.use(
			ssai({
				parser: () => [
					{
						id: "ad-1",
						startTime: 100,
						duration: 40,
						tracking: {
							skip: ["https://example.com/skip"],
							complete: ["https://example.com/complete"],
						},
					},
				],
			}),
		);
		mockHls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: { dateRanges: { dr: { attr: { ID: "dr" } } } },
		});

		emitTimeUpdate(player, 100); // start ad
		emitTimeUpdate(player, 120); // midpoint
		mockSendBeacon.mockClear();
		player.emit("ad:skip", { adId: "ad-1" });
		emitTimeUpdate(player, 140); // would be complete

		expect(mockSendBeacon).toHaveBeenCalledWith("https://example.com/skip");
		expect(mockSendBeacon).not.toHaveBeenCalledWith(
			"https://example.com/complete",
		);
	});

	it("emits ad:end and ad:breakEnd on skip", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const mockHls = createMockHls();
		player.setPluginData("hls", mockHls);
		player.use(
			ssai({
				parser: () => [
					{
						id: "ad-1",
						startTime: 100,
						duration: 40,
						tracking: {},
					},
				],
			}),
		);
		mockHls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: { dateRanges: { dr: { attr: { ID: "dr" } } } },
		});

		const adEndHandler = vi.fn();
		const breakEndHandler = vi.fn();
		player.on("ad:end", adEndHandler);
		player.on("ad:breakEnd", breakEndHandler);

		emitTimeUpdate(player, 100);
		player.emit("ad:skip", { adId: "ad-1" });

		expect(adEndHandler).toHaveBeenCalledWith({ adId: "ad-1" });
		expect(breakEndHandler).toHaveBeenCalledWith({ breakId: "ad-1" });
	});
});

describe("ssai plugin — enhanced cleanup", () => {
	it("does not fire tracking after destroy", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const mockHls = createMockHls();
		player.setPluginData("hls", mockHls);

		const cleanup = ssai({
			parser: () => [
				{
					id: "ad-1",
					startTime: 100,
					duration: 40,
					tracking: {
						impression: ["https://example.com/imp"],
						pause: ["https://example.com/pause"],
					},
				},
			],
		}).setup(player) as () => void;

		mockHls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: { dateRanges: { dr: { attr: { ID: "dr" } } } },
		});

		cleanup();

		emitTimeUpdate(player, 100);
		player.emit("pause", undefined);
		player.emit("ad:skip", { adId: "ad-1" });
		expect(mockSendBeacon).not.toHaveBeenCalled();
	});
});
