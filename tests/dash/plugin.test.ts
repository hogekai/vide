import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { dash } from "../../src/dash/index.js";

// --- dashjs mock ---

const mockInstance = {
	initialize: vi.fn(),
	updateSettings: vi.fn(),
	on: vi.fn(),
	destroy: vi.fn(),
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
			code: 0,
			message: "DASH error: capability",
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
