import { describe, expect, it } from "vitest";
import { selectMediaFile } from "../../src/vast/media.js";
import type { VastMediaFile } from "../../src/vast/types.js";

function makeFile(
	overrides: Partial<VastMediaFile> & { url: string },
): VastMediaFile {
	return {
		mimeType: "video/mp4",
		width: 0,
		height: 0,
		delivery: "progressive",
		...overrides,
	};
}

describe("selectMediaFile", () => {
	it("returns null for empty array", () => {
		expect(selectMediaFile([])).toBeNull();
	});

	it("prefers mp4 over other types", () => {
		const result = selectMediaFile([
			makeFile({
				url: "http://example.com/ad.webm",
				mimeType: "video/webm",
				bitrate: 3000,
			}),
			makeFile({
				url: "http://example.com/ad.mp4",
				mimeType: "video/mp4",
				bitrate: 1000,
			}),
		]);
		expect(result?.url).toBe("http://example.com/ad.mp4");
	});

	it("picks highest bitrate among mp4 candidates", () => {
		const result = selectMediaFile([
			makeFile({
				url: "http://example.com/low.mp4",
				mimeType: "video/mp4",
				bitrate: 500,
			}),
			makeFile({
				url: "http://example.com/high.mp4",
				mimeType: "video/mp4",
				bitrate: 2000,
			}),
			makeFile({
				url: "http://example.com/mid.mp4",
				mimeType: "video/mp4",
				bitrate: 1000,
			}),
		]);
		expect(result?.url).toBe("http://example.com/high.mp4");
	});

	it("falls back to non-mp4 if no mp4 available", () => {
		const result = selectMediaFile([
			makeFile({
				url: "http://example.com/ad.webm",
				mimeType: "video/webm",
				bitrate: 1000,
			}),
		]);
		expect(result?.url).toBe("http://example.com/ad.webm");
	});

	it("treats undefined bitrate as 0", () => {
		const result = selectMediaFile([
			makeFile({ url: "http://example.com/a.mp4", mimeType: "video/mp4" }),
			makeFile({
				url: "http://example.com/b.mp4",
				mimeType: "video/mp4",
				bitrate: 500,
			}),
		]);
		expect(result?.url).toBe("http://example.com/b.mp4");
	});

	describe("resolution hints", () => {
		it("prefers resolution close to player size over much larger", () => {
			const result = selectMediaFile(
				[
					makeFile({
						url: "http://example.com/1080.mp4",
						width: 1920,
						height: 1080,
						bitrate: 3000,
					}),
					makeFile({
						url: "http://example.com/360.mp4",
						width: 640,
						height: 360,
						bitrate: 800,
					}),
				],
				{ width: 400, height: 300 },
			);
			expect(result?.url).toBe("http://example.com/360.mp4");
		});

		it("prefers slightly larger over too small", () => {
			const result = selectMediaFile(
				[
					makeFile({
						url: "http://example.com/720.mp4",
						width: 1280,
						height: 720,
						bitrate: 1500,
					}),
					makeFile({
						url: "http://example.com/360.mp4",
						width: 640,
						height: 360,
						bitrate: 800,
					}),
				],
				{ width: 854, height: 480 },
			);
			expect(result?.url).toBe("http://example.com/720.mp4");
		});

		it("gives neutral score when file has no dimensions", () => {
			const result = selectMediaFile(
				[
					makeFile({
						url: "http://example.com/a.mp4",
						width: 0,
						height: 0,
						bitrate: 1000,
					}),
					makeFile({
						url: "http://example.com/b.mp4",
						width: 0,
						height: 0,
						bitrate: 2000,
					}),
				],
				{ width: 640, height: 480 },
			);
			// Without resolution info, falls back to bitrate ranking
			expect(result?.url).toBe("http://example.com/b.mp4");
		});
	});

	describe("maxBitrate hint", () => {
		it("prefers files within bitrate budget", () => {
			const result = selectMediaFile(
				[
					makeFile({ url: "http://example.com/high.mp4", bitrate: 3000 }),
					makeFile({ url: "http://example.com/low.mp4", bitrate: 800 }),
				],
				{ maxBitrate: 1000 },
			);
			expect(result?.url).toBe("http://example.com/low.mp4");
		});

		it("picks highest bitrate within budget", () => {
			const result = selectMediaFile(
				[
					makeFile({ url: "http://example.com/low.mp4", bitrate: 400 }),
					makeFile({ url: "http://example.com/mid.mp4", bitrate: 900 }),
					makeFile({ url: "http://example.com/high.mp4", bitrate: 3000 }),
				],
				{ maxBitrate: 1000 },
			);
			expect(result?.url).toBe("http://example.com/mid.mp4");
		});
	});

	describe("delivery hint", () => {
		it("prefers streaming when hinted", () => {
			const result = selectMediaFile(
				[
					makeFile({
						url: "http://example.com/prog.mp4",
						delivery: "progressive",
						bitrate: 1000,
					}),
					makeFile({
						url: "http://example.com/stream.mp4",
						delivery: "streaming",
						bitrate: 1000,
					}),
				],
				{ delivery: "streaming" },
			);
			expect(result?.url).toBe("http://example.com/stream.mp4");
		});

		it("defaults to progressive preference without hint", () => {
			const result = selectMediaFile([
				makeFile({
					url: "http://example.com/stream.mp4",
					delivery: "streaming",
					bitrate: 1000,
				}),
				makeFile({
					url: "http://example.com/prog.mp4",
					delivery: "progressive",
					bitrate: 1000,
				}),
			]);
			expect(result?.url).toBe("http://example.com/prog.mp4");
		});
	});

	it("filters out VPAID files", () => {
		const result = selectMediaFile([
			makeFile({
				url: "http://example.com/vpaid.js",
				mimeType: "application/javascript",
				apiFramework: "VPAID",
			}),
			makeFile({ url: "http://example.com/ad.mp4", bitrate: 1000 }),
		]);
		expect(result?.url).toBe("http://example.com/ad.mp4");
	});

	it("returns null when all files are VPAID", () => {
		const result = selectMediaFile([
			makeFile({
				url: "http://example.com/vpaid.js",
				mimeType: "application/javascript",
				apiFramework: "VPAID",
			}),
		]);
		expect(result).toBeNull();
	});
});
