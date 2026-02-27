import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { hls } from "../../src/hls/index.js";

// --- hls.js mock ---

const mockInstance = {
	attachMedia: vi.fn(),
	loadSource: vi.fn(),
	destroy: vi.fn(),
	on: vi.fn(),
};

const MockHls = vi.fn(() => mockInstance) as ReturnType<typeof vi.fn> & {
	isSupported: ReturnType<typeof vi.fn>;
	Events: { ERROR: string; MANIFEST_PARSED: string };
};
MockHls.isSupported = vi.fn(() => true);
MockHls.Events = {
	ERROR: "hlsError",
	MANIFEST_PARSED: "hlsManifestParsed",
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

		expect(errorHandler).toHaveBeenCalledWith({
			code: 1,
			message: expect.stringContaining("HLS fatal error"),
		});
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
			code: 0,
			message: "HLS is not supported in this browser",
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
