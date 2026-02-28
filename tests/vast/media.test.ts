import { describe, expect, it } from "vitest";
import { selectMediaFile } from "../../src/vast/media.js";

describe("selectMediaFile", () => {
	it("returns null for empty array", () => {
		expect(selectMediaFile([])).toBeNull();
	});

	it("prefers mp4 over other types", () => {
		const result = selectMediaFile([
			{
				url: "http://example.com/ad.webm",
				mimeType: "video/webm",
				bitrate: 3000,
			},
			{
				url: "http://example.com/ad.mp4",
				mimeType: "video/mp4",
				bitrate: 1000,
			},
		]);
		expect(result?.url).toBe("http://example.com/ad.mp4");
	});

	it("picks highest bitrate among mp4 candidates", () => {
		const result = selectMediaFile([
			{
				url: "http://example.com/low.mp4",
				mimeType: "video/mp4",
				bitrate: 500,
			},
			{
				url: "http://example.com/high.mp4",
				mimeType: "video/mp4",
				bitrate: 2000,
			},
			{
				url: "http://example.com/mid.mp4",
				mimeType: "video/mp4",
				bitrate: 1000,
			},
		]);
		expect(result?.url).toBe("http://example.com/high.mp4");
	});

	it("falls back to non-mp4 if no mp4 available", () => {
		const result = selectMediaFile([
			{
				url: "http://example.com/ad.webm",
				mimeType: "video/webm",
				bitrate: 1000,
			},
		]);
		expect(result?.url).toBe("http://example.com/ad.webm");
	});

	it("treats undefined bitrate as 0", () => {
		const result = selectMediaFile([
			{ url: "http://example.com/a.mp4", mimeType: "video/mp4" },
			{ url: "http://example.com/b.mp4", mimeType: "video/mp4", bitrate: 500 },
		]);
		expect(result?.url).toBe("http://example.com/b.mp4");
	});
});
