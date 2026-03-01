import { describe, expect, it, vi } from "vitest";
import { playPod, playWaterfall } from "../../src/vast/pod.js";
import type { PlayableAd } from "../../src/vast/pod.js";
import type {
	VastAd,
	VastLinear,
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

function makePlayableAd(id: string, sequence?: number): PlayableAd {
	const ad: VastAd = {
		id,
		sequence,
		adSystem: "test",
		adTitle: `Ad ${id}`,
		impressions: [],
		creatives: [],
		errors: [],
	};
	const linear: VastLinear = {
		duration: 15,
		mediaFiles: [
			{
				url: `http://example.com/${id}.mp4`,
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
	return { ad, linear };
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
		_fire(event: string, data?: unknown) {
			const set = elListeners.get(event);
			if (!set) return;
			for (const handler of [...set]) handler(data);
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
		setState(s: string) {
			_state = s;
		},
		emit(event: string, data: unknown) {
			emitted.push({ event, data });
			const set = playerListeners.get(event);
			if (!set) return;
			for (const handler of [...set]) handler(data);
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

/**
 * Helper: run a pod and simulate each ad completing via canplay + ended.
 * After each playSingleAd sets el.src and calls load(), we fire canplay then ended.
 */
function autoCompleteAds(player: ReturnType<typeof createMockPlayer>) {
	// Each time load is called, schedule canplay + ended
	player.el.load.mockImplementation(() => {
		queueMicrotask(() => {
			player.el._fire("canplay");
			queueMicrotask(() => {
				player.el._fire("ended");
			});
		});
	});
}

/**
 * Helper: make the Nth load call fire an error instead of completing.
 * @param failIndex 0-based index of the load call that should fail.
 */
function autoCompleteWithFailure(
	player: ReturnType<typeof createMockPlayer>,
	failIndex: number,
) {
	let callCount = 0;
	player.el.load.mockImplementation(() => {
		const currentCall = callCount++;
		queueMicrotask(() => {
			if (currentCall === failIndex) {
				player.el._fire("error");
			} else {
				player.el._fire("canplay");
				queueMicrotask(() => {
					player.el._fire("ended");
				});
			}
		});
	});
}

describe("playPod", () => {
	it("plays all ads in sequence and emits pod events", async () => {
		const player = createMockPlayer();
		autoCompleteAds(player);

		const ads = [
			makePlayableAd("a1", 1),
			makePlayableAd("a2", 2),
			makePlayableAd("a3", 3),
		];

		const result = await playPod(player as any, ads, { source: "vast" });

		expect(result.completed).toBe(3);
		expect(result.skipped).toBe(0);
		expect(result.failed).toBe(0);

		const events = player.emitted.map((e) => e.event);

		// Pod-level events
		expect(events[0]).toBe("ad:pod:start");
		expect(events[events.length - 1]).toBe("ad:pod:end");

		// Each ad should have pod:adstart and pod:adend
		const podAdStarts = player.emitted.filter(
			(e) => e.event === "ad:pod:adstart",
		);
		const podAdEnds = player.emitted.filter((e) => e.event === "ad:pod:adend");
		expect(podAdStarts).toHaveLength(3);
		expect(podAdEnds).toHaveLength(3);

		// Backward compat: ad:start and ad:end for each ad
		const adStarts = player.emitted.filter((e) => e.event === "ad:start");
		const adEnds = player.emitted.filter((e) => e.event === "ad:end");
		expect(adStarts).toHaveLength(3);
		expect(adEnds).toHaveLength(3);
	});

	it("continues when an ad fails", async () => {
		const player = createMockPlayer();
		autoCompleteWithFailure(player, 1); // Second ad fails

		const ads = [
			makePlayableAd("a1", 1),
			makePlayableAd("a2", 2),
			makePlayableAd("a3", 3),
		];

		const result = await playPod(player as any, ads, { source: "vast" });

		expect(result.completed).toBe(2);
		expect(result.failed).toBe(1);
	});

	it("continues when an ad is skipped", async () => {
		const player = createMockPlayer();
		let callCount = 0;
		player.el.load.mockImplementation(() => {
			const currentCall = callCount++;
			queueMicrotask(() => {
				player.el._fire("canplay");
				queueMicrotask(() => {
					if (currentCall === 0) {
						// Skip first ad via player event
						player.emit("ad:skip", { adId: "a1" });
					} else {
						player.el._fire("ended");
					}
				});
			});
		});

		const ads = [makePlayableAd("a1", 1), makePlayableAd("a2", 2)];
		const result = await playPod(player as any, ads, { source: "vast" });

		expect(result.skipped).toBe(1);
		expect(result.completed).toBe(1);
	});

	it("emits correct index in pod:adstart/adend", async () => {
		const player = createMockPlayer();
		autoCompleteAds(player);

		const ads = [makePlayableAd("a1", 1), makePlayableAd("a2", 2)];
		await playPod(player as any, ads, { source: "vast" });

		const adStarts = player.emitted.filter(
			(e) => e.event === "ad:pod:adstart",
		) as Array<{ event: string; data: { index: number; total: number } }>;

		expect(adStarts[0].data.index).toBe(0);
		expect(adStarts[0].data.total).toBe(2);
		expect(adStarts[1].data.index).toBe(1);
		expect(adStarts[1].data.total).toBe(2);
	});

	it("substitutes stand-alone ad when pod ad fails (VAST 3.3.1)", async () => {
		const player = createMockPlayer();
		autoCompleteWithFailure(player, 1); // Second pod ad (index 1) fails

		const podAds = [
			makePlayableAd("pod1", 1),
			makePlayableAd("pod2", 2),
			makePlayableAd("pod3", 3),
		];
		const standalonePool = [makePlayableAd("standalone1")];

		const result = await playPod(player as any, podAds, {
			source: "vast",
			standalonePool,
		});

		// pod2 failed → standalone1 substituted and completed
		expect(result.completed).toBe(3);
		expect(result.failed).toBe(0);

		// standalone1 should have been played (its ad:start should appear)
		const adStarts = player.emitted
			.filter((e) => e.event === "ad:start")
			.map((e) => (e.data as { adId: string }).adId);
		expect(adStarts).toContain("standalone1");
	});

	it("falls through to next pod ad when substitute also fails", async () => {
		const player = createMockPlayer();
		// Indices 1 and 2 fail (pod2 fails, then standalone1 fails)
		let callCount = 0;
		player.el.load.mockImplementation(() => {
			const currentCall = callCount++;
			queueMicrotask(() => {
				if (currentCall === 1 || currentCall === 2) {
					player.el._fire("error");
				} else {
					player.el._fire("canplay");
					queueMicrotask(() => {
						player.el._fire("ended");
					});
				}
			});
		});

		const podAds = [
			makePlayableAd("pod1", 1),
			makePlayableAd("pod2", 2),
			makePlayableAd("pod3", 3),
		];
		const standalonePool = [makePlayableAd("standalone1")];

		const result = await playPod(player as any, podAds, {
			source: "vast",
			standalonePool,
		});

		// pod1 completed, pod2 failed (substitute also failed), pod3 completed
		expect(result.completed).toBe(2);
		expect(result.failed).toBe(1);
	});

	it("uses each stand-alone ad at most once", async () => {
		const player = createMockPlayer();
		// Indices 0 and 2 fail (pod1 and pod2 fail)
		let callCount = 0;
		player.el.load.mockImplementation(() => {
			const currentCall = callCount++;
			queueMicrotask(() => {
				if (currentCall === 0 || currentCall === 2) {
					player.el._fire("error");
				} else {
					player.el._fire("canplay");
					queueMicrotask(() => {
						player.el._fire("ended");
					});
				}
			});
		});

		const podAds = [makePlayableAd("pod1", 1), makePlayableAd("pod2", 2)];
		const standalonePool = [makePlayableAd("standalone1")];

		const result = await playPod(player as any, podAds, {
			source: "vast",
			standalonePool,
		});

		// pod1 failed → standalone1 completed, pod2 failed → no more standalones
		expect(result.completed).toBe(1);
		expect(result.failed).toBe(1);
	});

	it("ad:pod:start contains ad list and total", async () => {
		const player = createMockPlayer();
		autoCompleteAds(player);

		const ads = [makePlayableAd("a1", 1), makePlayableAd("a2", 2)];
		await playPod(player as any, ads, { source: "vast" });

		const podStart = player.emitted.find((e) => e.event === "ad:pod:start") as {
			data: { ads: { id: string }[]; total: number };
		};

		expect(podStart.data.total).toBe(2);
		expect(podStart.data.ads).toHaveLength(2);
		expect(podStart.data.ads[0].id).toBe("a1");
		expect(podStart.data.ads[1].id).toBe("a2");
	});
});

describe("playWaterfall", () => {
	it("plays first successful ad and stops", async () => {
		const player = createMockPlayer();
		autoCompleteAds(player);

		const ads = [makePlayableAd("a1"), makePlayableAd("a2")];
		const result = await playWaterfall(player as any, ads, { source: "vast" });

		expect(result).not.toBeNull();
		expect(result!.outcome).toBe("completed");
		expect(result!.adId).toBe("a1");

		// Only first ad should have started
		const adStarts = player.emitted.filter((e) => e.event === "ad:start");
		expect(adStarts).toHaveLength(1);
	});

	it("falls back to second ad when first fails to load", async () => {
		const player = createMockPlayer();
		autoCompleteWithFailure(player, 0); // First ad fails

		const ads = [makePlayableAd("a1"), makePlayableAd("a2")];
		const result = await playWaterfall(player as any, ads, { source: "vast" });

		expect(result).not.toBeNull();
		expect(result!.outcome).toBe("completed");
		expect(result!.adId).toBe("a2");
	});

	it("returns null when all ads fail", async () => {
		const player = createMockPlayer();
		// All ads fail on load
		player.el.load.mockImplementation(() => {
			queueMicrotask(() => {
				player.el._fire("error");
			});
		});

		const ads = [makePlayableAd("a1"), makePlayableAd("a2")];
		const result = await playWaterfall(player as any, ads, { source: "vast" });

		expect(result).toBeNull();

		// Both ads should have been attempted
		const adStarts = player.emitted.filter((e) => e.event === "ad:start");
		expect(adStarts).toHaveLength(2);
	});

	it("stops waterfall on playback error (after canplay)", async () => {
		const player = createMockPlayer();
		// First ad: canplay fires, then error (playback error)
		player.el.load.mockImplementation(() => {
			queueMicrotask(() => {
				player.el._fire("canplay");
				queueMicrotask(() => {
					player.el._fire("error");
				});
			});
		});

		const ads = [makePlayableAd("a1"), makePlayableAd("a2")];
		const result = await playWaterfall(player as any, ads, { source: "vast" });

		// Should return the error result, not try next
		expect(result).not.toBeNull();
		expect(result!.outcome).toBe("error");
		expect(result!.errorPhase).toBe("playback");

		// Only first ad attempted
		const adStarts = player.emitted.filter((e) => e.event === "ad:start");
		expect(adStarts).toHaveLength(1);
	});

	it("does not emit pod events", async () => {
		const player = createMockPlayer();
		autoCompleteAds(player);

		const ads = [makePlayableAd("a1"), makePlayableAd("a2")];
		await playWaterfall(player as any, ads, { source: "vast" });

		const podEvents = player.emitted.filter((e) =>
			e.event.startsWith("ad:pod:"),
		);
		expect(podEvents).toHaveLength(0);
	});
});
