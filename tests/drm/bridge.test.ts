import { describe, expect, it } from "vitest";
import { dashDrmConfig, hlsDrmConfig } from "../../src/drm/bridge.js";

describe("hlsDrmConfig", () => {
	it("routes to Widevine config", () => {
		const result = hlsDrmConfig({
			keySystem: "com.widevine.alpha",
			widevine: { licenseUrl: "https://lic.example.com" },
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

	it("routes to FairPlay config", () => {
		const result = hlsDrmConfig({
			keySystem: "com.apple.fps.1_0",
			fairplay: {
				licenseUrl: "https://fp.example.com/license",
				certificateUrl: "https://fp.example.com/cert",
			},
		});
		expect(result.emeEnabled).toBe(true);
		const systems = result.drmSystems as Record<
			string,
			Record<string, unknown>
		>;
		expect(systems["com.apple.fps.1_0"].licenseUrl).toBe(
			"https://fp.example.com/license",
		);
	});

	it("returns empty object when keySystem has no matching config", () => {
		const result = hlsDrmConfig({
			keySystem: "com.widevine.alpha",
			// widevine config is missing
		});
		expect(result).toEqual({});
	});
});

describe("dashDrmConfig", () => {
	it("routes to Widevine config", () => {
		const result = dashDrmConfig({
			keySystem: "com.widevine.alpha",
			widevine: { licenseUrl: "https://lic.example.com" },
		});
		const streaming = result.streaming as Record<string, unknown>;
		const protection = streaming.protection as Record<string, unknown>;
		const data = protection.data as Record<string, Record<string, unknown>>;
		expect(data["com.widevine.alpha"].serverURL).toBe(
			"https://lic.example.com",
		);
	});

	it("routes to FairPlay config", () => {
		const result = dashDrmConfig({
			keySystem: "com.apple.fps.1_0",
			fairplay: {
				licenseUrl: "https://fp.example.com/license",
				certificateUrl: "https://fp.example.com/cert",
			},
		});
		const streaming = result.streaming as Record<string, unknown>;
		const protection = streaming.protection as Record<string, unknown>;
		const data = protection.data as Record<string, Record<string, unknown>>;
		expect(data["com.apple.fps.1_0"].serverURL).toBe(
			"https://fp.example.com/license",
		);
	});

	it("returns empty object when keySystem has no matching config", () => {
		const result = dashDrmConfig({
			keySystem: "com.apple.fps.1_0",
			// fairplay config is missing
		});
		expect(result).toEqual({});
	});
});
