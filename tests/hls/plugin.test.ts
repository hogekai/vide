import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { ERR_HLS_FATAL, ERR_HLS_UNSUPPORTED } from "../../src/errors.js";
import { hls } from "../../src/hls/index.js";

// --- hls.js mock ---

const mockInstance = {
	attachMedia: vi.fn(),
	loadSource: vi.fn(),
	destroy: vi.fn(),
	on: vi.fn(),
	levels: [] as Array<{ width: number; height: number; bitrate: number }>,
	currentLevel: -1,
	autoLevelEnabled: true,
	recoverMediaError: vi.fn(),
	startLoad: vi.fn(),
};

const MockHls = vi.fn(() => mockInstance) as ReturnType<typeof vi.fn> & {
	isSupported: ReturnType<typeof vi.fn>;
	Events: {
		ERROR: string;
		MANIFEST_PARSED: string;
		LEVEL_SWITCHED: string;
		FRAG_LOADED: string;
	};
};
MockHls.isSupported = vi.fn(() => true);
MockHls.Events = {
	ERROR: "hlsError",
	MANIFEST_PARSED: "hlsManifestParsed",
	LEVEL_SWITCHED: "hlsLevelSwitched",
	FRAG_LOADED: "hlsFragLoaded",
};

vi.mock("hls.js", () => ({ default: MockHls }));

// --- helpers ---

function makeVideo(): HTMLVideoElement {
	const el = document.createElement("video");
	el.play = vi.fn().mockResolvedValue(undefined);
	el.pause = vi.fn();
	el.load = vi.fn();
	el.canPlayType = vi.fn().mockReturnValue("");
	return el;
}

/** Wait for the dynamic import("hls.js") promise to settle. */
async function flushImport(): Promise<void> {
	await new Promise((r) => setTimeout(r, 0));
}

type ErrorCallback = (
	event: string,
	data: { fatal: boolean; type: string; details: string },
) => void;

/** Extract the hls.js ERROR event callback from mock calls. */
function getErrorCallback(): ErrorCallback {
	const call = mockInstance.on.mock.calls.find(
		(c: unknown[]) => c[0] === "hlsError",
	);
	return call[1] as ErrorCallback;
}

beforeEach(() => {
	mockInstance.attachMedia.mockClear();
	mockInstance.loadSource.mockClear();
	mockInstance.destroy.mockClear();
	mockInstance.on.mockClear();
	mockInstance.recoverMediaError.mockClear();
	mockInstance.startLoad.mockClear();
	mockInstance.levels = [];
	mockInstance.currentLevel = -1;
	mockInstance.autoLevelEnabled = true;
	MockHls.mockClear();
	MockHls.isSupported.mockReturnValue(true);
});

describe("hls plugin — canHandle", () => {
	it("handles .m3u8 URLs", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(hls());
		player.src = "https://cdn.example.com/live/index.m3u8";
		expect(player.src).toBe("https://cdn.example.com/live/index.m3u8");
		expect(player.state).toBe("loading");
	});

	it("handles HLS mime type via <source>", () => {
		const el = makeVideo();
		const source = document.createElement("source");
		source.setAttribute("src", "https://example.com/stream");
		source.setAttribute("type", "application/vnd.apple.mpegurl");
		el.appendChild(source);
		const player = createPlayer(el);
		player.use(hls());
		expect(player.src).toBe("https://example.com/stream");
	});

	it("handles application/x-mpegurl type", () => {
		const el = makeVideo();
		const source = document.createElement("source");
		source.setAttribute("src", "https://example.com/stream");
		source.setAttribute("type", "application/x-mpegurl");
		el.appendChild(source);
		const player = createPlayer(el);
		player.use(hls());
		expect(player.src).toBe("https://example.com/stream");
	});

	it("does not handle .mp4 URLs", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(hls());
		player.src = "https://example.com/video.mp4";
		expect(el.src).toContain("video.mp4");
	});
});

describe("hls plugin — Safari native fallback", () => {
	it("uses el.src directly when Hls.isSupported() is false and canPlayType is truthy", async () => {
		const el = makeVideo();
		(el.canPlayType as ReturnType<typeof vi.fn>).mockReturnValue("maybe");
		MockHls.isSupported.mockReturnValue(false);
		const player = createPlayer(el);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImport();
		expect(el.src).toContain("stream.m3u8");
		expect(mockInstance.attachMedia).not.toHaveBeenCalled();
		MockHls.isSupported.mockReturnValue(true);
	});
});

describe("hls plugin — hls.js integration", () => {
	it("calls attachMedia and loadSource on non-Safari", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImport();
		expect(mockInstance.attachMedia).toHaveBeenCalledWith(el);
		expect(mockInstance.loadSource).toHaveBeenCalledWith(
			"https://example.com/stream.m3u8",
		);
	});

	it("passes hlsConfig to hls.js constructor", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const config = { maxBufferLength: 60, enableWorker: false };
		player.use(hls({ hlsConfig: config }));
		player.src = "https://example.com/stream.m3u8";
		await flushImport();
		expect(MockHls).toHaveBeenCalledWith(config);
	});

	it("emits player error on fatal hls.js error", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const errorHandler = vi.fn();
		player.on("error", errorHandler);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImport();

		const errorCallback = getErrorCallback();
		expect(errorCallback).toBeDefined();

		errorCallback("hlsError", {
			fatal: true,
			type: "networkError",
			details: "manifestLoadError",
		});

		expect(errorHandler).toHaveBeenCalledWith(
			expect.objectContaining({
				code: ERR_HLS_FATAL,
				message: expect.stringContaining("HLS fatal error"),
				source: "hls",
			}),
		);
	});

	it("does not emit error on non-fatal hls.js error", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const errorHandler = vi.fn();
		player.on("error", errorHandler);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImport();

		const errorCallback = getErrorCallback();

		errorCallback("hlsError", {
			fatal: false,
			type: "networkError",
			details: "fragLoadError",
		});

		expect(errorHandler).not.toHaveBeenCalled();
	});

	it("emits error when Hls.isSupported() returns false", async () => {
		MockHls.isSupported.mockReturnValue(false);
		const el = makeVideo();
		const player = createPlayer(el);
		const errorHandler = vi.fn();
		player.on("error", errorHandler);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImport();
		expect(errorHandler).toHaveBeenCalledWith({
			code: ERR_HLS_UNSUPPORTED,
			message: "HLS is not supported in this browser",
			source: "hls",
		});
	});
});

describe("hls plugin — <source> tag handling", () => {
	it("source elements are removed after HLS handler claims via <source>", () => {
		const el = makeVideo();
		const source = document.createElement("source");
		source.setAttribute("src", "https://example.com/stream.m3u8");
		source.setAttribute("type", "application/vnd.apple.mpegurl");
		el.appendChild(source);

		const player = createPlayer(el);
		player.use(hls());

		expect(el.querySelectorAll("source").length).toBe(0);
		expect(player.state).toBe("loading");
	});

	it("no spurious error from native load attempt with <source> tags", async () => {
		const el = makeVideo();
		const source = document.createElement("source");
		source.setAttribute("src", "https://example.com/stream.m3u8");
		source.setAttribute("type", "application/vnd.apple.mpegurl");
		el.appendChild(source);

		const player = createPlayer(el);
		const errorHandler = vi.fn();
		player.on("error", errorHandler);
		player.use(hls());

		await flushImport();

		expect(errorHandler).not.toHaveBeenCalled();
		expect(player.state).toBe("loading");
	});
});

describe("hls plugin — DRM integration", () => {
	it("merges DRM config from pluginData into hls.js constructor", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.setPluginData("drm", {
			keySystem: "com.widevine.alpha",
			hlsConfig: {
				emeEnabled: true,
				drmSystems: {
					"com.widevine.alpha": {
						licenseUrl: "https://lic.example.com",
					},
				},
			},
			dashConfig: {},
		});
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImport();
		expect(MockHls).toHaveBeenCalledWith(
			expect.objectContaining({ emeEnabled: true }),
		);
	});

	it("user hlsConfig is merged with DRM config", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.setPluginData("drm", {
			keySystem: "com.widevine.alpha",
			hlsConfig: { emeEnabled: true },
			dashConfig: {},
		});
		player.use(hls({ hlsConfig: { maxBufferLength: 60 } }));
		player.src = "https://example.com/stream.m3u8";
		await flushImport();
		expect(MockHls).toHaveBeenCalledWith(
			expect.objectContaining({
				emeEnabled: true,
				maxBufferLength: 60,
			}),
		);
	});

	it("works without DRM plugin (no pluginData)", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(hls({ hlsConfig: { maxBufferLength: 60 } }));
		player.src = "https://example.com/stream.m3u8";
		await flushImport();
		expect(MockHls).toHaveBeenCalledWith({ maxBufferLength: 60 });
	});
});

describe("hls plugin — pluginData", () => {
	it("exposes hls.js instance via setPluginData('hls')", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImport();
		expect(player.getPluginData("hls")).toBeDefined();
	});
});

describe("hls plugin — lifecycle", () => {
	it("destroys hls.js instance when source changes", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(hls());
		player.src = "https://example.com/a.m3u8";
		await flushImport();
		expect(mockInstance.attachMedia).toHaveBeenCalled();

		player.src = "https://example.com/b.m3u8";
		expect(mockInstance.destroy).toHaveBeenCalled();
	});

	it("destroys hls.js instance on player.destroy()", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImport();

		player.destroy();
		expect(mockInstance.destroy).toHaveBeenCalled();
	});

	it("does not call hls.js after plugin is destroyed", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(hls());
		player.destroy();
		await flushImport();
		expect(mockInstance.attachMedia).not.toHaveBeenCalled();
	});
});

describe("hls plugin — quality levels", () => {
	/** Extract the MANIFEST_PARSED callback from mock calls. */
	function getManifestCallback(): () => void {
		const call = mockInstance.on.mock.calls.find(
			(c: unknown[]) => c[0] === "hlsManifestParsed",
		);
		return call[1] as () => void;
	}

	/** Extract the LEVEL_SWITCHED callback from mock calls. */
	function getLevelSwitchedCallback(): (
		event: string,
		data: { level: number },
	) => void {
		const call = mockInstance.on.mock.calls.find(
			(c: unknown[]) => c[0] === "hlsLevelSwitched",
		);
		return call[1] as (event: string, data: { level: number }) => void;
	}

	it("sets qualities on MANIFEST_PARSED", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImport();

		mockInstance.levels = [
			{ width: 1280, height: 720, bitrate: 2_000_000 },
			{ width: 1920, height: 1080, bitrate: 5_000_000 },
		];
		getManifestCallback()();

		expect(player.qualities).toEqual([
			{ id: 0, width: 1280, height: 720, bitrate: 2_000_000, label: "720p" },
			{
				id: 1,
				width: 1920,
				height: 1080,
				bitrate: 5_000_000,
				label: "1080p",
			},
		]);
	});

	it("emits qualitiesavailable on MANIFEST_PARSED", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const handler = vi.fn();
		player.on("qualitiesavailable", handler);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImport();

		mockInstance.levels = [{ width: 1280, height: 720, bitrate: 2_000_000 }];
		getManifestCallback()();

		expect(handler).toHaveBeenCalledWith({
			qualities: [
				{
					id: 0,
					width: 1280,
					height: 720,
					bitrate: 2_000_000,
					label: "720p",
				},
			],
		});
	});

	it("sets currentQuality on LEVEL_SWITCHED", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImport();

		mockInstance.levels = [
			{ width: 1280, height: 720, bitrate: 2_000_000 },
			{ width: 1920, height: 1080, bitrate: 5_000_000 },
		];
		getManifestCallback()();

		getLevelSwitchedCallback()("hlsLevelSwitched", { level: 1 });

		expect(player.currentQuality).toEqual({
			id: 1,
			width: 1920,
			height: 1080,
			bitrate: 5_000_000,
			label: "1080p",
		});
	});

	it("emits qualitychange on LEVEL_SWITCHED", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const handler = vi.fn();
		player.on("qualitychange", handler);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImport();

		mockInstance.levels = [
			{ width: 1280, height: 720, bitrate: 2_000_000 },
			{ width: 1920, height: 1080, bitrate: 5_000_000 },
		];
		getManifestCallback()();

		getLevelSwitchedCallback()("hlsLevelSwitched", { level: 0 });

		expect(handler).toHaveBeenCalledWith({
			from: null,
			to: {
				id: 0,
				width: 1280,
				height: 720,
				bitrate: 2_000_000,
				label: "720p",
			},
		});
	});

	it("setQuality locks to specific level", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImport();

		mockInstance.levels = [
			{ width: 1280, height: 720, bitrate: 2_000_000 },
			{ width: 1920, height: 1080, bitrate: 5_000_000 },
		];
		getManifestCallback()();

		player.setQuality(1);
		expect(mockInstance.currentLevel).toBe(1);
		expect(player.isAutoQuality).toBe(false);
	});

	it("setQuality(-1) restores ABR", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImport();

		mockInstance.levels = [{ width: 1280, height: 720, bitrate: 2_000_000 }];
		getManifestCallback()();

		player.setQuality(0);
		expect(player.isAutoQuality).toBe(false);

		player.setQuality(-1);
		expect(mockInstance.currentLevel).toBe(-1);
		expect(player.isAutoQuality).toBe(true);
	});

	it("updates autoQuality from hls.js on LEVEL_SWITCHED", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImport();

		mockInstance.levels = [{ width: 1280, height: 720, bitrate: 2_000_000 }];
		getManifestCallback()();

		mockInstance.autoLevelEnabled = false;
		getLevelSwitchedCallback()("hlsLevelSwitched", { level: 0 });
		expect(player.isAutoQuality).toBe(false);

		mockInstance.autoLevelEnabled = true;
		getLevelSwitchedCallback()("hlsLevelSwitched", { level: 0 });
		expect(player.isAutoQuality).toBe(true);
	});
});

describe("hls plugin — error recovery", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	/** flushImport with fake timers needs manual microtask flush. */
	async function flushImportFake(): Promise<void> {
		await vi.advanceTimersByTimeAsync(0);
	}

	function getFragLoadedCallback(): () => void {
		const call = mockInstance.on.mock.calls.find(
			(c: unknown[]) => c[0] === "hlsFragLoaded",
		);
		return call[1] as () => void;
	}

	it("emits recoverable error on first fatal network error", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const errorHandler = vi.fn();
		player.on("error", errorHandler);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImportFake();

		const errorCallback = getErrorCallback();
		errorCallback("hlsError", {
			fatal: true,
			type: "networkError",
			details: "manifestLoadError",
		});

		expect(errorHandler).toHaveBeenCalledWith({
			code: ERR_HLS_FATAL,
			message: expect.stringContaining("HLS fatal error"),
			source: "hls",
			recoverable: true,
			retryCount: 1,
		});
	});

	it("calls startLoad(-1) for network errors after delay", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImportFake();

		const errorCallback = getErrorCallback();
		errorCallback("hlsError", {
			fatal: true,
			type: "networkError",
			details: "manifestLoadError",
		});

		expect(mockInstance.startLoad).not.toHaveBeenCalled();
		vi.advanceTimersByTime(3000);
		expect(mockInstance.startLoad).toHaveBeenCalledWith(-1);
	});

	it("calls recoverMediaError for media errors after delay", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImportFake();

		const errorCallback = getErrorCallback();
		errorCallback("hlsError", {
			fatal: true,
			type: "mediaError",
			details: "bufferStalledError",
		});

		expect(mockInstance.recoverMediaError).not.toHaveBeenCalled();
		vi.advanceTimersByTime(3000);
		expect(mockInstance.recoverMediaError).toHaveBeenCalled();
	});

	it("applies exponential backoff", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImportFake();

		const errorCallback = getErrorCallback();

		// 1st error: delay = 3000ms (3000 * 2^0)
		errorCallback("hlsError", {
			fatal: true,
			type: "networkError",
			details: "fragLoadError",
		});
		vi.advanceTimersByTime(3000);
		expect(mockInstance.startLoad).toHaveBeenCalledTimes(1);

		// 2nd error: delay = 6000ms (3000 * 2^1)
		errorCallback("hlsError", {
			fatal: true,
			type: "networkError",
			details: "fragLoadError",
		});
		vi.advanceTimersByTime(5999);
		expect(mockInstance.startLoad).toHaveBeenCalledTimes(1);
		vi.advanceTimersByTime(1);
		expect(mockInstance.startLoad).toHaveBeenCalledTimes(2);

		// 3rd error: delay = 12000ms (3000 * 2^2)
		errorCallback("hlsError", {
			fatal: true,
			type: "networkError",
			details: "fragLoadError",
		});
		vi.advanceTimersByTime(11999);
		expect(mockInstance.startLoad).toHaveBeenCalledTimes(2);
		vi.advanceTimersByTime(1);
		expect(mockInstance.startLoad).toHaveBeenCalledTimes(3);
	});

	it("emits recoverable: false after max retries exceeded", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const errorHandler = vi.fn();
		player.on("error", errorHandler);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImportFake();

		const errorCallback = getErrorCallback();

		// Exhaust 3 retries
		for (let i = 0; i < 3; i++) {
			errorCallback("hlsError", {
				fatal: true,
				type: "networkError",
				details: "fragLoadError",
			});
		}

		// 4th error: max retries exceeded
		errorCallback("hlsError", {
			fatal: true,
			type: "networkError",
			details: "fragLoadError",
		});

		const lastCall =
			errorHandler.mock.calls[errorHandler.mock.calls.length - 1][0];
		expect(lastCall.recoverable).toBe(false);
		expect(lastCall.retryCount).toBeUndefined();
	});

	it("does not call startLoad after max retries exceeded", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImportFake();

		const errorCallback = getErrorCallback();

		// Fire errors one at a time, letting each timer fire
		for (let i = 0; i < 3; i++) {
			errorCallback("hlsError", {
				fatal: true,
				type: "networkError",
				details: "fragLoadError",
			});
			vi.advanceTimersByTime(3000 * 2 ** i);
		}
		expect(mockInstance.startLoad).toHaveBeenCalledTimes(3);

		// 4th error: max retries exceeded, no more recovery
		errorCallback("hlsError", {
			fatal: true,
			type: "networkError",
			details: "fragLoadError",
		});
		vi.advanceTimersByTime(100000);
		expect(mockInstance.startLoad).toHaveBeenCalledTimes(3);
	});

	it("resets retry count on FRAG_LOADED", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const errorHandler = vi.fn();
		player.on("error", errorHandler);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImportFake();

		const errorCallback = getErrorCallback();
		const fragLoadedCallback = getFragLoadedCallback();

		// Trigger 2 errors
		errorCallback("hlsError", {
			fatal: true,
			type: "networkError",
			details: "fragLoadError",
		});
		errorCallback("hlsError", {
			fatal: true,
			type: "networkError",
			details: "fragLoadError",
		});

		// Recovery succeeds
		fragLoadedCallback();

		// New error should start fresh with retryCount: 1
		errorCallback("hlsError", {
			fatal: true,
			type: "networkError",
			details: "fragLoadError",
		});

		const lastCall =
			errorHandler.mock.calls[errorHandler.mock.calls.length - 1][0];
		expect(lastCall.recoverable).toBe(true);
		expect(lastCall.retryCount).toBe(1);
	});

	it("clears recovery timer on source change", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImportFake();

		const errorCallback = getErrorCallback();
		errorCallback("hlsError", {
			fatal: true,
			type: "networkError",
			details: "fragLoadError",
		});

		// Change source (triggers unload)
		player.src = "https://example.com/other.m3u8";

		// Advance past the timer
		vi.advanceTimersByTime(10000);
		expect(mockInstance.startLoad).not.toHaveBeenCalled();
	});

	it("clears recovery timer on destroy", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(hls());
		player.src = "https://example.com/stream.m3u8";
		await flushImportFake();

		const errorCallback = getErrorCallback();
		errorCallback("hlsError", {
			fatal: true,
			type: "networkError",
			details: "fragLoadError",
		});

		player.destroy();

		vi.advanceTimersByTime(10000);
		expect(mockInstance.startLoad).not.toHaveBeenCalled();
	});

	it("disables recovery when options.recovery is false", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const errorHandler = vi.fn();
		player.on("error", errorHandler);
		player.use(hls({ recovery: false }));
		player.src = "https://example.com/stream.m3u8";
		await flushImportFake();

		const errorCallback = getErrorCallback();
		errorCallback("hlsError", {
			fatal: true,
			type: "networkError",
			details: "manifestLoadError",
		});

		expect(errorHandler).toHaveBeenCalledWith({
			code: ERR_HLS_FATAL,
			message: expect.stringContaining("HLS fatal error"),
			source: "hls",
			recoverable: false,
			retryCount: undefined,
		});

		vi.advanceTimersByTime(10000);
		expect(mockInstance.startLoad).not.toHaveBeenCalled();
	});

	it("uses custom recovery config", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const errorHandler = vi.fn();
		player.on("error", errorHandler);
		player.use(hls({ recovery: { maxRetries: 1, retryDelay: 1000 } }));
		player.src = "https://example.com/stream.m3u8";
		await flushImportFake();

		const errorCallback = getErrorCallback();

		// 1st error: recoverable
		errorCallback("hlsError", {
			fatal: true,
			type: "networkError",
			details: "fragLoadError",
		});
		expect(errorHandler.mock.calls[0][0].recoverable).toBe(true);

		vi.advanceTimersByTime(1000);
		expect(mockInstance.startLoad).toHaveBeenCalledTimes(1);

		// 2nd error: max retries exceeded (maxRetries: 1)
		errorCallback("hlsError", {
			fatal: true,
			type: "networkError",
			details: "fragLoadError",
		});
		expect(errorHandler.mock.calls[1][0].recoverable).toBe(false);
	});
});
