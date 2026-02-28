import { describe, expect, it, vi } from "vitest";
import {
	VAST_COMPANION_ERROR,
	VAST_COMPANION_FETCH_ERROR,
	VAST_COMPANION_REQUIRED_ERROR,
	VAST_COMPANION_SIZE_ERROR,
	VAST_COMPANION_UNSUPPORTED,
	VAST_INTERACTIVE_ERROR,
	VAST_LINEAR_ERROR,
	VAST_MEDIA_DISPLAY_ERROR,
	VAST_MEDIA_NOT_FOUND,
	VAST_MEDIA_TIMEOUT,
	VAST_MEDIA_UNSUPPORTED,
	VAST_NONLINEAR_ERROR,
	VAST_NONLINEAR_FETCH_ERROR,
	VAST_NONLINEAR_SIZE_ERROR,
	VAST_NONLINEAR_UNSUPPORTED,
	VAST_NO_ADS,
	VAST_SCHEMA_ERROR,
	VAST_UNDEFINED_ERROR,
	VAST_VPAID_ERROR,
	VAST_WRAPPER_ERROR,
	VAST_WRAPPER_LIMIT,
	VAST_WRAPPER_TIMEOUT,
	VAST_XML_PARSE_ERROR,
} from "../../src/vast/error-codes.js";
import { trackError } from "../../src/vast/tracker.js";

describe("VAST error code constants", () => {
	it("has correct numeric values for key codes", () => {
		expect(VAST_XML_PARSE_ERROR).toBe(100);
		expect(VAST_SCHEMA_ERROR).toBe(101);
		expect(VAST_WRAPPER_ERROR).toBe(300);
		expect(VAST_WRAPPER_TIMEOUT).toBe(301);
		expect(VAST_WRAPPER_LIMIT).toBe(302);
		expect(VAST_NO_ADS).toBe(303);
		expect(VAST_LINEAR_ERROR).toBe(400);
		expect(VAST_MEDIA_NOT_FOUND).toBe(401);
		expect(VAST_MEDIA_TIMEOUT).toBe(402);
		expect(VAST_MEDIA_UNSUPPORTED).toBe(403);
		expect(VAST_MEDIA_DISPLAY_ERROR).toBe(405);
		expect(VAST_NONLINEAR_ERROR).toBe(500);
		expect(VAST_NONLINEAR_SIZE_ERROR).toBe(501);
		expect(VAST_NONLINEAR_FETCH_ERROR).toBe(502);
		expect(VAST_NONLINEAR_UNSUPPORTED).toBe(503);
		expect(VAST_COMPANION_ERROR).toBe(600);
		expect(VAST_COMPANION_SIZE_ERROR).toBe(601);
		expect(VAST_COMPANION_REQUIRED_ERROR).toBe(602);
		expect(VAST_COMPANION_FETCH_ERROR).toBe(603);
		expect(VAST_COMPANION_UNSUPPORTED).toBe(604);
		expect(VAST_UNDEFINED_ERROR).toBe(900);
		expect(VAST_VPAID_ERROR).toBe(901);
		expect(VAST_INTERACTIVE_ERROR).toBe(902);
	});
});

describe("trackError", () => {
	it("replaces [ERRORCODE] macro in URLs before firing", () => {
		const beacon = vi.fn();
		vi.stubGlobal("navigator", { sendBeacon: beacon });

		trackError(
			[
				"http://example.com/error?code=[ERRORCODE]",
				"http://example.com/err2?e=[ERRORCODE]&other=1",
			],
			403,
		);

		expect(beacon).toHaveBeenCalledTimes(2);
		expect(beacon).toHaveBeenCalledWith("http://example.com/error?code=403");
		expect(beacon).toHaveBeenCalledWith(
			"http://example.com/err2?e=403&other=1",
		);

		vi.unstubAllGlobals();
	});

	it("fires URLs unchanged when no [ERRORCODE] macro present", () => {
		const beacon = vi.fn();
		vi.stubGlobal("navigator", { sendBeacon: beacon });

		trackError(["http://example.com/error"], 403);
		expect(beacon).toHaveBeenCalledWith("http://example.com/error");

		vi.unstubAllGlobals();
	});

	it("handles empty URL array", () => {
		const beacon = vi.fn();
		vi.stubGlobal("navigator", { sendBeacon: beacon });

		trackError([], 403);
		expect(beacon).not.toHaveBeenCalled();

		vi.unstubAllGlobals();
	});
});
