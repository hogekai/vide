import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { dash } from "../../src/dash/index.js";
import { ERR_DASH_PLAYBACK } from "../../src/errors.js";

// --- dashjs mock ---

const mockInstance = {
	initialize: vi.fn(),
	updateSettings: vi.fn(),
	on: vi.fn(),
	destroy: vi.fn(),
	getBitrateInfoListFor: vi.fn().mockReturnValue([]),
	setQualityFor: vi.fn(),
	getSettings: vi.fn().mockReturnValue({}),
};

const MockMediaPlayer = Object.assign(
	vi.fn(() => ({ create: vi.fn(() => mockInstance) })),
	{
		events: {
			ERROR: "error",
			QUALITY_CHANGE_RENDERED: "qualityChangeRendered",
			STREAM_INITIALIZED: "streamInitialized",
		},
	},
);

vi.mock("dashjs", () => ({
	default: { MediaPlayer: MockMediaPlayer },
}));

// --- helpers ---

function makeVideo(): HTMLVideoElement {
	const el = document.createElement("video");
	el.play = vi.fn().mockResolvedValue(undefined);
	el.pause = vi.fn();
	el.load = vi.fn();
	el.canPlayType = vi.fn().mockReturnValue("");
	return el;
}

/** Wait for the dynamic import("dashjs") promise to settle. */
async function flushImport(): Promise<void> {
	await new Promise((r) => setTimeout(r, 0));
}

type ErrorCallback = (e: {
	error: string | { code: number; message: string };
}) => void;

/** Extract the dashjs ERROR event callback from mock calls. */
function getErrorCallback(): ErrorCallback {
	const call = mockInstance.on.mock.calls.find(
		(c: unknown[]) => c[0] === "error",
	);
	return call[1] as ErrorCallback;
}

beforeEach(() => {
	mockInstance.initialize.mockClear();
	mockInstance.updateSettings.mockClear();
	mockInstance.on.mockClear();
	mockInstance.destroy.mockClear();
	mockInstance.getBitrateInfoListFor.mockReset().mockReturnValue([]);
	mockInstance.setQualityFor.mockClear();
	mockInstance.getSettings.mockReset().mockReturnValue({});
	MockMediaPlayer.mockClear();
});

describe("dash plugin — canHandle", () => {
	it("handles .mpd URLs", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(dash());
		player.src = "https://cdn.example.com/live/stream.mpd";
		expect(player.src).toBe("https://cdn.example.com/live/stream.mpd");
		expect(player.state).toBe("loading");
	});

	it("handles application/dash+xml type via <source>", () => {
		const el = makeVideo();
		const source = document.createElement("source");
		source.setAttribute("src", "https://example.com/stream");
		source.setAttribute("type", "application/dash+xml");
		el.appendChild(source);
		const player = createPlayer(el);
		player.use(dash());
		expect(player.src).toBe("https://example.com/stream");
	});

	it("does not handle .mp4 URLs", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(dash());
		player.src = "https://example.com/video.mp4";
		expect(el.src).toContain("video.mp4");
	});

	it("does not handle .m3u8 URLs", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(dash());
		player.src = "https://example.com/stream.m3u8";
		expect(el.src).toContain("stream.m3u8");
	});
});

describe("dash plugin — dashjs integration", () => {
	it("calls initialize with video element and URL", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(dash());
		player.src = "https://example.com/stream.mpd";
		await flushImport();
		expect(mockInstance.initialize).toHaveBeenCalledWith(
			el,
			"https://example.com/stream.mpd",
			false,
		);
	});

	it("passes dashConfig to updateSettings", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const config = {
			streaming: { buffer: { bufferTimeDefault: 20 } },
		};
		player.use(dash({ dashConfig: config }));
		player.src = "https://example.com/stream.mpd";
		await flushImport();
		expect(mockInstance.updateSettings).toHaveBeenCalledWith(config);
	});

	it("does not call updateSettings when dashConfig is not provided", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(dash());
		player.src = "https://example.com/stream.mpd";
		await flushImport();
		expect(mockInstance.updateSettings).not.toHaveBeenCalled();
	});

	it("emits player error on dashjs object error", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const errorHandler = vi.fn();
		player.on("error", errorHandler);
		player.use(dash());
		player.src = "https://example.com/stream.mpd";
		await flushImport();

		const errorCallback = getErrorCallback();
		expect(errorCallback).toBeDefined();

		errorCallback({
			error: { code: 25, message: "download error" },
		});

		expect(errorHandler).toHaveBeenCalledWith({
			code: 25,
			message: "download error",
			source: "dash",
		});
	});

	it("emits player error on dashjs string error", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const errorHandler = vi.fn();
		player.on("error", errorHandler);
		player.use(dash());
		player.src = "https://example.com/stream.mpd";
		await flushImport();

		const errorCallback = getErrorCallback();

		errorCallback({ error: "capability" });

		expect(errorHandler).toHaveBeenCalledWith({
			code: ERR_DASH_PLAYBACK,
			message: "DASH error: capability",
			source: "dash",
		});
	});
});

describe("dash plugin — DRM integration", () => {
	it("applies DRM config via updateSettings before user config", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.setPluginData("drm", {
			keySystem: "com.widevine.alpha",
			hlsConfig: {},
			dashConfig: {
				streaming: {
					protection: {
						data: {
							"com.widevine.alpha": {
								serverURL: "https://lic.example.com",
							},
						},
					},
				},
			},
		});
		player.use(dash());
		player.src = "https://example.com/stream.mpd";
		await flushImport();
		expect(mockInstance.updateSettings).toHaveBeenCalledWith(
			expect.objectContaining({
				streaming: expect.objectContaining({
					protection: expect.any(Object),
				}),
			}),
		);
	});

	it("applies both DRM and user config (two updateSettings calls)", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.setPluginData("drm", {
			keySystem: "com.widevine.alpha",
			hlsConfig: {},
			dashConfig: {
				streaming: {
					protection: {
						data: {
							"com.widevine.alpha": {
								serverURL: "https://lic.example.com",
							},
						},
					},
				},
			},
		});
		const userConfig = {
			streaming: { buffer: { bufferTimeDefault: 20 } },
		};
		player.use(dash({ dashConfig: userConfig }));
		player.src = "https://example.com/stream.mpd";
		await flushImport();
		expect(mockInstance.updateSettings).toHaveBeenCalledTimes(2);
	});

	it("works without DRM plugin (no pluginData)", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(
			dash({
				dashConfig: {
					streaming: { buffer: { bufferTimeDefault: 20 } },
				},
			}),
		);
		player.src = "https://example.com/stream.mpd";
		await flushImport();
		expect(mockInstance.updateSettings).toHaveBeenCalledTimes(1);
	});

	it("does not call updateSettings when neither DRM nor user config", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(dash());
		player.src = "https://example.com/stream.mpd";
		await flushImport();
		expect(mockInstance.updateSettings).not.toHaveBeenCalled();
	});
});

describe("dash plugin — pluginData", () => {
	it("exposes dashjs instance via setPluginData('dash')", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(dash());
		player.src = "https://example.com/stream.mpd";
		await flushImport();
		expect(player.getPluginData("dash")).toBeDefined();
	});
});

describe("dash plugin — autoplay", () => {
	it("passes autoplay=true when video element has autoplay attribute", async () => {
		const el = makeVideo();
		el.autoplay = true;
		const player = createPlayer(el);
		player.use(dash());
		player.src = "https://example.com/stream.mpd";
		await flushImport();
		expect(mockInstance.initialize).toHaveBeenCalledWith(
			el,
			"https://example.com/stream.mpd",
			true,
		);
	});

	it("passes autoplay=false when video element does not have autoplay", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(dash());
		player.src = "https://example.com/stream.mpd";
		await flushImport();
		expect(mockInstance.initialize).toHaveBeenCalledWith(
			el,
			"https://example.com/stream.mpd",
			false,
		);
	});
});

describe("dash plugin — <source> tag handling", () => {
	it("source elements are removed after DASH handler claims via <source>", () => {
		const el = makeVideo();
		const source = document.createElement("source");
		source.setAttribute("src", "https://example.com/stream.mpd");
		source.setAttribute("type", "application/dash+xml");
		el.appendChild(source);

		const player = createPlayer(el);
		player.use(dash());

		expect(el.querySelectorAll("source").length).toBe(0);
		expect(player.state).toBe("loading");
	});
});

describe("dash plugin — lifecycle", () => {
	it("destroys dashjs instance when source changes", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(dash());
		player.src = "https://example.com/a.mpd";
		await flushImport();
		expect(mockInstance.initialize).toHaveBeenCalled();

		player.src = "https://example.com/b.mpd";
		expect(mockInstance.destroy).toHaveBeenCalled();
	});

	it("destroys dashjs instance on player.destroy()", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(dash());
		player.src = "https://example.com/stream.mpd";
		await flushImport();

		player.destroy();
		expect(mockInstance.destroy).toHaveBeenCalled();
	});

	it("does not call dashjs after plugin is destroyed", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(dash());
		player.destroy();
		await flushImport();
		expect(mockInstance.initialize).not.toHaveBeenCalled();
	});
});

describe("dash plugin — quality levels", () => {
	/** Extract the STREAM_INITIALIZED callback from mock calls. */
	function getStreamInitCallback(): () => void {
		const call = mockInstance.on.mock.calls.find(
			(c: unknown[]) => c[0] === "streamInitialized",
		);
		return call[1] as () => void;
	}

	/** Extract the QUALITY_CHANGE_RENDERED callback from mock calls. */
	function getQualityChangeCallback(): (e: {
		mediaType: string;
		oldQuality: number;
		newQuality: number;
	}) => void {
		const call = mockInstance.on.mock.calls.find(
			(c: unknown[]) => c[0] === "qualityChangeRendered",
		);
		return call[1] as (e: {
			mediaType: string;
			oldQuality: number;
			newQuality: number;
		}) => void;
	}

	it("sets qualities on STREAM_INITIALIZED", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(dash());
		player.src = "https://example.com/stream.mpd";
		await flushImport();

		mockInstance.getBitrateInfoListFor.mockReturnValue([
			{ qualityIndex: 0, width: 1280, height: 720, bitrate: 2_000_000 },
			{ qualityIndex: 1, width: 1920, height: 1080, bitrate: 5_000_000 },
		]);
		getStreamInitCallback()();

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

	it("emits qualitiesavailable on STREAM_INITIALIZED", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const handler = vi.fn();
		player.on("qualitiesavailable", handler);
		player.use(dash());
		player.src = "https://example.com/stream.mpd";
		await flushImport();

		mockInstance.getBitrateInfoListFor.mockReturnValue([
			{ qualityIndex: 0, width: 1280, height: 720, bitrate: 2_000_000 },
		]);
		getStreamInitCallback()();

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

	it("sets currentQuality on QUALITY_CHANGE_RENDERED", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(dash());
		player.src = "https://example.com/stream.mpd";
		await flushImport();

		mockInstance.getBitrateInfoListFor.mockReturnValue([
			{ qualityIndex: 0, width: 1280, height: 720, bitrate: 2_000_000 },
			{ qualityIndex: 1, width: 1920, height: 1080, bitrate: 5_000_000 },
		]);
		getStreamInitCallback()();

		mockInstance.getSettings.mockReturnValue({
			streaming: { abr: { autoSwitchBitrate: { video: true } } },
		});
		getQualityChangeCallback()({
			mediaType: "video",
			oldQuality: 0,
			newQuality: 1,
		});

		expect(player.currentQuality).toEqual({
			id: 1,
			width: 1920,
			height: 1080,
			bitrate: 5_000_000,
			label: "1080p",
		});
	});

	it("ignores QUALITY_CHANGE_RENDERED for audio", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(dash());
		player.src = "https://example.com/stream.mpd";
		await flushImport();

		mockInstance.getBitrateInfoListFor.mockReturnValue([
			{ qualityIndex: 0, width: 1280, height: 720, bitrate: 2_000_000 },
		]);
		getStreamInitCallback()();

		getQualityChangeCallback()({
			mediaType: "audio",
			oldQuality: 0,
			newQuality: 1,
		});

		expect(player.currentQuality).toBeNull();
	});

	it("setQuality locks to specific level", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(dash());
		player.src = "https://example.com/stream.mpd";
		await flushImport();

		mockInstance.getBitrateInfoListFor.mockReturnValue([
			{ qualityIndex: 0, width: 1280, height: 720, bitrate: 2_000_000 },
			{ qualityIndex: 1, width: 1920, height: 1080, bitrate: 5_000_000 },
		]);
		getStreamInitCallback()();

		player.setQuality(1);
		expect(mockInstance.setQualityFor).toHaveBeenCalledWith("video", 1, true);
		expect(mockInstance.updateSettings).toHaveBeenCalledWith({
			streaming: { abr: { autoSwitchBitrate: { video: false } } },
		});
		expect(player.isAutoQuality).toBe(false);
	});

	it("setQuality(-1) restores ABR", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		player.use(dash());
		player.src = "https://example.com/stream.mpd";
		await flushImport();

		mockInstance.getBitrateInfoListFor.mockReturnValue([
			{ qualityIndex: 0, width: 1280, height: 720, bitrate: 2_000_000 },
		]);
		getStreamInitCallback()();

		player.setQuality(0);
		expect(player.isAutoQuality).toBe(false);

		mockInstance.updateSettings.mockClear();
		player.setQuality(-1);
		expect(mockInstance.updateSettings).toHaveBeenCalledWith({
			streaming: { abr: { autoSwitchBitrate: { video: true } } },
		});
		expect(player.isAutoQuality).toBe(true);
	});
});
