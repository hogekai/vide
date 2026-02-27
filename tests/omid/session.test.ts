import { afterEach, describe, expect, it, vi } from "vitest";
import { createOmidSession } from "../../src/omid/session.js";
import type {
	OmidAdSession,
	OmidContext,
	OmidPluginOptions,
	OmidSessionClientNamespace,
} from "../../src/omid/types.js";

function createMockSdk() {
	const mockAdSession: OmidAdSession = {
		setCreativeType: vi.fn(),
		setImpressionType: vi.fn(),
		isSupported: vi.fn().mockReturnValue(true),
		start: vi.fn(),
		finish: vi.fn(),
		error: vi.fn(),
		registerSessionObserver: vi.fn(),
	};

	const mockContext: OmidContext = {
		setVideoElement: vi.fn(),
		setSlotElement: vi.fn(),
		setServiceWindow: vi.fn(),
	};

	const sdk: OmidSessionClientNamespace = {
		Partner: vi.fn() as unknown as OmidSessionClientNamespace["Partner"],
		VerificationScriptResource:
			vi.fn() as unknown as OmidSessionClientNamespace["VerificationScriptResource"],
		Context: vi
			.fn()
			.mockReturnValue(
				mockContext,
			) as unknown as OmidSessionClientNamespace["Context"],
		AdSession: vi
			.fn()
			.mockReturnValue(
				mockAdSession,
			) as unknown as OmidSessionClientNamespace["AdSession"],
		AdEvents: vi.fn().mockReturnValue({
			impressionOccurred: vi.fn(),
			loaded: vi.fn(),
		}) as unknown as OmidSessionClientNamespace["AdEvents"],
		MediaEvents: vi.fn().mockReturnValue({
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
		}) as unknown as OmidSessionClientNamespace["MediaEvents"],
		VastProperties:
			vi.fn() as unknown as OmidSessionClientNamespace["VastProperties"],
	};

	return { sdk, mockAdSession, mockContext };
}

function defaultOptions(
	overrides?: Partial<OmidPluginOptions>,
): OmidPluginOptions {
	return {
		verifications: [
			{
				vendor: "moat",
				resourceUrl: "https://cdn.moat.com/om.js",
				parameters: "param1=value1",
			},
		],
		partner: { name: "vide", version: "0.3.0" },
		serviceScriptUrl: "https://cdn.example.com/omweb-v1.js",
		...overrides,
	};
}

function createVideoInContainer(): HTMLVideoElement {
	const container = document.createElement("div");
	const video = document.createElement("video");
	container.appendChild(video);
	document.body.appendChild(container);
	return video;
}

afterEach(() => {
	vi.restoreAllMocks();
	for (const div of document.body.querySelectorAll("div")) {
		div.remove();
	}
});

describe("createOmidSession", () => {
	it("creates Partner with correct name and version", () => {
		const { sdk } = createMockSdk();
		const video = createVideoInContainer();

		createOmidSession(sdk, video, defaultOptions());

		expect(sdk.Partner).toHaveBeenCalledWith("vide", "0.3.0");
	});

	it("creates VerificationScriptResource for each verification", () => {
		const { sdk } = createMockSdk();
		const video = createVideoInContainer();

		createOmidSession(
			sdk,
			video,
			defaultOptions({
				verifications: [
					{
						vendor: "moat",
						resourceUrl: "https://cdn.moat.com/om.js",
						parameters: "p1=v1",
					},
					{
						vendor: "ias",
						resourceUrl: "https://cdn.ias.com/om.js",
						parameters: "p2=v2",
					},
				],
			}),
		);

		expect(sdk.VerificationScriptResource).toHaveBeenCalledTimes(2);
		expect(sdk.VerificationScriptResource).toHaveBeenCalledWith(
			"https://cdn.moat.com/om.js",
			"moat",
			"p1=v1",
			"full",
		);
		expect(sdk.VerificationScriptResource).toHaveBeenCalledWith(
			"https://cdn.ias.com/om.js",
			"ias",
			"p2=v2",
			"full",
		);
	});

	it("filters out verifications with empty resourceUrl", () => {
		const { sdk } = createMockSdk();
		const video = createVideoInContainer();

		createOmidSession(
			sdk,
			video,
			defaultOptions({
				verifications: [
					{ vendor: "moat", resourceUrl: "" },
					{
						vendor: "ias",
						resourceUrl: "https://cdn.ias.com/om.js",
					},
				],
			}),
		);

		expect(sdk.VerificationScriptResource).toHaveBeenCalledTimes(1);
		expect(sdk.VerificationScriptResource).toHaveBeenCalledWith(
			"https://cdn.ias.com/om.js",
			"ias",
			undefined,
			"full",
		);
	});

	it("creates Context with partner, resources, contentUrl, customReferenceData", () => {
		const { sdk } = createMockSdk();
		const video = createVideoInContainer();

		createOmidSession(
			sdk,
			video,
			defaultOptions({
				contentUrl: "https://example.com/article",
				customReferenceData: "ref123",
			}),
		);

		expect(sdk.Context).toHaveBeenCalledWith(
			expect.anything(), // partner instance
			expect.any(Array), // resources
			"https://example.com/article",
			"ref123",
		);
	});

	it("calls context.setVideoElement with the video element", () => {
		const { sdk, mockContext } = createMockSdk();
		const video = createVideoInContainer();

		createOmidSession(sdk, video, defaultOptions());

		expect(mockContext.setVideoElement).toHaveBeenCalledWith(video);
	});

	it("calls context.setSlotElement with video parent", () => {
		const { sdk, mockContext } = createMockSdk();
		const video = createVideoInContainer();

		createOmidSession(sdk, video, defaultOptions());

		expect(mockContext.setSlotElement).toHaveBeenCalledWith(
			video.parentElement,
		);
	});

	it("skips setSlotElement if video has no parent", () => {
		const { sdk, mockContext } = createMockSdk();
		const video = document.createElement("video");

		createOmidSession(sdk, video, defaultOptions());

		expect(mockContext.setSlotElement).not.toHaveBeenCalled();
	});

	it("calls context.setServiceWindow with window", () => {
		const { sdk, mockContext } = createMockSdk();
		const video = createVideoInContainer();

		createOmidSession(sdk, video, defaultOptions());

		expect(mockContext.setServiceWindow).toHaveBeenCalledWith(window);
	});

	it("creates AdSession and calls setCreativeType/setImpressionType", () => {
		const { sdk, mockAdSession } = createMockSdk();
		const video = createVideoInContainer();

		createOmidSession(sdk, video, defaultOptions());

		expect(sdk.AdSession).toHaveBeenCalled();
		expect(mockAdSession.setCreativeType).toHaveBeenCalledWith("video");
		expect(mockAdSession.setImpressionType).toHaveBeenCalledWith(
			"beginToRender",
		);
	});

	it("throws if isSupported() returns false", () => {
		const { sdk, mockAdSession } = createMockSdk();
		(mockAdSession.isSupported as ReturnType<typeof vi.fn>).mockReturnValue(
			false,
		);
		const video = createVideoInContainer();

		expect(() => createOmidSession(sdk, video, defaultOptions())).toThrow(
			"OM SDK session not supported",
		);
	});

	it("calls adSession.start()", () => {
		const { sdk, mockAdSession } = createMockSdk();
		const video = createVideoInContainer();

		createOmidSession(sdk, video, defaultOptions());

		expect(mockAdSession.start).toHaveBeenCalled();
	});

	it("waitForStart resolves true when sessionStart event fires", async () => {
		const { sdk, mockAdSession } = createMockSdk();
		const video = createVideoInContainer();

		const session = createOmidSession(sdk, video, defaultOptions());

		// Get the observer callback
		const observerCall = (
			mockAdSession.registerSessionObserver as ReturnType<typeof vi.fn>
		).mock.calls[0];
		const observer = observerCall[0] as (event: { type: string }) => void;

		// Fire sessionStart
		observer({ type: "sessionStart" });

		const result = await session.waitForStart(5000);
		expect(result).toBe(true);
		expect(session.started).toBe(true);
	});

	it("waitForStart resolves false on timeout", async () => {
		vi.useFakeTimers();
		const { sdk } = createMockSdk();
		const video = createVideoInContainer();

		const session = createOmidSession(sdk, video, defaultOptions());

		const promise = session.waitForStart(1000);
		vi.advanceTimersByTime(1000);

		const result = await promise;
		expect(result).toBe(false);
		expect(session.started).toBe(false);

		vi.useRealTimers();
	});

	it("waitForStart resolves immediately if already started", async () => {
		const { sdk, mockAdSession } = createMockSdk();
		const video = createVideoInContainer();

		const session = createOmidSession(sdk, video, defaultOptions());

		// Fire sessionStart before waitForStart
		const observer = (
			mockAdSession.registerSessionObserver as ReturnType<typeof vi.fn>
		).mock.calls[0][0] as (event: { type: string }) => void;
		observer({ type: "sessionStart" });

		const result = await session.waitForStart(5000);
		expect(result).toBe(true);
	});

	it("finish is idempotent", () => {
		const { sdk, mockAdSession } = createMockSdk();
		const video = createVideoInContainer();

		const session = createOmidSession(sdk, video, defaultOptions());

		session.finish();
		session.finish();
		session.finish();

		expect(mockAdSession.finish).toHaveBeenCalledTimes(1);
	});

	it("error calls adSession.error with video error type", () => {
		const { sdk, mockAdSession } = createMockSdk();
		const video = createVideoInContainer();

		const session = createOmidSession(sdk, video, defaultOptions());
		session.error("playback failed");

		expect(mockAdSession.error).toHaveBeenCalledWith(
			"video",
			"playback failed",
		);
	});

	it("creates VastProperties with default values", () => {
		const { sdk } = createMockSdk();
		const video = createVideoInContainer();

		createOmidSession(sdk, video, defaultOptions());

		expect(sdk.VastProperties).toHaveBeenCalledWith(
			false, // isSkippable (no skipOffset)
			-1, // skipOffset default
			true, // isAutoPlay default
			"standalone", // position default
		);
	});

	it("creates VastProperties with custom position and skipOffset", () => {
		const { sdk } = createMockSdk();
		const video = createVideoInContainer();

		createOmidSession(
			sdk,
			video,
			defaultOptions({
				position: "preroll",
				skipOffset: 5,
				isAutoPlay: false,
			}),
		);

		expect(sdk.VastProperties).toHaveBeenCalledWith(
			true, // isSkippable
			5, // skipOffset
			false, // isAutoPlay
			"preroll", // position
		);
	});
});
