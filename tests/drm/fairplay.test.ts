import { describe, expect, it } from "vitest";
import {
	fairplayDashConfig,
	fairplayHlsConfig,
} from "../../src/drm/fairplay.js";

describe("fairplayHlsConfig", () => {
	it("sets emeEnabled, licenseUrl, and serverCertificateUrl", () => {
		const result = fairplayHlsConfig({
			licenseUrl: "https://fp.example.com/license",
			certificateUrl: "https://fp.example.com/cert",
		});
		expect(result.emeEnabled).toBe(true);
		const systems = result.drmSystems as Record<
			string,
			Record<string, unknown>
		>;
		expect(systems["com.apple.fps.1_0"].licenseUrl).toBe(
			"https://fp.example.com/license",
		);
		expect(systems["com.apple.fps.1_0"].serverCertificateUrl).toBe(
			"https://fp.example.com/cert",
		);
	});

	it("does not set licenseXhrSetup when no headers", () => {
		const result = fairplayHlsConfig({
			licenseUrl: "https://fp.example.com/license",
			certificateUrl: "https://fp.example.com/cert",
		});
		const systems = result.drmSystems as Record<
			string,
			Record<string, unknown>
		>;
		expect(systems["com.apple.fps.1_0"]).not.toHaveProperty("licenseXhrSetup");
	});

	it("sets licenseXhrSetup when headers provided", () => {
		const result = fairplayHlsConfig({
			licenseUrl: "https://fp.example.com/license",
			certificateUrl: "https://fp.example.com/cert",
			headers: { Authorization: "Bearer token" },
		});
		const systems = result.drmSystems as Record<
			string,
			Record<string, unknown>
		>;
		expect(typeof systems["com.apple.fps.1_0"].licenseXhrSetup).toBe(
			"function",
		);
	});
});

describe("fairplayDashConfig", () => {
	it("sets serverURL and serverCertificateURL", () => {
		const result = fairplayDashConfig({
			licenseUrl: "https://fp.example.com/license",
			certificateUrl: "https://fp.example.com/cert",
		});
		const streaming = result.streaming as Record<string, unknown>;
		const protection = streaming.protection as Record<string, unknown>;
		const data = protection.data as Record<string, Record<string, unknown>>;
		expect(data["com.apple.fps.1_0"].serverURL).toBe(
			"https://fp.example.com/license",
		);
		expect(data["com.apple.fps.1_0"].serverCertificateURL).toBe(
			"https://fp.example.com/cert",
		);
	});

	it("includes httpRequestHeaders when headers provided", () => {
		const result = fairplayDashConfig({
			licenseUrl: "https://fp.example.com/license",
			certificateUrl: "https://fp.example.com/cert",
			headers: { "X-Custom": "value" },
		});
		const streaming = result.streaming as Record<string, unknown>;
		const protection = streaming.protection as Record<string, unknown>;
		const data = protection.data as Record<string, Record<string, unknown>>;
		expect(data["com.apple.fps.1_0"].httpRequestHeaders).toEqual({
			"X-Custom": "value",
		});
	});
});
