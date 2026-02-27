import { describe, expect, it, vi } from "vitest";
import {
	createHlsMonitor,
	parseDateRange,
	parseId3Samples,
} from "../../src/ssai/hls-monitor.js";

// --- parseDateRange ---

describe("parseDateRange", () => {
	it("returns metadata for HLS Interstitial class", () => {
		const result = parseDateRange({
			ID: "ad-1",
			CLASS: "com.apple.hls.interstitial",
			"START-DATE": "2025-01-01T00:05:00Z",
			DURATION: "30",
		});
		expect(result).not.toBeNull();
		expect(result?.id).toBe("ad-1");
		expect(result?.duration).toBe(30);
		expect(result?.startTime).toBeCloseTo(
			new Date("2025-01-01T00:05:00Z").getTime() / 1000,
		);
	});

	it("returns metadata for SCTE35-OUT attribute", () => {
		const result = parseDateRange({
			ID: "cue-1",
			"SCTE35-OUT": "0xFC...",
			"START-DATE": "2025-01-01T00:10:00Z",
			DURATION: "15",
		});
		expect(result).not.toBeNull();
		expect(result?.id).toBe("cue-1");
		expect(result?.duration).toBe(15);
	});

	it("returns null for unknown CLASS without SCTE35-OUT", () => {
		const result = parseDateRange({
			ID: "x",
			CLASS: "some.other.class",
			"START-DATE": "2025-01-01T00:00:00Z",
		});
		expect(result).toBeNull();
	});

	it("returns null when ID is missing", () => {
		const result = parseDateRange({
			CLASS: "com.apple.hls.interstitial",
			"START-DATE": "2025-01-01T00:00:00Z",
			DURATION: "30",
		});
		expect(result).toBeNull();
	});

	it("uses PLANNED-DURATION when DURATION is absent", () => {
		const result = parseDateRange({
			ID: "ad-2",
			CLASS: "com.apple.hls.interstitial",
			"START-DATE": "2025-01-01T00:00:00Z",
			"PLANNED-DURATION": "20",
		});
		expect(result).not.toBeNull();
		expect(result?.duration).toBe(20);
	});

	it("defaults duration to 0 when neither DURATION nor PLANNED-DURATION", () => {
		const result = parseDateRange({
			ID: "ad-3",
			CLASS: "com.apple.hls.interstitial",
			"START-DATE": "2025-01-01T00:00:00Z",
		});
		expect(result).not.toBeNull();
		expect(result?.duration).toBe(0);
	});
});

// --- parseId3Samples ---

describe("parseId3Samples", () => {
	it("returns metadata when sample data contains SCTE35", () => {
		const data = new TextEncoder().encode("SCTE35:splice_insert");
		const result = parseId3Samples([{ type: "TXXX", data }], 300);
		expect(result).not.toBeNull();
		expect(result?.id).toBe("id3-300");
		expect(result?.startTime).toBe(300);
	});

	it("returns null when no SCTE-35 content", () => {
		const data = new TextEncoder().encode("some random metadata");
		const result = parseId3Samples([{ type: "TXXX", data }], 100);
		expect(result).toBeNull();
	});

	it("returns null for empty samples array", () => {
		const result = parseId3Samples([], 0);
		expect(result).toBeNull();
	});
});

// --- createHlsMonitor ---

describe("createHlsMonitor", () => {
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

	it("subscribes to hlsLevelUpdated and hlsFragParsingMetadata", () => {
		const hls = createMockHls();
		const cleanup = createHlsMonitor(hls, undefined, vi.fn());
		expect(hls.on).toHaveBeenCalledWith(
			"hlsLevelUpdated",
			expect.any(Function),
		);
		expect(hls.on).toHaveBeenCalledWith(
			"hlsFragParsingMetadata",
			expect.any(Function),
		);
		cleanup();
	});

	it("calls onMetadata for DATERANGE data", () => {
		const hls = createMockHls();
		const onMetadata = vi.fn();
		createHlsMonitor(hls, undefined, onMetadata);

		hls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: {
				dateranges: {
					"ad-1": {
						attr: {
							ID: "ad-1",
							CLASS: "com.apple.hls.interstitial",
							"START-DATE": "2025-01-01T00:05:00Z",
							DURATION: "30",
						},
					},
				},
			},
		});

		expect(onMetadata).toHaveBeenCalledTimes(1);
		expect(onMetadata.mock.calls[0][0][0].id).toBe("ad-1");
	});

	it("deduplicates repeated daterange IDs", () => {
		const hls = createMockHls();
		const onMetadata = vi.fn();
		createHlsMonitor(hls, undefined, onMetadata);

		const data = {
			details: {
				dateranges: {
					"ad-1": {
						attr: {
							ID: "ad-1",
							CLASS: "com.apple.hls.interstitial",
							"START-DATE": "2025-01-01T00:05:00Z",
							DURATION: "30",
						},
					},
				},
			},
		};

		hls._fire("hlsLevelUpdated", "hlsLevelUpdated", data);
		hls._fire("hlsLevelUpdated", "hlsLevelUpdated", data);

		expect(onMetadata).toHaveBeenCalledTimes(1);
	});

	it("uses custom parser when provided", () => {
		const hls = createMockHls();
		const onMetadata = vi.fn();
		const customParser = vi
			.fn()
			.mockReturnValue([{ id: "custom-1", startTime: 100, duration: 20 }]);
		createHlsMonitor(hls, customParser, onMetadata);

		hls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: {
				dateranges: {
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
		expect(onMetadata).toHaveBeenCalledWith([
			{ id: "custom-1", startTime: 100, duration: 20 },
		]);
	});

	it("handles ID3 metadata via FRAG_PARSING_METADATA", () => {
		const hls = createMockHls();
		const onMetadata = vi.fn();
		createHlsMonitor(hls, undefined, onMetadata);

		const scteData = new TextEncoder().encode("SCTE35:splice");
		hls._fire("hlsFragParsingMetadata", "hlsFragParsingMetadata", {
			samples: [{ type: "TXXX", data: scteData, pts: 300, dts: 300 }],
		});

		expect(onMetadata).toHaveBeenCalledTimes(1);
		expect(onMetadata.mock.calls[0][0][0].startTime).toBe(300);
	});

	it("cleanup removes event listeners", () => {
		const hls = createMockHls();
		const cleanup = createHlsMonitor(hls, undefined, vi.fn());
		cleanup();
		expect(hls.off).toHaveBeenCalledWith(
			"hlsLevelUpdated",
			expect.any(Function),
		);
		expect(hls.off).toHaveBeenCalledWith(
			"hlsFragParsingMetadata",
			expect.any(Function),
		);
	});

	it("ignores dateranges that are not ad markers in auto mode", () => {
		const hls = createMockHls();
		const onMetadata = vi.fn();
		createHlsMonitor(hls, undefined, onMetadata);

		hls._fire("hlsLevelUpdated", "hlsLevelUpdated", {
			details: {
				dateranges: {
					"non-ad": {
						attr: {
							ID: "non-ad",
							CLASS: "some.other.class",
							"START-DATE": "2025-01-01T00:00:00Z",
						},
					},
				},
			},
		});

		expect(onMetadata).not.toHaveBeenCalled();
	});
});
