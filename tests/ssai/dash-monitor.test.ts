import { describe, expect, it, vi } from "vitest";
import {
	createDashMonitor,
	parseEventStream,
} from "../../src/ssai/dash-monitor.js";

// --- parseEventStream ---

describe("parseEventStream", () => {
	it("returns metadata for urn:scte:scte35:2013:xml scheme", () => {
		const result = parseEventStream(
			"urn:scte:scte35:2013:xml",
			"",
			300,
			30,
			"<SpliceInsert/>",
			"ev-1",
		);
		expect(result).not.toBeNull();
		expect(result?.id).toBe("ev-1");
		expect(result?.startTime).toBe(300);
		expect(result?.duration).toBe(30);
	});

	it("returns metadata for urn:scte:scte35:2014:xml+bin scheme", () => {
		const result = parseEventStream(
			"urn:scte:scte35:2014:xml+bin",
			"",
			600,
			15,
		);
		expect(result).not.toBeNull();
		expect(result?.startTime).toBe(600);
	});

	it("returns null for non-SCTE-35 scheme", () => {
		const result = parseEventStream("urn:example:custom:events", "", 100, 10);
		expect(result).toBeNull();
	});

	it("uses event id when available", () => {
		const result = parseEventStream(
			"urn:scte:scte35:2013:xml",
			"",
			100,
			10,
			undefined,
			"my-event-id",
		);
		expect(result?.id).toBe("my-event-id");
	});

	it("generates id fallback when id is absent", () => {
		const result = parseEventStream("urn:scte:scte35:2013:xml", "", 100, 10);
		expect(result?.id).toBe("dash-event-100");
	});

	it("includes messageData in customData when present", () => {
		const result = parseEventStream(
			"urn:scte:scte35:2013:xml",
			"1",
			100,
			10,
			"<SpliceInsert/>",
			"ev-2",
		);
		expect(result?.customData?.messageData).toBe("<SpliceInsert/>");
	});
});

// --- createDashMonitor ---

describe("createDashMonitor", () => {
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

	it("subscribes to eventModeOnReceive and eventModeOnStart", () => {
		const dash = createMockDash();
		const cleanup = createDashMonitor(dash, undefined, vi.fn());
		expect(dash.on).toHaveBeenCalledWith(
			"eventModeOnReceive",
			expect.any(Function),
		);
		expect(dash.on).toHaveBeenCalledWith(
			"eventModeOnStart",
			expect.any(Function),
		);
		cleanup();
	});

	it("calls onMetadata when EventStream event matches SCTE-35", () => {
		const dash = createMockDash();
		const onMetadata = vi.fn();
		createDashMonitor(dash, undefined, onMetadata);

		dash._fire("eventModeOnReceive", {
			event: {
				schemeIdUri: "urn:scte:scte35:2013:xml",
				value: "",
				calculatedPresentationTime: 300,
				duration: 30,
				id: "ev-1",
			},
		});

		expect(onMetadata).toHaveBeenCalledTimes(1);
		expect(onMetadata.mock.calls[0][0][0].id).toBe("ev-1");
	});

	it("ignores non-SCTE-35 EventStream events in auto mode", () => {
		const dash = createMockDash();
		const onMetadata = vi.fn();
		createDashMonitor(dash, undefined, onMetadata);

		dash._fire("eventModeOnReceive", {
			event: {
				schemeIdUri: "urn:example:custom",
				value: "",
				calculatedPresentationTime: 100,
				duration: 10,
			},
		});

		expect(onMetadata).not.toHaveBeenCalled();
	});

	it("uses custom parser when provided", () => {
		const dash = createMockDash();
		const onMetadata = vi.fn();
		const customParser = vi
			.fn()
			.mockReturnValue([{ id: "custom-1", startTime: 100, duration: 20 }]);
		createDashMonitor(dash, customParser, onMetadata);

		dash._fire("eventModeOnStart", {
			event: {
				schemeIdUri: "urn:vendor:custom",
				value: "ad",
				calculatedPresentationTime: 100,
				duration: 20,
			},
		});

		expect(customParser).toHaveBeenCalledWith({
			source: "eventstream",
			schemeIdUri: "urn:vendor:custom",
			value: "ad",
			startTime: 100,
			duration: 20,
			messageData: undefined,
		});
		expect(onMetadata).toHaveBeenCalledWith([
			{ id: "custom-1", startTime: 100, duration: 20 },
		]);
	});

	it("cleanup removes event listeners", () => {
		const dash = createMockDash();
		const cleanup = createDashMonitor(dash, undefined, vi.fn());
		cleanup();
		expect(dash.off).toHaveBeenCalledWith(
			"eventModeOnReceive",
			expect.any(Function),
		);
		expect(dash.off).toHaveBeenCalledWith(
			"eventModeOnStart",
			expect.any(Function),
		);
	});
});
