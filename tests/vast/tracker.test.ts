import { describe, expect, it, vi } from "vitest";
import {
	createQuartileTracker,
	getQuartile,
	track,
} from "../../src/vast/tracker.js";

describe("track", () => {
	it("uses sendBeacon when available", () => {
		const beacon = vi.fn();
		vi.stubGlobal("navigator", { sendBeacon: beacon });

		track(["http://example.com/impression1", "http://example.com/impression2"]);
		expect(beacon).toHaveBeenCalledTimes(2);
		expect(beacon).toHaveBeenCalledWith("http://example.com/impression1");
		expect(beacon).toHaveBeenCalledWith("http://example.com/impression2");

		vi.unstubAllGlobals();
	});

	it("falls back to Image pixel when sendBeacon is unavailable", () => {
		vi.stubGlobal("navigator", {});

		// We can't easily test Image creation, but we can verify it doesn't throw
		expect(() => track(["http://example.com/pixel"])).not.toThrow();

		vi.unstubAllGlobals();
	});

	it("handles empty array", () => {
		expect(() => track([])).not.toThrow();
	});
});

describe("getQuartile", () => {
	it("returns 'start' at 0 seconds", () => {
		expect(getQuartile(0, 100)).toBe("start");
	});

	it("returns 'start' at < 25%", () => {
		expect(getQuartile(10, 100)).toBe("start");
	});

	it("returns 'firstQuartile' at 25%", () => {
		expect(getQuartile(25, 100)).toBe("firstQuartile");
	});

	it("returns 'midpoint' at 50%", () => {
		expect(getQuartile(50, 100)).toBe("midpoint");
	});

	it("returns 'thirdQuartile' at 75%", () => {
		expect(getQuartile(75, 100)).toBe("thirdQuartile");
	});

	it("returns 'complete' at 100%", () => {
		expect(getQuartile(100, 100)).toBe("complete");
	});

	it("returns null for zero duration", () => {
		expect(getQuartile(10, 0)).toBeNull();
	});

	it("returns null for negative duration", () => {
		expect(getQuartile(10, -5)).toBeNull();
	});
});

describe("createQuartileTracker", () => {
	it("fires quartile events once", () => {
		const handler = vi.fn();
		const update = createQuartileTracker(100, handler);

		update(0);
		expect(handler).toHaveBeenCalledWith("start");
		handler.mockClear();

		// Calling again at same position should not re-fire
		update(0);
		expect(handler).not.toHaveBeenCalled();
	});

	it("fires quartiles in order as playback progresses", () => {
		const events: string[] = [];
		const update = createQuartileTracker(100, (e) => events.push(e));

		update(0); // start
		update(10); // still start range, no new event
		update(25); // firstQuartile
		update(30); // still firstQuartile range, no new event
		update(50); // midpoint
		update(75); // thirdQuartile
		update(100); // complete

		expect(events).toEqual([
			"start",
			"firstQuartile",
			"midpoint",
			"thirdQuartile",
			"complete",
		]);
	});

	it("fires missed quartiles when jumping ahead", () => {
		const events: string[] = [];
		const update = createQuartileTracker(100, (e) => events.push(e));

		// Jump straight to 60% — should fire exactly start, firstQuartile, midpoint in order
		update(60);

		expect(events).toEqual(["start", "firstQuartile", "midpoint"]);
	});

	it("fires all quartiles when jumping to 100%", () => {
		const events: string[] = [];
		const update = createQuartileTracker(100, (e) => events.push(e));

		update(100);

		expect(events).toEqual([
			"start",
			"firstQuartile",
			"midpoint",
			"thirdQuartile",
			"complete",
		]);
	});

	it("does not double-fire after a jump", () => {
		const events: string[] = [];
		const update = createQuartileTracker(100, (e) => events.push(e));

		update(60); // fires start, firstQuartile, midpoint
		update(60); // no new events
		update(75); // fires thirdQuartile

		expect(events).toEqual([
			"start",
			"firstQuartile",
			"midpoint",
			"thirdQuartile",
		]);
	});
});
