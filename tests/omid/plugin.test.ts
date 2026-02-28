import { afterEach, describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { omid } from "../../src/omid/index.js";
import type { OmidPluginOptions } from "../../src/omid/types.js";
import type { Player } from "../../src/types.js";
import type { VastAd } from "../../src/vast/types.js";

vi.mock("../../src/omid/loader.js", () => ({
	loadOmSdk: vi.fn(),
}));

import { loadOmSdk } from "../../src/omid/loader.js";

const mockLoadOmSdk = loadOmSdk as ReturnType<typeof vi.fn>;

function createMockSdkNamespace() {
	let sessionObserver: ((event: { type: string }) => void) | null = null;

	const mockAdSession = {
		setCreativeType: vi.fn(),
		setImpressionType: vi.fn(),
		isSupported: vi.fn().mockReturnValue(true),
		start: vi.fn(),
		finish: vi.fn(),
		error: vi.fn(),
		registerSessionObserver: vi.fn(
			(handler: (event: { type: string }) => void) => {
				sessionObserver = handler;
			},
		),
	};

	const mockAdEvents = {
		impressionOccurred: vi.fn(),
		loaded: vi.fn(),
	};

	const mockMediaEvents = {
		start: vi.fn(),
		firstQuartile: vi.fn(),
		midpoint: vi.fn(),
		thirdQuartile: vi.fn(),
		complete: vi.fn(),
		pause: vi.fn(),
		resume: vi.fn(),
		bufferStart: vi.fn(),
		bufferFinish: vi.fn(),
		skipped: vi.fn(),
		volumeChange: vi.fn(),
		playerStateChange: vi.fn(),
		adUserInteraction: vi.fn(),
	};

	const mockContext = {
		setVideoElement: vi.fn(),
		setSlotElement: vi.fn(),
		setServiceWindow: vi.fn(),
	};

	const sdk = {
		Partner: vi.fn(),
		VerificationScriptResource: vi.fn(),
		Context: vi.fn().mockReturnValue(mockContext),
		AdSession: vi.fn().mockReturnValue(mockAdSession),
		AdEvents: vi.fn().mockReturnValue(mockAdEvents),
		MediaEvents: vi.fn().mockReturnValue(mockMediaEvents),
		VastProperties: vi.fn(),
	};

	return {
		sdk,
		mockAdSession,
		mockAdEvents,
		mockMediaEvents,
		triggerSessionStart: () => sessionObserver?.({ type: "sessionStart" }),
	};
}

function defaultOptions(
	overrides?: Partial<OmidPluginOptions>,
): OmidPluginOptions {
	return {
		partner: { name: "vide", version: "0.3.0" },
		serviceScriptUrl: "https://cdn.example.com/omweb-v1.js",
		...overrides,
	};
}

function defaultAd(overrides?: Partial<VastAd>): VastAd {
	return {
		id: "ad1",
		adSystem: "test",
		adTitle: "Test Ad",
		impressions: [],
		creatives: [],
		errors: [],
		verifications: [
			{
				vendor: "moat",
				resourceUrl: "https://cdn.moat.com/om.js",
				parameters: "p1=v1",
			},
		],
		...overrides,
	};
}

function setupPlayer(): { player: Player; el: HTMLVideoElement } {
	const el = document.createElement("video");
	const container = document.createElement("div");
	container.appendChild(el);
	document.body.appendChild(container);
	const player = createPlayer(el);
	return { player, el };
}

afterEach(() => {
	vi.restoreAllMocks();
	mockLoadOmSdk.mockReset();
	for (const div of document.body.querySelectorAll("div")) {
		div.remove();
	}
});

describe("omid ad plugin", () => {
	it("starts SDK load on setup()", () => {
		const { player } = setupPlayer();
		const { sdk } = createMockSdkNamespace();
		mockLoadOmSdk.mockResolvedValue(sdk);

		omid(defaultOptions()).setup(player, defaultAd());

		expect(mockLoadOmSdk).toHaveBeenCalledWith(
			"https://cdn.example.com/omweb-v1.js",
			undefined,
			5000,
		);
	});

	it("creates session after SDK loads", async () => {
		const { player } = setupPlayer();
		const { sdk, mockAdEvents, triggerSessionStart } = createMockSdkNamespace();
		mockLoadOmSdk.mockResolvedValue(sdk);

		omid(defaultOptions()).setup(player, defaultAd());

		await vi.waitFor(() => {
			expect(sdk.AdSession).toHaveBeenCalled();
		});

		triggerSessionStart();

		await vi.waitFor(() => {
			expect(mockAdEvents.loaded).toHaveBeenCalled();
			expect(mockAdEvents.impressionOccurred).toHaveBeenCalled();
		});
	});

	it("gracefully handles SDK load failure", async () => {
		const { player } = setupPlayer();
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		mockLoadOmSdk.mockRejectedValue(new Error("network error"));

		const errorEvents: Array<{ error: Error; source: string }> = [];
		player.on("ad:error", (payload: { error: Error; source: string }) =>
			errorEvents.push(payload),
		);

		omid(defaultOptions()).setup(player, defaultAd());

		await vi.waitFor(() => {
			expect(errorEvents.length).toBe(1);
		});

		expect(errorEvents[0].error.message).toBe("network error");
		expect(errorEvents[0].source).toBe("omid");
		expect(warnSpy).toHaveBeenCalledWith(
			"[vide:omid] Failed to initialize:",
			"network error",
		);
	});

	it("gracefully handles session creation failure", async () => {
		const { player } = setupPlayer();
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		const { sdk, mockAdSession } = createMockSdkNamespace();
		(mockAdSession.isSupported as ReturnType<typeof vi.fn>).mockReturnValue(
			false,
		);
		mockLoadOmSdk.mockResolvedValue(sdk);

		const errorEvents: Array<{ error: Error; source: string }> = [];
		player.on("ad:error", (payload: { error: Error; source: string }) =>
			errorEvents.push(payload),
		);

		omid(defaultOptions()).setup(player, defaultAd());

		await vi.waitFor(() => {
			expect(errorEvents.length).toBe(1);
		});

		expect(errorEvents[0].error.message).toContain("not supported");
		expect(errorEvents[0].source).toBe("omid");
		expect(warnSpy).toHaveBeenCalled();
	});

	it("skips initialization if verifications array is empty", () => {
		const { player } = setupPlayer();
		mockLoadOmSdk.mockResolvedValue({});

		const cleanup = omid(defaultOptions()).setup(
			player,
			defaultAd({ verifications: [] }),
		);

		expect(cleanup).toBeUndefined();
		expect(mockLoadOmSdk).not.toHaveBeenCalled();
	});

	it("skips initialization if verifications is undefined", () => {
		const { player } = setupPlayer();
		mockLoadOmSdk.mockResolvedValue({});

		const cleanup = omid(defaultOptions()).setup(
			player,
			defaultAd({ verifications: undefined }),
		);

		expect(cleanup).toBeUndefined();
		expect(mockLoadOmSdk).not.toHaveBeenCalled();
	});

	it("cleanup aborts pending initialization", async () => {
		const { player } = setupPlayer();
		const { sdk } = createMockSdkNamespace();

		let resolveLoad: ((value: unknown) => void) | null = null;
		mockLoadOmSdk.mockReturnValue(
			new Promise((resolve) => {
				resolveLoad = resolve;
			}),
		);

		const cleanup = omid(defaultOptions()).setup(player, defaultAd());

		// Cleanup before SDK loads
		cleanup?.();

		// Now resolve the SDK load
		resolveLoad?.(sdk);
		await vi.waitFor(() => {});

		// Session should NOT have been created
		expect(sdk.AdSession).not.toHaveBeenCalled();
	});

	it("cleanup finishes active session", async () => {
		const { player } = setupPlayer();
		const { sdk, mockAdSession, triggerSessionStart } =
			createMockSdkNamespace();
		mockLoadOmSdk.mockResolvedValue(sdk);

		const cleanup = omid(defaultOptions()).setup(player, defaultAd());

		await vi.waitFor(() => {
			expect(sdk.AdSession).toHaveBeenCalled();
		});

		triggerSessionStart();

		await vi.waitFor(() => {
			expect(sdk.AdEvents).toHaveBeenCalled();
		});

		// Now cleanup - should finish the session
		cleanup?.();

		expect(mockAdSession.finish).toHaveBeenCalled();
	});

	it("uses custom timeout from options", () => {
		const { player } = setupPlayer();
		const { sdk } = createMockSdkNamespace();
		mockLoadOmSdk.mockResolvedValue(sdk);

		omid(defaultOptions({ timeout: 10000 })).setup(player, defaultAd());

		expect(mockLoadOmSdk).toHaveBeenCalledWith(
			"https://cdn.example.com/omweb-v1.js",
			undefined,
			10000,
		);
	});

	it("uses default Google-hosted service script URL when omitted", () => {
		const { player } = setupPlayer();
		const { sdk } = createMockSdkNamespace();
		mockLoadOmSdk.mockResolvedValue(sdk);

		omid({ partner: { name: "vide", version: "0.3.0" } }).setup(
			player,
			defaultAd(),
		);

		expect(mockLoadOmSdk).toHaveBeenCalledWith(
			"https://pagead2.googlesyndication.com/omsdk/releases/live/omweb-v1.js",
			undefined,
			5000,
		);
	});

	it("passes sessionClientUrl to loadOmSdk", () => {
		const { player } = setupPlayer();
		const { sdk } = createMockSdkNamespace();
		mockLoadOmSdk.mockResolvedValue(sdk);

		omid(
			defaultOptions({
				sessionClientUrl: "https://cdn.example.com/omid-session-client-v1.js",
			}),
		).setup(player, defaultAd());

		expect(mockLoadOmSdk).toHaveBeenCalledWith(
			"https://cdn.example.com/omweb-v1.js",
			"https://cdn.example.com/omid-session-client-v1.js",
			5000,
		);
	});
});
