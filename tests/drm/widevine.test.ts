import { describe, expect, it } from "vitest";
import {
	widevineDashConfig,
	widevineHlsConfig,
} from "../../src/drm/widevine.js";

describe("widevineHlsConfig", () => {
	it("sets emeEnabled and licenseUrl", () => {
		const result = widevineHlsConfig({
			licenseUrl: "https://lic.example.com",
		});
		expect(result.emeEnabled).toBe(true);
		const systems = result.drmSystems as Record<
			string,
			Record<string, unknown>
		>;
		expect(systems["com.widevine.alpha"].licenseUrl).toBe(
			"https://lic.example.com",
		);
	});

	it("does not set licenseXhrSetup when no headers", () => {
		const result = widevineHlsConfig({
			licenseUrl: "https://lic.example.com",
		});
		const systems = result.drmSystems as Record<
			string,
			Record<string, unknown>
		>;
		expect(systems["com.widevine.alpha"]).not.toHaveProperty("licenseXhrSetup");
	});

	it("sets licenseXhrSetup when headers provided", () => {
		const result = widevineHlsConfig({
			licenseUrl: "https://lic.example.com",
			headers: { Authorization: "Bearer token" },
		});
		const systems = result.drmSystems as Record<
			string,
			Record<string, unknown>
		>;
		expect(systems["com.widevine.alpha"]).toHaveProperty("licenseXhrSetup");
		expect(typeof systems["com.widevine.alpha"].licenseXhrSetup).toBe(
			"function",
		);
	});
});

describe("widevineDashConfig", () => {
	it("sets serverURL in protectionData", () => {
		const result = widevineDashConfig({
			licenseUrl: "https://lic.example.com",
		});
		const streaming = result.streaming as Record<string, unknown>;
		const protection = streaming.protection as Record<string, unknown>;
		const data = protection.data as Record<string, Record<string, unknown>>;
		expect(data["com.widevine.alpha"].serverURL).toBe(
			"https://lic.example.com",
		);
	});

	it("does not set httpRequestHeaders when no headers", () => {
		const result = widevineDashConfig({
			licenseUrl: "https://lic.example.com",
		});
		const streaming = result.streaming as Record<string, unknown>;
		const protection = streaming.protection as Record<string, unknown>;
		const data = protection.data as Record<string, Record<string, unknown>>;
		expect(data["com.widevine.alpha"]).not.toHaveProperty("httpRequestHeaders");
	});

	it("includes httpRequestHeaders when headers provided", () => {
		const result = widevineDashConfig({
			licenseUrl: "https://lic.example.com",
			headers: { Authorization: "Bearer token" },
		});
		const streaming = result.streaming as Record<string, unknown>;
		const protection = streaming.protection as Record<string, unknown>;
		const data = protection.data as Record<string, Record<string, unknown>>;
		expect(data["com.widevine.alpha"].httpRequestHeaders).toEqual({
			Authorization: "Bearer token",
		});
	});
});
