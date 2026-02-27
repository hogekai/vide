import { describe, expect, it } from "vitest";
import { createAdUIState, el, formatTime } from "../../src/ui/utils.js";

describe("formatTime", () => {
	it("formats 0 as 0:00", () => {
		expect(formatTime(0)).toBe("0:00");
	});

	it("formats seconds under a minute", () => {
		expect(formatTime(5)).toBe("0:05");
		expect(formatTime(59)).toBe("0:59");
	});

	it("formats minutes and seconds", () => {
		expect(formatTime(60)).toBe("1:00");
		expect(formatTime(61)).toBe("1:01");
		expect(formatTime(125)).toBe("2:05");
		expect(formatTime(599)).toBe("9:59");
	});

	it("formats hours", () => {
		expect(formatTime(3600)).toBe("1:00:00");
		expect(formatTime(3661)).toBe("1:01:01");
		expect(formatTime(7200)).toBe("2:00:00");
	});

	it("returns 0:00 for NaN", () => {
		expect(formatTime(Number.NaN)).toBe("0:00");
	});

	it("returns 0:00 for Infinity", () => {
		expect(formatTime(Number.POSITIVE_INFINITY)).toBe("0:00");
	});

	it("returns 0:00 for negative values", () => {
		expect(formatTime(-5)).toBe("0:00");
	});

	it("truncates fractional seconds", () => {
		expect(formatTime(1.9)).toBe("0:01");
	});
});

describe("el", () => {
	it("creates element with class name", () => {
		const div = el("div", "vide-test");
		expect(div.tagName).toBe("DIV");
		expect(div.className).toBe("vide-test");
	});

	it("creates button element", () => {
		const btn = el("button", "vide-play");
		expect(btn.tagName).toBe("BUTTON");
		expect(btn.className).toBe("vide-play");
	});
});

describe("createAdUIState", () => {
	it("starts with null current", () => {
		const ref = createAdUIState();
		expect(ref.current).toBeNull();
	});

	it("set() stores state", () => {
		const ref = createAdUIState();
		ref.set({
			adId: "ad1",
			skipOffset: 5,
			clickThrough: "https://example.com",
			duration: 30,
		});
		expect(ref.current).toEqual({
			adId: "ad1",
			skipOffset: 5,
			clickThrough: "https://example.com",
			duration: 30,
		});
	});

	it("clear() resets to null", () => {
		const ref = createAdUIState();
		ref.set({
			adId: "ad1",
			skipOffset: undefined,
			clickThrough: undefined,
			duration: 15,
		});
		ref.clear();
		expect(ref.current).toBeNull();
	});
});
