import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { drm } from "../../src/drm/index.js";
import type { ResolvedDrmConfig } from "../../src/drm/types.js";
import { ERR_DRM_UNSUPPORTED } from "../../src/errors.js";

function makeVideo(): HTMLVideoElement {
	const el = document.createElement("video");
	el.play = vi.fn().mockResolvedValue(undefined);
	el.pause = vi.fn();
	el.load = vi.fn();
	el.canPlayType = vi.fn().mockReturnValue("");
	return el;
}

/** Wait for the detectKeySystem promise to settle. */
async function flushDetection(): Promise<void> {
	await new Promise((r) => setTimeout(r, 0));
}

const originalRMKSA = navigator.requestMediaKeySystemAccess;

afterEach(() => {
	Object.defineProperty(navigator, "requestMediaKeySystemAccess", {
		value: originalRMKSA,
		writable: true,
		configurable: true,
	});
});

describe("drm plugin", () => {
	beforeEach(() => {
		Object.defineProperty(navigator, "requestMediaKeySystemAccess", {
			value: vi.fn().mockResolvedValue({} as MediaKeySystemAccess),
			writable: true,
			configurable: true,
		});
	});

	it("stores resolved DRM config via setPluginData", async () => {
		const player = createPlayer(makeVideo());
		player.use(
			drm({
				widevine: { licenseUrl: "https://lic.example.com" },
			}),
		);
		await flushDetection();
		const data = player.getPluginData("drm") as ResolvedDrmConfig;
		expect(data).toBeDefined();
		expect(data.keySystem).toBe("com.widevine.alpha");
		expect(data.hlsConfig).toBeDefined();
		expect(data.dashConfig).toBeDefined();
	});

	it("resolves FairPlay when only FairPlay is configured", async () => {
		const player = createPlayer(makeVideo());
		player.use(
			drm({
				fairplay: {
					licenseUrl: "https://fp.example.com/license",
					certificateUrl: "https://fp.example.com/cert",
				},
			}),
		);
		await flushDetection();
		const data = player.getPluginData("drm") as ResolvedDrmConfig;
		expect(data.keySystem).toBe("com.apple.fps.1_0");
	});

	it("prefers Widevine when both are configured and supported", async () => {
		const player = createPlayer(makeVideo());
		player.use(
			drm({
				widevine: { licenseUrl: "https://wv.example.com" },
				fairplay: {
					licenseUrl: "https://fp.example.com/license",
					certificateUrl: "https://fp.example.com/cert",
				},
			}),
		);
		await flushDetection();
		const data = player.getPluginData("drm") as ResolvedDrmConfig;
		expect(data.keySystem).toBe("com.widevine.alpha");
	});

	it("emits error when no key system is supported", async () => {
		Object.defineProperty(navigator, "requestMediaKeySystemAccess", {
			value: vi.fn().mockRejectedValue(new Error("Not supported")),
			writable: true,
			configurable: true,
		});
		const player = createPlayer(makeVideo());
		const errorHandler = vi.fn();
		player.on("error", errorHandler);
		player.use(
			drm({
				widevine: { licenseUrl: "https://lic.example.com" },
			}),
		);
		await flushDetection();
		expect(errorHandler).toHaveBeenCalledWith({
			code: ERR_DRM_UNSUPPORTED,
			message: "No supported DRM key system found",
			source: "drm",
		});
	});

	it("warns when no DRM options provided", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const player = createPlayer(makeVideo());
		player.use(drm({}));
		expect(warn).toHaveBeenCalledWith(
			"[vide/drm] No DRM configuration provided",
		);
		warn.mockRestore();
	});

	it("does not store config after destroy", async () => {
		const player = createPlayer(makeVideo());
		player.use(
			drm({
				widevine: { licenseUrl: "https://lic.example.com" },
			}),
		);
		player.destroy();
		await flushDetection();
		expect(player.getPluginData("drm")).toBeUndefined();
	});

	it("hlsConfig contains emeEnabled for Widevine", async () => {
		const player = createPlayer(makeVideo());
		player.use(
			drm({
				widevine: { licenseUrl: "https://lic.example.com" },
			}),
		);
		await flushDetection();
		const data = player.getPluginData("drm") as ResolvedDrmConfig;
		expect(data.hlsConfig.emeEnabled).toBe(true);
	});

	it("dashConfig contains protection data for Widevine", async () => {
		const player = createPlayer(makeVideo());
		player.use(
			drm({
				widevine: { licenseUrl: "https://lic.example.com" },
			}),
		);
		await flushDetection();
		const data = player.getPluginData("drm") as ResolvedDrmConfig;
		const streaming = data.dashConfig.streaming as Record<string, unknown>;
		const protection = streaming.protection as Record<string, unknown>;
		const protData = protection.data as Record<string, Record<string, unknown>>;
		expect(protData["com.widevine.alpha"].serverURL).toBe(
			"https://lic.example.com",
		);
	});
});
