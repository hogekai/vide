import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../src/core.js";

function makeVideo(): HTMLVideoElement {
	return document.createElement("video");
}

interface MockTextTrack {
	label: string;
	language: string;
	kind: string;
	mode: string;
	activeCues?: { length: number; [index: number]: unknown } | null;
	addEventListener: ReturnType<typeof vi.fn>;
	removeEventListener: ReturnType<typeof vi.fn>;
}

interface MockTextTrackList {
	length: number;
	[index: number]: MockTextTrack;
	addEventListener: ReturnType<typeof vi.fn>;
	removeEventListener: ReturnType<typeof vi.fn>;
}

function mockTextTracks(
	el: HTMLVideoElement,
	tracks: MockTextTrack[],
): MockTextTrackList {
	const ttl: MockTextTrackList = {
		length: tracks.length,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
	};
	for (let i = 0; i < tracks.length; i++) {
		ttl[i] = tracks[i];
	}
	Object.defineProperty(el, "textTracks", {
		value: ttl,
		configurable: true,
	});
	return ttl;
}

function makeTrack(
	overrides: Partial<MockTextTrack> = {},
): MockTextTrack {
	return {
		label: "English",
		language: "en",
		kind: "subtitles",
		mode: "disabled",
		activeCues: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		...overrides,
	};
}

describe("text track API", () => {
	it("textTracks returns native TextTrackList (same reference as el.textTracks)", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		expect(player.textTracks).toBe(el.textTracks);
	});

	it("getTextTracks() returns VideTextTrack[] for existing tracks", () => {
		const el = makeVideo();
		mockTextTracks(el, [
			makeTrack({ label: "English", language: "en", mode: "disabled" }),
			makeTrack({
				label: "French",
				language: "fr",
				mode: "showing",
			}),
		]);
		const player = createPlayer(el);
		expect(player.getTextTracks()).toEqual([
			{
				id: 0,
				label: "English",
				language: "en",
				kind: "subtitles",
				active: false,
			},
			{
				id: 1,
				label: "French",
				language: "fr",
				kind: "subtitles",
				active: true,
			},
		]);
	});

	it("getTextTracks() returns empty array when no tracks exist", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		expect(player.getTextTracks()).toEqual([]);
	});

	it("getActiveTextTrack() returns the showing track", () => {
		const el = makeVideo();
		mockTextTracks(el, [
			makeTrack({ label: "English", language: "en", mode: "disabled" }),
			makeTrack({
				label: "French",
				language: "fr",
				mode: "showing",
			}),
		]);
		const player = createPlayer(el);
		expect(player.getActiveTextTrack()).toEqual({
			id: 1,
			label: "French",
			language: "fr",
			kind: "subtitles",
			active: true,
		});
	});

	it("getActiveTextTrack() returns null when no track is showing", () => {
		const el = makeVideo();
		mockTextTracks(el, [
			makeTrack({ mode: "disabled" }),
		]);
		const player = createPlayer(el);
		expect(player.getActiveTextTrack()).toBeNull();
	});

	it("getActiveTextTrack() returns null when no tracks exist", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		expect(player.getActiveTextTrack()).toBeNull();
	});

	it("setTextTrack(0) activates the correct track and emits texttrackchange", () => {
		const el = makeVideo();
		const track0 = makeTrack({
			label: "English",
			language: "en",
			mode: "disabled",
		});
		const track1 = makeTrack({
			label: "French",
			language: "fr",
			mode: "disabled",
		});
		mockTextTracks(el, [track0, track1]);
		const player = createPlayer(el);
		const handler = vi.fn();
		player.on("texttrackchange", handler);

		player.setTextTrack(0);

		expect(track0.mode).toBe("showing");
		expect(track1.mode).toBe("disabled");
		expect(handler).toHaveBeenCalledWith({
			track: {
				id: 0,
				label: "English",
				language: "en",
				kind: "subtitles",
				active: true,
			},
		});
	});

	it("setTextTrack(-1) deactivates all tracks", () => {
		const el = makeVideo();
		const track0 = makeTrack({ mode: "showing" });
		mockTextTracks(el, [track0]);
		const player = createPlayer(el);
		const handler = vi.fn();
		player.on("texttrackchange", handler);

		player.setTextTrack(-1);

		expect(track0.mode).toBe("disabled");
		expect(handler).toHaveBeenCalledWith({ track: null });
	});

	it("activeCues returns cues from the showing track", () => {
		const el = makeVideo();
		mockTextTracks(el, [
			makeTrack({
				mode: "showing",
				activeCues: {
					length: 2,
					0: { startTime: 0, endTime: 5, text: "Hello" },
					1: { startTime: 5, endTime: 10, text: "World" },
				},
			}),
		]);
		const player = createPlayer(el);
		expect(player.activeCues).toEqual([
			{ startTime: 0, endTime: 5, text: "Hello" },
			{ startTime: 5, endTime: 10, text: "World" },
		]);
	});

	it("activeCues returns empty array when no track is showing", () => {
		const el = makeVideo();
		mockTextTracks(el, [makeTrack({ mode: "disabled" })]);
		const player = createPlayer(el);
		expect(player.activeCues).toEqual([]);
	});

	it("activeCues returns empty array when no tracks exist", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		expect(player.activeCues).toEqual([]);
	});

	it("addTextTrack() appends a <track> element to the video", () => {
		const el = makeVideo();
		const player = createPlayer(el);

		player.addTextTrack({
			src: "subtitles.vtt",
			label: "English",
			language: "en",
			kind: "subtitles",
			default: true,
		});

		const trackEl = el.querySelector("track");
		expect(trackEl).not.toBeNull();
		expect(trackEl!.src).toContain("subtitles.vtt");
		expect(trackEl!.label).toBe("English");
		expect(trackEl!.srclang).toBe("en");
		expect(trackEl!.kind).toBe("subtitles");
		expect(trackEl!.default).toBe(true);
	});

	it("addTextTrack() defaults kind to 'subtitles'", () => {
		const el = makeVideo();
		const player = createPlayer(el);

		player.addTextTrack({
			src: "subs.vtt",
			label: "English",
			language: "en",
		});

		const trackEl = el.querySelector("track");
		expect(trackEl!.kind).toBe("subtitles");
	});

	it("emits texttracksavailable when addtrack fires on el.textTracks", () => {
		const el = makeVideo();
		let addtrackHandler: (() => void) | null = null;
		const ttl: MockTextTrackList = {
			length: 0,
			addEventListener: vi.fn((event: string, handler: () => void) => {
				if (event === "addtrack") addtrackHandler = handler;
			}),
			removeEventListener: vi.fn(),
		};
		Object.defineProperty(el, "textTracks", {
			value: ttl,
			configurable: true,
		});

		const player = createPlayer(el);
		const handler = vi.fn();
		player.on("texttracksavailable", handler);

		// Simulate a track being added
		const newTrack = makeTrack({
			label: "English",
			language: "en",
		});
		ttl.length = 1;
		ttl[0] = newTrack;
		addtrackHandler!();

		expect(handler).toHaveBeenCalledWith({
			tracks: [
				{
					id: 0,
					label: "English",
					language: "en",
					kind: "subtitles",
					active: false,
				},
			],
		});
	});

	it("emits cuechange when a track's cuechange event fires", () => {
		const el = makeVideo();
		let cuechangeHandler: (() => void) | null = null;
		const track0 = makeTrack({
			mode: "showing",
			activeCues: {
				length: 1,
				0: { startTime: 10, endTime: 15, text: "Hello" },
			},
			addEventListener: vi.fn((event: string, handler: () => void) => {
				if (event === "cuechange") cuechangeHandler = handler;
			}),
			removeEventListener: vi.fn(),
		});
		mockTextTracks(el, [track0]);

		const player = createPlayer(el);
		const handler = vi.fn();
		player.on("cuechange", handler);

		cuechangeHandler!();

		expect(handler).toHaveBeenCalledWith({
			cues: [{ startTime: 10, endTime: 15, text: "Hello" }],
		});
	});

	it("does not emit cuechange when track is not showing", () => {
		const el = makeVideo();
		let cuechangeHandler: (() => void) | null = null;
		const track0 = makeTrack({
			mode: "disabled",
			activeCues: {
				length: 1,
				0: { startTime: 0, endTime: 5, text: "Hidden" },
			},
			addEventListener: vi.fn((event: string, handler: () => void) => {
				if (event === "cuechange") cuechangeHandler = handler;
			}),
			removeEventListener: vi.fn(),
		});
		mockTextTracks(el, [track0]);

		const player = createPlayer(el);
		const handler = vi.fn();
		player.on("cuechange", handler);

		cuechangeHandler!();

		expect(handler).not.toHaveBeenCalled();
	});

	it("destroy cleans up text track listeners", () => {
		const el = makeVideo();
		const trackRemoveListener = vi.fn();
		const track0 = makeTrack({
			removeEventListener: trackRemoveListener,
		});
		const ttlRemoveListener = vi.fn();
		const ttl: MockTextTrackList = {
			length: 1,
			0: track0,
			addEventListener: vi.fn(),
			removeEventListener: ttlRemoveListener,
		};
		Object.defineProperty(el, "textTracks", {
			value: ttl,
			configurable: true,
		});

		const player = createPlayer(el);
		player.destroy();

		expect(ttlRemoveListener).toHaveBeenCalledWith(
			"addtrack",
			expect.any(Function),
		);
		expect(ttlRemoveListener).toHaveBeenCalledWith(
			"removetrack",
			expect.any(Function),
		);
		expect(trackRemoveListener).toHaveBeenCalledWith(
			"cuechange",
			expect.any(Function),
		);
	});
});
