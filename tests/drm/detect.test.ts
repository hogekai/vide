import { afterEach, describe, expect, it, vi } from "vitest";
import { detectKeySystem } from "../../src/drm/detect.js";

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
});
