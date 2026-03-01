import { describe, expect, it } from "vitest";
import { createPlayer } from "../../src/core.js";
import { uiAdPlugin } from "../../src/ui/ad-plugin.js";
import { createAdUIState } from "../../src/ui/utils.js";
import type { VastAd } from "../../src/vast/types.js";

function makeVideo(): HTMLVideoElement {
	return document.createElement("video");
}

function makeAd(
	overrides: Partial<{
		skipOffset: number;
		clickThrough: string;
		duration: number;
	}> = {},
): VastAd {
	return {
		id: "test-ad",
		adSystem: "test",
		adTitle: "Test Ad",
		impressions: [],
		errors: [],
		creatives: [
			{
				linear: {
					duration: overrides.duration ?? 30,
					skipOffset: overrides.skipOffset,
					mediaFiles: [
						{
							url: "ad.mp4",
							mimeType: "video/mp4",
							width: 640,
							height: 360,
							delivery: "progressive" as const,
						},
					],
					interactiveCreativeFiles: [],
					trackingEvents: {
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
					},
					clickThrough: overrides.clickThrough,
					clickTracking: [],
				},
			},
		],
	};
}

describe("uiAdPlugin", () => {
	it("sets AdUIState from VastAd", () => {
		const ref = createAdUIState();
		const plugin = uiAdPlugin(ref);
		const el = makeVideo();
		const player = createPlayer(el);

		const ad = makeAd({
			skipOffset: 5,
			clickThrough: "https://example.com",
			duration: 30,
		});
		plugin.setup(player, ad);

		expect(ref.current).toEqual({
			adId: "test-ad",
			skipOffset: 5,
			clickThrough: "https://example.com",
			duration: 30,
			adTitle: "Test Ad",
		});
	});

	it("cleanup clears AdUIState", () => {
		const ref = createAdUIState();
		const plugin = uiAdPlugin(ref);
		const el = makeVideo();
		const player = createPlayer(el);

		const ad = makeAd({ skipOffset: 5 });
		const cleanup = plugin.setup(player, ad);
		expect(ref.current).not.toBeNull();

		cleanup?.();
		expect(ref.current).toBeNull();
	});

	it("returns undefined for ad without linear creative", () => {
		const ref = createAdUIState();
		const plugin = uiAdPlugin(ref);
		const el = makeVideo();
		const player = createPlayer(el);

		const ad: VastAd = {
			id: "no-linear",
			adSystem: "test",
			adTitle: "No Linear",
			impressions: [],
			errors: [],
			creatives: [{ linear: null }],
		};
		const result = plugin.setup(player, ad);
		expect(result).toBeUndefined();
		expect(ref.current).toBeNull();
	});

	it("handles undefined skipOffset", () => {
		const ref = createAdUIState();
		const plugin = uiAdPlugin(ref);
		const el = makeVideo();
		const player = createPlayer(el);

		const ad = makeAd({ duration: 15 });
		plugin.setup(player, ad);

		expect(ref.current?.skipOffset).toBeUndefined();
		expect(ref.current?.duration).toBe(15);
	});
});
