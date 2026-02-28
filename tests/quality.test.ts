import { describe, expect, it } from "vitest";
import { qualityLabel } from "../src/quality.js";

describe("qualityLabel", () => {
	it("returns '240p' for 240", () => {
		expect(qualityLabel(240)).toBe("240p");
	});

	it("returns '360p' for 360", () => {
		expect(qualityLabel(360)).toBe("360p");
	});

	it("returns '480p' for 480", () => {
		expect(qualityLabel(480)).toBe("480p");
	});

	it("returns '720p' for 720", () => {
		expect(qualityLabel(720)).toBe("720p");
	});

	it("returns '1080p' for 1080", () => {
		expect(qualityLabel(1080)).toBe("1080p");
	});

	it("returns '1440p' for 1440", () => {
		expect(qualityLabel(1440)).toBe("1440p");
	});

	it("returns '4K' for 2160", () => {
		expect(qualityLabel(2160)).toBe("4K");
	});

	it("returns '4K' for values above 2160", () => {
		expect(qualityLabel(4320)).toBe("4K");
	});

	it("returns height + 'p' for non-standard values below 240", () => {
		expect(qualityLabel(144)).toBe("144p");
	});
});
