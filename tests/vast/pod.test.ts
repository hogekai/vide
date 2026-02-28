import { describe, expect, it } from "vitest";
import { classifyAds } from "../../src/vast/pod.js";
import type { VastAd } from "../../src/vast/types.js";

function makeAd(id: string, sequence?: number): VastAd {
	return {
		id,
		sequence,
		adSystem: "test",
		adTitle: `Ad ${id}`,
		impressions: [],
		creatives: [
			{
				id: `creative-${id}`,
				sequence: undefined,
				linear: {
					duration: 30,
					mediaFiles: [
						{
							url: `http://example.com/${id}.mp4`,
							mimeType: "video/mp4",
							width: 640,
							height: 360,
							delivery: "progressive" as const,
						},
					],
					interactiveCreativeFiles: [],
					trackingEvents: emptyTracking(),
					clickTracking: [],
				},
			},
		],
		errors: [],
	};
}

function makeAdNoLinear(id: string): VastAd {
	return {
		id,
		sequence: undefined,
		adSystem: "test",
		adTitle: `Ad ${id}`,
		impressions: [],
		creatives: [{ id: `creative-${id}`, sequence: undefined, linear: null }],
		errors: [],
	};
}

function emptyTracking() {
	return {
		start: [],
		firstQuartile: [],
		midpoint: [],
		thirdQuartile: [],
		complete: [],
		pause: [],
		resume: [],
		skip: [],
		loaded: [],
		mute: [],
		unmute: [],
		rewind: [],
		playerExpand: [],
		playerCollapse: [],
		closeLinear: [],
		notUsed: [],
		otherAdInteraction: [],
		creativeView: [],
		progress: [],
	};
}

describe("classifyAds", () => {
	it("returns single for empty array", () => {
		const result = classifyAds([]);
		expect(result.type).toBe("single");
		expect(result.ads).toHaveLength(0);
		expect(result.standalonePool).toHaveLength(0);
	});

	it("returns single for one ad without sequence", () => {
		const result = classifyAds([makeAd("a1")]);
		expect(result.type).toBe("single");
		expect(result.ads).toHaveLength(1);
		expect(result.ads[0].ad.id).toBe("a1");
		expect(result.standalonePool).toHaveLength(0);
	});

	it("returns single for one ad with sequence", () => {
		const result = classifyAds([makeAd("a1", 1)]);
		expect(result.type).toBe("single");
		expect(result.ads).toHaveLength(1);
		expect(result.standalonePool).toHaveLength(0);
	});

	it("returns pod when all ads have sequence, sorted", () => {
		const result = classifyAds([
			makeAd("a3", 3),
			makeAd("a1", 1),
			makeAd("a2", 2),
		]);
		expect(result.type).toBe("pod");
		expect(result.ads).toHaveLength(3);
		expect(result.ads[0].ad.id).toBe("a1");
		expect(result.ads[1].ad.id).toBe("a2");
		expect(result.ads[2].ad.id).toBe("a3");
		expect(result.standalonePool).toHaveLength(0);
	});

	it("returns waterfall when no ads have sequence", () => {
		const result = classifyAds([makeAd("a1"), makeAd("a2"), makeAd("a3")]);
		expect(result.type).toBe("waterfall");
		expect(result.ads).toHaveLength(3);
		// Preserves original order
		expect(result.ads[0].ad.id).toBe("a1");
		expect(result.ads[1].ad.id).toBe("a2");
		expect(result.ads[2].ad.id).toBe("a3");
		expect(result.standalonePool).toHaveLength(0);
	});

	it("returns pod from sequenced ads in mixed set", () => {
		const result = classifyAds([
			makeAd("a1", 2),
			makeAd("a2"), // no sequence — excluded from pod, goes to standalonePool
			makeAd("a3", 1),
		]);
		expect(result.type).toBe("pod");
		expect(result.ads).toHaveLength(2);
		expect(result.ads[0].ad.id).toBe("a3"); // sequence 1
		expect(result.ads[1].ad.id).toBe("a1"); // sequence 2
		expect(result.standalonePool).toHaveLength(1);
		expect(result.standalonePool[0].ad.id).toBe("a2");
	});

	it("filters out ads without playable linear creatives", () => {
		const result = classifyAds([makeAdNoLinear("a1"), makeAd("a2")]);
		expect(result.type).toBe("single");
		expect(result.ads).toHaveLength(1);
		expect(result.ads[0].ad.id).toBe("a2");
	});

	it("returns single with empty ads when none are playable", () => {
		const result = classifyAds([makeAdNoLinear("a1"), makeAdNoLinear("a2")]);
		expect(result.type).toBe("single");
		expect(result.ads).toHaveLength(0);
	});
});
