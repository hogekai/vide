import { afterEach, describe, expect, it, vi } from "vitest";
import {
	detectKeySystem,
	probeConfigFor,
	queryDrmSupport,
} from "../../src/drm/detect.js";

const originalRMKSA = navigator.requestMediaKeySystemAccess;

afterEach(() => {
	Object.defineProperty(navigator, "requestMediaKeySystemAccess", {
		value: originalRMKSA,
		writable: true,
		configurable: true,
	});
});

function mockRMKSA(
	fn: (
		keySystem: string,
		config: MediaKeySystemConfiguration[],
	) => Promise<MediaKeySystemAccess>,
): void {
	Object.defineProperty(navigator, "requestMediaKeySystemAccess", {
		value: fn,
		writable: true,
		configurable: true,
	});
}

describe("detectKeySystem", () => {
	it("returns first supported key system", async () => {
		mockRMKSA(vi.fn().mockResolvedValue({} as MediaKeySystemAccess));
		const result = await detectKeySystem(["com.widevine.alpha"]);
		expect(result).toBe("com.widevine.alpha");
	});

	it("returns null when no key system is supported", async () => {
		mockRMKSA(vi.fn().mockRejectedValue(new Error("Not supported")));
		const result = await detectKeySystem([
			"com.widevine.alpha",
			"com.apple.fps.1_0",
		]);
		expect(result).toBeNull();
	});

	it("falls through to next candidate on failure", async () => {
		mockRMKSA(
			vi
				.fn()
				.mockRejectedValueOnce(new Error("Not supported"))
				.mockResolvedValueOnce({} as MediaKeySystemAccess),
		);
		const result = await detectKeySystem([
			"com.widevine.alpha",
			"com.apple.fps.1_0",
		]);
		expect(result).toBe("com.apple.fps.1_0");
	});

	it("returns null for empty candidates", async () => {
		const result = await detectKeySystem([]);
		expect(result).toBeNull();
	});

	it("uses sinf initDataType for FairPlay", async () => {
		const mock = vi.fn().mockResolvedValue({} as MediaKeySystemAccess);
		mockRMKSA(mock);
		await detectKeySystem(["com.apple.fps.1_0"]);
		expect(mock).toHaveBeenCalledWith(
			"com.apple.fps.1_0",
			expect.arrayContaining([
				expect.objectContaining({ initDataTypes: ["sinf"] }),
			]),
		);
	});

	it("uses cenc initDataType for Widevine", async () => {
		const mock = vi.fn().mockResolvedValue({} as MediaKeySystemAccess);
		mockRMKSA(mock);
		await detectKeySystem(["com.widevine.alpha"]);
		expect(mock).toHaveBeenCalledWith(
			"com.widevine.alpha",
			expect.arrayContaining([
				expect.objectContaining({ initDataTypes: ["cenc"] }),
			]),
		);
	});

	it("detects PlayReady key system", async () => {
		mockRMKSA(vi.fn().mockResolvedValue({} as MediaKeySystemAccess));
		const result = await detectKeySystem(["com.microsoft.playready"]);
		expect(result).toBe("com.microsoft.playready");
	});

	it("detects PlayReady recommendation variant", async () => {
		const mock = vi
			.fn()
			.mockRejectedValueOnce(new Error("Not supported"))
			.mockResolvedValueOnce({} as MediaKeySystemAccess);
		mockRMKSA(mock);
		const result = await detectKeySystem([
			"com.microsoft.playready",
			"com.microsoft.playready.recommendation",
		]);
		expect(result).toBe("com.microsoft.playready.recommendation");
	});

	it("uses cenc initDataType for PlayReady", async () => {
		const mock = vi.fn().mockResolvedValue({} as MediaKeySystemAccess);
		mockRMKSA(mock);
		await detectKeySystem(["com.microsoft.playready"]);
		expect(mock).toHaveBeenCalledWith(
			"com.microsoft.playready",
			expect.arrayContaining([
				expect.objectContaining({ initDataTypes: ["cenc"] }),
			]),
		);
	});

	it("accepts KeySystemCandidate objects (backward compatible)", async () => {
		mockRMKSA(vi.fn().mockResolvedValue({} as MediaKeySystemAccess));
		const result = await detectKeySystem([
			{ keySystem: "com.widevine.alpha" },
		]);
		expect(result).toBe("com.widevine.alpha");
	});

	it("accepts mixed plain strings and KeySystemCandidate objects", async () => {
		const mock = vi
			.fn()
			.mockRejectedValueOnce(new Error("Not supported"))
			.mockResolvedValueOnce({} as MediaKeySystemAccess);
		mockRMKSA(mock);
		const result = await detectKeySystem([
			"com.widevine.alpha",
			{ keySystem: "com.microsoft.playready", robustness: "2000" },
		]);
		expect(result).toBe("com.microsoft.playready");
	});

	it("passes robustness to probe config via KeySystemCandidate", async () => {
		const mock = vi.fn().mockResolvedValue({} as MediaKeySystemAccess);
		mockRMKSA(mock);
		await detectKeySystem([
			{ keySystem: "com.widevine.alpha", robustness: "SW_SECURE_CRYPTO" },
		]);
		const config = mock.mock.calls[0][1] as MediaKeySystemConfiguration[];
		expect(config[0].videoCapabilities?.[0]?.robustness).toBe(
			"SW_SECURE_CRYPTO",
		);
	});

	it("passes encryptionScheme to probe config via KeySystemCandidate", async () => {
		const mock = vi.fn().mockResolvedValue({} as MediaKeySystemAccess);
		mockRMKSA(mock);
		await detectKeySystem([
			{ keySystem: "com.widevine.alpha", encryptionScheme: "cbcs" },
		]);
		const config = mock.mock.calls[0][1] as MediaKeySystemConfiguration[];
		const cap = config[0].videoCapabilities?.[0] as Record<string, unknown>;
		expect(cap.encryptionScheme).toBe("cbcs");
	});
});

describe("probeConfigFor", () => {
	it("returns sinf for FairPlay", () => {
		const config = probeConfigFor("com.apple.fps.1_0");
		expect(config[0].initDataTypes).toEqual(["sinf"]);
	});

	it("returns cenc for Widevine", () => {
		const config = probeConfigFor("com.widevine.alpha");
		expect(config[0].initDataTypes).toEqual(["cenc"]);
	});

	it("returns cenc for PlayReady", () => {
		const config = probeConfigFor("com.microsoft.playready");
		expect(config[0].initDataTypes).toEqual(["cenc"]);
	});

	it("includes robustness when provided", () => {
		const config = probeConfigFor(
			"com.widevine.alpha",
			"HW_SECURE_ALL",
		);
		expect(config[0].videoCapabilities?.[0]?.robustness).toBe(
			"HW_SECURE_ALL",
		);
	});

	it("omits robustness when not provided", () => {
		const config = probeConfigFor("com.widevine.alpha");
		expect(config[0].videoCapabilities?.[0]?.robustness).toBeUndefined();
	});

	it("includes encryptionScheme when provided", () => {
		const config = probeConfigFor(
			"com.widevine.alpha",
			undefined,
			"cenc",
		);
		const cap = config[0].videoCapabilities?.[0] as Record<string, unknown>;
		expect(cap.encryptionScheme).toBe("cenc");
	});

	it("omits encryptionScheme when not provided", () => {
		const config = probeConfigFor("com.widevine.alpha");
		const cap = config[0].videoCapabilities?.[0] as Record<string, unknown>;
		expect(cap.encryptionScheme).toBeUndefined();
	});

	it("includes both robustness and encryptionScheme together", () => {
		const config = probeConfigFor(
			"com.microsoft.playready",
			"3000",
			"cbcs",
		);
		const cap = config[0].videoCapabilities?.[0] as Record<string, unknown>;
		expect(cap.robustness).toBe("3000");
		expect(cap.encryptionScheme).toBe("cbcs");
	});
});

describe("queryDrmSupport", () => {
	it("returns a Map with support status for each key system", async () => {
		const mock = vi
			.fn()
			.mockResolvedValueOnce({} as MediaKeySystemAccess)
			.mockRejectedValueOnce(new Error("Not supported"))
			.mockResolvedValueOnce({} as MediaKeySystemAccess);
		mockRMKSA(mock);

		const result = await queryDrmSupport([
			"com.widevine.alpha",
			"com.apple.fps.1_0",
			"com.microsoft.playready",
		]);

		expect(result).toBeInstanceOf(Map);
		expect(result.get("com.widevine.alpha")).toBe(true);
		expect(result.get("com.apple.fps.1_0")).toBe(false);
		expect(result.get("com.microsoft.playready")).toBe(true);
	});

	it("returns all false when nothing is supported", async () => {
		mockRMKSA(vi.fn().mockRejectedValue(new Error("Not supported")));

		const result = await queryDrmSupport([
			"com.widevine.alpha",
			"com.microsoft.playready",
		]);

		expect(result.get("com.widevine.alpha")).toBe(false);
		expect(result.get("com.microsoft.playready")).toBe(false);
	});

	it("returns all true when everything is supported", async () => {
		mockRMKSA(vi.fn().mockResolvedValue({} as MediaKeySystemAccess));

		const result = await queryDrmSupport([
			"com.widevine.alpha",
			"com.apple.fps.1_0",
		]);

		expect(result.get("com.widevine.alpha")).toBe(true);
		expect(result.get("com.apple.fps.1_0")).toBe(true);
	});

	it("returns empty Map for empty input", async () => {
		const result = await queryDrmSupport([]);
		expect(result.size).toBe(0);
	});

	it("tests all key systems, not just the first match", async () => {
		const mock = vi.fn().mockResolvedValue({} as MediaKeySystemAccess);
		mockRMKSA(mock);

		await queryDrmSupport([
			"com.widevine.alpha",
			"com.microsoft.playready",
			"com.apple.fps.1_0",
		]);

		expect(mock).toHaveBeenCalledTimes(3);
	});
});
