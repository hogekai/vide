import { describe, expect, it, vi } from "vitest";
import { createScheduler } from "../../src/vmap/scheduler.js";
import type { AdBreak } from "../../src/vmap/types.js";

type Handler = (...args: unknown[]) => void;

function createMockPlayer() {
	const listeners = new Map<string, Set<Handler>>();
	let _currentTime = 0;
	let _duration = 100;

	return {
		get currentTime() {
			return _currentTime;
		},
		set currentTime(v: number) {
			_currentTime = v;
		},
		get duration() {
			return _duration;
		},
		set duration(v: number) {
			_duration = v;
		},
		on(event: string, handler: Handler): void {
			if (!listeners.has(event)) {
				listeners.set(event, new Set());
			}
			listeners.get(event)?.add(handler);
		},
		off(event: string, handler: Handler): void {
			listeners.get(event)?.delete(handler);
		},
		emit(event: string, data?: unknown): void {
			const set = listeners.get(event);
			if (!set) return;
			for (const handler of set) {
				handler(data);
			}
		},
		getListenerCount(event: string): number {
			return listeners.get(event)?.size ?? 0;
		},
	};
}

function makeBreak(offset: AdBreak["timeOffset"], breakId?: string): AdBreak {
	return {
		timeOffset: offset,
		breakType: "linear",
		breakId,
		adSource: null,
	};
}

describe("createScheduler", () => {
	it("fires preroll immediately on start()", async () => {
		const player = createMockPlayer();
		const onBreak = vi.fn().mockResolvedValue(undefined);
		const preroll = makeBreak({ type: "start" }, "preroll");

		const scheduler = createScheduler(player as never, [preroll], onBreak);
		scheduler.start();

		expect(onBreak).toHaveBeenCalledOnce();
		expect(onBreak).toHaveBeenCalledWith(preroll);

		scheduler.destroy();
	});

	it("does not fire preroll twice on double start()", async () => {
		const player = createMockPlayer();
		const onBreak = vi.fn().mockResolvedValue(undefined);
		const preroll = makeBreak({ type: "start" });

		const scheduler = createScheduler(player as never, [preroll], onBreak);
		scheduler.start();
		scheduler.start();

		expect(onBreak).toHaveBeenCalledOnce();

		scheduler.destroy();
	});

	it("fires midroll when currentTime reaches target", async () => {
		const player = createMockPlayer();
		const onBreak = vi.fn().mockResolvedValue(undefined);
		const midroll = makeBreak({ type: "time", seconds: 30 }, "mid-30s");

		const scheduler = createScheduler(player as never, [midroll], onBreak);
		scheduler.start();

		// Before target
		player.currentTime = 10;
		player.emit("timeupdate", { currentTime: 10, duration: 100 });
		expect(onBreak).not.toHaveBeenCalled();

		// Approach target incrementally
		player.currentTime = 29;
		player.emit("timeupdate", { currentTime: 29, duration: 100 });
		expect(onBreak).not.toHaveBeenCalled();

		// At target (within 0.5s tolerance)
		player.currentTime = 30;
		player.emit("timeupdate", { currentTime: 30, duration: 100 });
		expect(onBreak).toHaveBeenCalledOnce();
		expect(onBreak).toHaveBeenCalledWith(midroll);

		scheduler.destroy();
	});

	it("does not fire same midroll twice", async () => {
		const player = createMockPlayer();
		const onBreak = vi.fn().mockResolvedValue(undefined);
		const midroll = makeBreak({ type: "time", seconds: 30 });

		const scheduler = createScheduler(player as never, [midroll], onBreak);
		scheduler.start();

		player.currentTime = 30;
		player.emit("timeupdate", { currentTime: 30, duration: 100 });
		player.currentTime = 31;
		player.emit("timeupdate", { currentTime: 31, duration: 100 });

		expect(onBreak).toHaveBeenCalledOnce();

		scheduler.destroy();
	});

	it("does not fire midroll when seeked past it", async () => {
		const player = createMockPlayer();
		const onBreak = vi.fn().mockResolvedValue(undefined);
		const midroll = makeBreak({ type: "time", seconds: 30 });

		const scheduler = createScheduler(player as never, [midroll], onBreak);
		scheduler.start();

		// Start at 5s
		player.currentTime = 5;
		player.emit("timeupdate", { currentTime: 5, duration: 100 });

		// Seek from 5s to 60s (past the 30s midroll)
		player.currentTime = 60;
		player.emit("timeupdate", { currentTime: 60, duration: 100 });

		expect(onBreak).not.toHaveBeenCalled();

		scheduler.destroy();
	});

	it("fires postroll on ended event", async () => {
		const player = createMockPlayer();
		const onBreak = vi.fn().mockResolvedValue(undefined);
		const postroll = makeBreak({ type: "end" }, "postroll");

		const scheduler = createScheduler(player as never, [postroll], onBreak);
		scheduler.start();

		player.emit("ended", undefined);
		expect(onBreak).toHaveBeenCalledOnce();
		expect(onBreak).toHaveBeenCalledWith(postroll);

		scheduler.destroy();
	});

	it("does not fire postroll twice", async () => {
		const player = createMockPlayer();
		const onBreak = vi.fn().mockResolvedValue(undefined);
		const postroll = makeBreak({ type: "end" });

		const scheduler = createScheduler(player as never, [postroll], onBreak);
		scheduler.start();

		player.emit("ended", undefined);
		player.emit("ended", undefined);

		expect(onBreak).toHaveBeenCalledOnce();

		scheduler.destroy();
	});

	it("removes listeners on destroy()", async () => {
		const player = createMockPlayer();
		const onBreak = vi.fn().mockResolvedValue(undefined);
		const midroll = makeBreak({ type: "time", seconds: 30 });
		const postroll = makeBreak({ type: "end" });

		const scheduler = createScheduler(
			player as never,
			[midroll, postroll],
			onBreak,
		);
		scheduler.start();

		expect(player.getListenerCount("timeupdate")).toBe(1);
		expect(player.getListenerCount("ended")).toBe(1);

		scheduler.destroy();

		expect(player.getListenerCount("timeupdate")).toBe(0);
		expect(player.getListenerCount("ended")).toBe(0);
	});

	it("ignores timeupdate and ended events while paused", async () => {
		const player = createMockPlayer();
		const onBreak = vi.fn().mockResolvedValue(undefined);
		const midroll = makeBreak({ type: "time", seconds: 5 }, "mid-5");
		const postroll = makeBreak({ type: "end" }, "postroll");

		const scheduler = createScheduler(
			player as never,
			[midroll, postroll],
			onBreak,
		);
		scheduler.start();

		// Pause the scheduler (simulates ad playback)
		scheduler.pause();

		// Timeupdate during ad — should be ignored
		player.currentTime = 5;
		player.emit("timeupdate", { currentTime: 5, duration: 100 });
		expect(onBreak).not.toHaveBeenCalled();

		// Ended during ad — should be ignored
		player.emit("ended", undefined);
		expect(onBreak).not.toHaveBeenCalled();

		// Resume after ad ends, content restored at 2s
		player.currentTime = 2;
		scheduler.resume();

		// Now midroll should fire when content reaches 5s
		player.currentTime = 3;
		player.emit("timeupdate", { currentTime: 3, duration: 100 });
		expect(onBreak).not.toHaveBeenCalled();

		player.currentTime = 5;
		player.emit("timeupdate", { currentTime: 5, duration: 100 });
		expect(onBreak).toHaveBeenCalledOnce();
		expect(onBreak).toHaveBeenCalledWith(midroll);

		scheduler.destroy();
	});

	it("resume resets lastTime to prevent false seek detection", async () => {
		const player = createMockPlayer();
		const onBreak = vi.fn().mockResolvedValue(undefined);
		const midroll = makeBreak({ type: "time", seconds: 30 }, "mid-30");

		const scheduler = createScheduler(player as never, [midroll], onBreak);
		scheduler.start();

		// Advance to 10s
		player.currentTime = 10;
		player.emit("timeupdate", { currentTime: 10, duration: 100 });

		// Pause (ad plays, time resets to 0 on ad video)
		scheduler.pause();

		// Resume after ad — content restored at 10s
		// Without lastTime reset, 10 > lastAdTime + 1.5 would look like a seek
		player.currentTime = 10;
		scheduler.resume();

		// Advance normally to 30s
		for (let t = 11; t <= 30; t++) {
			player.currentTime = t;
			player.emit("timeupdate", { currentTime: t, duration: 100 });
		}

		// Midroll should have fired (not skipped by false seek detection)
		expect(onBreak).toHaveBeenCalledOnce();
		expect(onBreak).toHaveBeenCalledWith(midroll);

		scheduler.destroy();
	});

	it("fires multiple midrolls in order", async () => {
		const player = createMockPlayer();
		const fired: string[] = [];
		const onBreak = vi.fn().mockImplementation((b: AdBreak) => {
			fired.push(b.breakId ?? "");
			return Promise.resolve();
		});

		const mid1 = makeBreak({ type: "time", seconds: 30 }, "mid-30");
		const mid2 = makeBreak({ type: "time", seconds: 60 }, "mid-60");

		const scheduler = createScheduler(player as never, [mid1, mid2], onBreak);
		scheduler.start();

		// Incrementally advance to 30s
		for (let t = 0; t <= 30; t += 5) {
			player.currentTime = t;
			player.emit("timeupdate", { currentTime: t, duration: 100 });
		}
		expect(fired).toEqual(["mid-30"]);

		// Advance to 60s
		for (let t = 35; t <= 60; t += 5) {
			player.currentTime = t;
			player.emit("timeupdate", { currentTime: t, duration: 100 });
		}
		expect(fired).toEqual(["mid-30", "mid-60"]);

		scheduler.destroy();
	});

	it("fires percentage midroll resolved against player.duration", async () => {
		const player = createMockPlayer();
		player.duration = 200;
		const onBreak = vi.fn().mockResolvedValue(undefined);
		const midroll = makeBreak({ type: "percentage", pct: 50 }, "mid-50pct");

		const scheduler = createScheduler(player as never, [midroll], onBreak);
		scheduler.start();

		// 50% of 200 = 100s. Advance incrementally.
		for (let t = 0; t <= 95; t += 5) {
			player.currentTime = t;
			player.emit("timeupdate", { currentTime: t, duration: 200 });
		}
		expect(onBreak).not.toHaveBeenCalled();

		player.currentTime = 100;
		player.emit("timeupdate", { currentTime: 100, duration: 200 });
		expect(onBreak).toHaveBeenCalledOnce();
		expect(onBreak).toHaveBeenCalledWith(midroll);

		scheduler.destroy();
	});
});
