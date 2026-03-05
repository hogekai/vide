import { describe, expect, it } from "vitest";
import {
	playreadyDashConfig,
	playreadyHlsConfig,
} from "../../src/drm/playready.js";

describe("playreadyHlsConfig", () => {
	it("sets emeEnabled and licenseUrl", () => {
		const result = playreadyHlsConfig({
			licenseUrl: "https://lic.example.com",
		});
		expect(result.emeEnabled).toBe(true);
		const systems = result.drmSystems as Record<
			string,
			Record<string, unknown>
		>;
		expect(systems["com.microsoft.playready"].licenseUrl).toBe(
			"https://lic.example.com",
		);
	});

	it("does not set licenseXhrSetup when no headers", () => {
		const result = playreadyHlsConfig({
			licenseUrl: "https://lic.example.com",
		});
		const systems = result.drmSystems as Record<
			string,
			Record<string, unknown>
		>;
		expect(systems["com.microsoft.playready"]).not.toHaveProperty(
			"licenseXhrSetup",
		);
	});

	it("sets licenseXhrSetup when headers provided", () => {
		const result = playreadyHlsConfig({
			licenseUrl: "https://lic.example.com",
			headers: { Authorization: "Bearer token" },
		});
		const systems = result.drmSystems as Record<
			string,
			Record<string, unknown>
		>;
		expect(systems["com.microsoft.playready"]).toHaveProperty(
			"licenseXhrSetup",
		);
		expect(typeof systems["com.microsoft.playready"].licenseXhrSetup).toBe(
			"function",
		);
	});
});

describe("playreadyDashConfig", () => {
	it("sets serverURL in protectionData", () => {
		const result = playreadyDashConfig({
			licenseUrl: "https://lic.example.com",
		});
		const streaming = result.streaming as Record<string, unknown>;
		const protection = streaming.protection as Record<string, unknown>;
		const data = protection.data as Record<string, Record<string, unknown>>;
		expect(data["com.microsoft.playready"].serverURL).toBe(
			"https://lic.example.com",
		);
	});

	it("does not set httpRequestHeaders when no headers", () => {
		const result = playreadyDashConfig({
			licenseUrl: "https://lic.example.com",
		});
		const streaming = result.streaming as Record<string, unknown>;
		const protection = streaming.protection as Record<string, unknown>;
		const data = protection.data as Record<string, Record<string, unknown>>;
		expect(data["com.microsoft.playready"]).not.toHaveProperty(
			"httpRequestHeaders",
		);
	});

	it("includes httpRequestHeaders when headers provided", () => {
		const result = playreadyDashConfig({
			licenseUrl: "https://lic.example.com",
			headers: { Authorization: "Bearer token" },
		});
		const streaming = result.streaming as Record<string, unknown>;
		const protection = streaming.protection as Record<string, unknown>;
		const data = protection.data as Record<string, Record<string, unknown>>;
		expect(data["com.microsoft.playready"].httpRequestHeaders).toEqual({
			Authorization: "Bearer token",
		});
	});
});
