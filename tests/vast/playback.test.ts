import { describe, expect, it, vi } from "vitest";
import { playSingleAd } from "../../src/vast/playback.js";
import type {
	VastAd,
	VastCompanionAds,
	VastLinear,
	VastNonLinearAds,
	VastTrackingEvents,
} from "../../src/vast/types.js";

type Handler = (...args: unknown[]) => void;

function emptyTracking(): VastTrackingEvents {
	return {
		start: [],
		firstQuartile: [],
		midpoint: [],
		thirdQuartile: [],
		complete: [],
		pause: [],
		resume: [],
		skip: [],
		loaded: [],
		mute: [],
		unmute: [],
		rewind: [],
		playerExpand: [],
		playerCollapse: [],
		closeLinear: [],
		notUsed: [],
		otherAdInteraction: [],
		creativeView: [],
		progress: [],
	};
}

function makeAd(
	id: string,
	companionAds?: VastCompanionAds,
	nonLinearAds?: VastNonLinearAds,
): VastAd {
	const hasCreatives = companionAds || nonLinearAds;
	return {
		id,
		sequence: undefined,
		adSystem: "test",
		adTitle: `Ad ${id}`,
		impressions: [`http://example.com/imp/${id}`],
		creatives: hasCreatives
			? [{ linear: null, companionAds, nonLinearAds }]
			: [],
		errors: [],
	};
}

function makeLinear(): VastLinear {
	return {
		duration: 30,
		mediaFiles: [
			{
				url: "http://example.com/ad.mp4",
				mimeType: "video/mp4",
				width: 640,
				height: 360,
				delivery: "progressive" as const,
			},
		],
		interactiveCreativeFiles: [],
		trackingEvents: emptyTracking(),
		clickTracking: [],
	};
}

function createMockPlayer() {
	const playerListeners = new Map<string, Set<Handler>>();
	const elListeners = new Map<string, Set<Handler>>();
	let _state = "playing";
	let _src = "";

	const el = {
		get src() {
			return _src;
		},
		set src(v: string) {
			_src = v;
		},
		load: vi.fn(),
		play: vi.fn().mockResolvedValue(undefined),
		muted: false,
		volume: 1,
		currentTime: 0,
		addEventListener(event: string, handler: Handler) {
			if (!elListeners.has(event)) elListeners.set(event, new Set());
			elListeners.get(event)!.add(handler);
		},
		removeEventListener(event: string, handler: Handler) {
			elListeners.get(event)?.delete(handler);
		},
		/** Fire an event on the element for testing. */
		_fire(event: string, data?: unknown) {
			const set = elListeners.get(event);
			if (!set) return;
			for (const handler of set) handler(data);
		},
		_listenerCount(event: string) {
			return elListeners.get(event)?.size ?? 0;
		},
	};

	const emitted: Array<{ event: string; data: unknown }> = [];

	const player = {
		el,
		get state() {
			return _state;
		},
		get src() {
			return _src;
		},
		set src(v: string) {
			_src = v;
		},
		_setState(s: string) {
			_state = s;
		},
		emit(event: string, data: unknown) {
			emitted.push({ event, data });
			// Also fire to player listeners
			const set = playerListeners.get(event);
			if (!set) return;
			for (const handler of set) handler(data);
		},
		on(event: string, handler: Handler) {
			if (!playerListeners.has(event)) playerListeners.set(event, new Set());
			playerListeners.get(event)!.add(handler);
		},
		off(event: string, handler: Handler) {
			playerListeners.get(event)?.delete(handler);
		},
		play: vi.fn().mockResolvedValue(undefined),
		emitted,
	};

	return player;
}

describe("playSingleAd", () => {
	it("plays ad to completion", async () => {
		const player = createMockPlayer();

		const { promise } = playSingleAd({
			player: player as any,
			ad: makeAd("ad-1"),
			linear: makeLinear(),
			source: "vast",
		});

		// Should transition to ad:loading
		expect(player.state).toBe("ad:loading");

		// Simulate canplay
		player.el._fire("canplay");
		expect(player.state).toBe("ad:playing");

		// Simulate ended
		player.el._fire("ended");

		const result = await promise;
		expect(result.outcome).toBe("completed");
		expect(result.adId).toBe("ad-1");
	});

	it("emits ad:start and ad:end events", async () => {
		const player = createMockPlayer();

		const { promise } = playSingleAd({
			player: player as any,
			ad: makeAd("ad-1"),
			linear: makeLinear(),
			source: "vast",
		});

		player.el._fire("canplay");
		player.el._fire("ended");
		await promise;

		const events = player.emitted.map((e) => e.event);
		expect(events).toContain("ad:start");
		expect(events).toContain("ad:impression");
		expect(events).toContain("ad:loaded");
		expect(events).toContain("ad:end");
	});

	it("resolves with skipped on ad:skip", async () => {
		const player = createMockPlayer();
		const linear = makeLinear();
		linear.trackingEvents.skip = ["http://example.com/skip"];

		const { promise } = playSingleAd({
			player: player as any,
			ad: makeAd("ad-1"),
			linear,
			source: "vast",
		});

		player.el._fire("canplay");

		// Emit ad:skip via player event bus
		player.emit("ad:skip", { adId: "ad-1" });

		const result = await promise;
		expect(result.outcome).toBe("skipped");
		expect(result.adId).toBe("ad-1");
	});

	it("resolves with error (load phase) on error before canplay", async () => {
		const player = createMockPlayer();

		const { promise } = playSingleAd({
			player: player as any,
			ad: makeAd("ad-1"),
			linear: makeLinear(),
			source: "vast",
		});

		// Error fires before canplay
		player.el._fire("error");

		const result = await promise;
		expect(result.outcome).toBe("error");
		expect(result.errorPhase).toBe("load");
	});

	it("resolves with error (playback phase) on error after canplay", async () => {
		const player = createMockPlayer();

		const { promise } = playSingleAd({
			player: player as any,
			ad: makeAd("ad-1"),
			linear: makeLinear(),
			source: "vast",
		});

		player.el._fire("canplay");
		player.el._fire("error");

		const result = await promise;
		expect(result.outcome).toBe("error");
		expect(result.errorPhase).toBe("playback");
	});

	it("resolves with error when no suitable media file", async () => {
		const player = createMockPlayer();
		const linear = makeLinear();
		linear.mediaFiles = []; // no media files

		const { promise } = playSingleAd({
			player: player as any,
			ad: makeAd("ad-1"),
			linear,
			source: "vast",
		});

		const result = await promise;
		expect(result.outcome).toBe("error");
		expect(result.errorPhase).toBe("load");
	});

	it("cleans up event listeners on completion", async () => {
		const player = createMockPlayer();

		const { promise } = playSingleAd({
			player: player as any,
			ad: makeAd("ad-1"),
			linear: makeLinear(),
			source: "vast",
		});

		player.el._fire("canplay");
		player.el._fire("ended");
		await promise;

		expect(player.el._listenerCount("timeupdate")).toBe(0);
		expect(player.el._listenerCount("ended")).toBe(0);
		expect(player.el._listenerCount("error")).toBe(0);
	});

	it("abort cleans up without resolving with error event", async () => {
		const player = createMockPlayer();

		const { abort } = playSingleAd({
			player: player as any,
			ad: makeAd("ad-1"),
			linear: makeLinear(),
			source: "vast",
		});

		abort();

		expect(player.el._listenerCount("timeupdate")).toBe(0);
		expect(player.el._listenerCount("ended")).toBe(0);
		expect(player.el._listenerCount("canplay")).toBe(0);
	});

	it("does not call setState playing on completion", async () => {
		const player = createMockPlayer();
		const states: string[] = [];
		const origSetState = player._setState.bind(player);
		player._setState = (s: string) => {
			states.push(s);
			origSetState(s);
		};

		const { promise } = playSingleAd({
			player: player as any,
			ad: makeAd("ad-1"),
			linear: makeLinear(),
			source: "vast",
		});

		player.el._fire("canplay");
		player.el._fire("ended");
		await promise;

		expect(states).toContain("ad:loading");
		expect(states).toContain("ad:playing");
		expect(states).not.toContain("playing");
	});

	it("calls adPlugins setup and cleanup", async () => {
		const player = createMockPlayer();
		const cleanup = vi.fn();
		const setup = vi.fn().mockReturnValue(cleanup);

		const { promise } = playSingleAd({
			player: player as any,
			ad: makeAd("ad-1"),
			linear: makeLinear(),
			source: "vast",
			adPlugins: () => [{ name: "test-plugin", setup }],
		});

		expect(setup).toHaveBeenCalledOnce();

		player.el._fire("canplay");
		player.el._fire("ended");
		await promise;

		expect(cleanup).toHaveBeenCalledOnce();
	});

	it("emits ad:companions when ad has companion creatives", async () => {
		const player = createMockPlayer();
		const companionAds: VastCompanionAds = {
			required: "all",
			companions: [
				{
					width: 300,
					height: 250,
					resources: [
						{
							type: "static",
							url: "http://example.com/banner.png",
							creativeType: "image/png",
						},
					],
					clickTracking: [],
					trackingEvents: { creativeView: ["http://example.com/view"] },
				},
			],
		};

		const { promise } = playSingleAd({
			player: player as any,
			ad: makeAd("ad-1", companionAds),
			linear: makeLinear(),
			source: "vast",
		});

		player.el._fire("canplay");
		player.el._fire("ended");
		await promise;

		const companionEvent = player.emitted.find(
			(e) => e.event === "ad:companions",
		);
		expect(companionEvent).toBeDefined();
		expect(companionEvent!.data).toEqual({
			adId: "ad-1",
			required: "all",
			companions: companionAds.companions,
		});
	});

	it("does not emit ad:companions when ad has no companion creatives", async () => {
		const player = createMockPlayer();

		const { promise } = playSingleAd({
			player: player as any,
			ad: makeAd("ad-1"),
			linear: makeLinear(),
			source: "vast",
		});

		player.el._fire("canplay");
		player.el._fire("ended");
		await promise;

		const companionEvent = player.emitted.find(
			(e) => e.event === "ad:companions",
		);
		expect(companionEvent).toBeUndefined();
	});

	it("emits ad:nonlinears when ad has nonLinear creatives", async () => {
		const player = createMockPlayer();
		const nonLinearAds: VastNonLinearAds = {
			trackingEvents: {
				creativeView: ["http://example.com/nlview"],
			},
			nonLinears: [
				{
					width: 468,
					height: 60,
					resources: [
						{
							type: "static",
							url: "http://example.com/overlay.png",
							creativeType: "image/png",
						},
					],
					clickTracking: [],
				},
			],
		};

		const { promise } = playSingleAd({
			player: player as any,
			ad: makeAd("ad-1", undefined, nonLinearAds),
			linear: makeLinear(),
			source: "vast",
		});

		player.el._fire("canplay");
		player.el._fire("ended");
		await promise;

		const nlEvent = player.emitted.find((e) => e.event === "ad:nonlinears");
		expect(nlEvent).toBeDefined();
		expect(nlEvent!.data).toEqual({
			adId: "ad-1",
			nonLinears: nonLinearAds.nonLinears,
			trackingEvents: nonLinearAds.trackingEvents,
		});
	});

	it("does not emit ad:nonlinears when ad has no nonLinear creatives", async () => {
		const player = createMockPlayer();

		const { promise } = playSingleAd({
			player: player as any,
			ad: makeAd("ad-1"),
			linear: makeLinear(),
			source: "vast",
		});

		player.el._fire("canplay");
		player.el._fire("ended");
		await promise;

		const nlEvent = player.emitted.find((e) => e.event === "ad:nonlinears");
		expect(nlEvent).toBeUndefined();
	});
});
