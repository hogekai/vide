import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveVast } from "../../src/vast/parser.js";

interface CompanionDef {
	width: number;
	height: number;
	staticUrl: string;
	clickTracking?: string[];
	creativeViewTracking?: string[];
}

interface VerificationDef {
	vendor: string;
	jsResource: string;
	apiFramework?: string;
}

interface ExtensionDef {
	type: string;
	content: string;
}

interface ViewableImpressionDef {
	viewable?: string[];
	notViewable?: string[];
	viewUndetermined?: string[];
}

interface NonLinearDef {
	width: number;
	height: number;
	staticUrl: string;
	clickTracking?: string[];
}

function makeInlineVast(options?: {
	adId?: string;
	impressions?: string[];
	errors?: string[];
	tracking?: Record<string, string[]>;
	clickTracking?: string[];
	companions?: CompanionDef[];
	companionRequired?: string;
	nonLinears?: NonLinearDef[];
	nonLinearTracking?: Record<string, string[]>;
	verifications?: VerificationDef[];
	extensions?: ExtensionDef[];
	viewableImpression?: ViewableImpressionDef;
}): string {
	const adId = options?.adId ?? "ad-001";
	const impressions = (options?.impressions ?? ["http://example.com/imp"])
		.map((u) => `<Impression><![CDATA[${u}]]></Impression>`)
		.join("\n      ");
	const errors = (options?.errors ?? [])
		.map((u) => `<Error><![CDATA[${u}]]></Error>`)
		.join("\n      ");
	const tracking = options?.tracking ?? {};
	const trackingXml = Object.entries(tracking)
		.map(([event, urls]) =>
			urls
				.map((u) => `<Tracking event="${event}"><![CDATA[${u}]]></Tracking>`)
				.join("\n"),
		)
		.join("\n");
	const clickTracking = (options?.clickTracking ?? [])
		.map((u) => `<ClickTracking><![CDATA[${u}]]></ClickTracking>`)
		.join("\n");

	let companionAdsXml = "";
	if (options?.companions) {
		const reqAttr = options.companionRequired
			? ` required="${options.companionRequired}"`
			: "";
		const companionsXml = options.companions
			.map(
				(c) => `
            <Companion width="${c.width}" height="${c.height}">
              <StaticResource creativeType="image/png"><![CDATA[${c.staticUrl}]]></StaticResource>
              ${(c.clickTracking ?? []).map((u) => `<CompanionClickTracking><![CDATA[${u}]]></CompanionClickTracking>`).join("\n              ")}
              ${(c.creativeViewTracking ?? []).length > 0 ? `<TrackingEvents>${(c.creativeViewTracking ?? []).map((u) => `<Tracking event="creativeView"><![CDATA[${u}]]></Tracking>`).join("")}</TrackingEvents>` : ""}
            </Companion>`,
			)
			.join("\n");
		companionAdsXml = `
          <CompanionAds${reqAttr}>${companionsXml}
          </CompanionAds>`;
	}

	let nonLinearAdsXml = "";
	if (options?.nonLinears) {
		const nlTrackingXml = Object.entries(options.nonLinearTracking ?? {})
			.flatMap(([event, urls]) =>
				urls.map(
					(u) => `<Tracking event="${event}"><![CDATA[${u}]]></Tracking>`,
				),
			)
			.join("\n              ");
		const nlsXml = options.nonLinears
			.map(
				(nl) => `
            <NonLinear width="${nl.width}" height="${nl.height}">
              <StaticResource creativeType="image/png"><![CDATA[${nl.staticUrl}]]></StaticResource>
              ${(nl.clickTracking ?? []).map((u) => `<NonLinearClickTracking><![CDATA[${u}]]></NonLinearClickTracking>`).join("\n              ")}
            </NonLinear>`,
			)
			.join("\n");
		nonLinearAdsXml = `
          <NonLinearAds>
            <TrackingEvents>
              ${nlTrackingXml}
            </TrackingEvents>${nlsXml}
          </NonLinearAds>`;
	}

	let adVerificationsXml = "";
	if (options?.verifications) {
		adVerificationsXml = `<AdVerifications>${options.verifications
			.map(
				(v) =>
					`<Verification vendor="${v.vendor}"><JavaScriptResource apiFramework="${v.apiFramework ?? "omid"}"><![CDATA[${v.jsResource}]]></JavaScriptResource></Verification>`,
			)
			.join("")}</AdVerifications>`;
	}

	let extensionsXml = "";
	if (options?.extensions) {
		extensionsXml = `<Extensions>${options.extensions
			.map((e) => `<Extension type="${e.type}">${e.content}</Extension>`)
			.join("")}</Extensions>`;
	}

	let viewableImpressionXml = "";
	if (options?.viewableImpression) {
		const vi = options.viewableImpression;
		viewableImpressionXml = `<ViewableImpression>${(vi.viewable ?? [])
			.map((u) => `<Viewable><![CDATA[${u}]]></Viewable>`)
			.join("")}${(vi.notViewable ?? [])
			.map((u) => `<NotViewable><![CDATA[${u}]]></NotViewable>`)
			.join("")}${(vi.viewUndetermined ?? [])
			.map((u) => `<ViewUndetermined><![CDATA[${u}]]></ViewUndetermined>`)
			.join("")}</ViewableImpression>`;
	}

	return `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="${adId}">
    <InLine>
      <AdSystem>TestAdServer</AdSystem>
      <AdTitle>Test Ad</AdTitle>
      ${impressions}
      ${errors}
      ${adVerificationsXml}
      ${extensionsXml}
      ${viewableImpressionXml}
      <Creatives>
        <Creative id="c1">
          <Linear>
            <Duration>00:00:30</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="640" height="360">
                <![CDATA[http://cdn.example.com/ad.mp4]]>
              </MediaFile>
            </MediaFiles>
            <TrackingEvents>
              ${trackingXml}
            </TrackingEvents>
            <VideoClicks>
              ${clickTracking}
            </VideoClicks>
          </Linear>${companionAdsXml}${nonLinearAdsXml}
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
}

function makeWrapperVast(
	adTagUri: string,
	options?: {
		impressions?: string[];
		errors?: string[];
		tracking?: Record<string, string[]>;
		clickTracking?: string[];
		companions?: CompanionDef[];
		companionRequired?: string;
		nonLinearTracking?: Record<string, string[]>;
		nonLinearClickTracking?: string[];
		verifications?: VerificationDef[];
		extensions?: ExtensionDef[];
		viewableImpression?: ViewableImpressionDef;
	},
): string {
	const impressions = (options?.impressions ?? [])
		.map((u) => `<Impression><![CDATA[${u}]]></Impression>`)
		.join("\n      ");
	const errors = (options?.errors ?? [])
		.map((u) => `<Error><![CDATA[${u}]]></Error>`)
		.join("\n      ");
	const tracking = options?.tracking ?? {};
	const trackingXml = Object.entries(tracking)
		.map(([event, urls]) =>
			urls
				.map((u) => `<Tracking event="${event}"><![CDATA[${u}]]></Tracking>`)
				.join("\n"),
		)
		.join("\n");
	const clickTracking = (options?.clickTracking ?? [])
		.map((u) => `<ClickTracking><![CDATA[${u}]]></ClickTracking>`)
		.join("\n");

	let companionAdsXml = "";
	if (options?.companions) {
		const reqAttr = options.companionRequired
			? ` required="${options.companionRequired}"`
			: "";
		const companionsXml = options.companions
			.map(
				(c) => `
            <Companion width="${c.width}" height="${c.height}">
              <StaticResource creativeType="image/png"><![CDATA[${c.staticUrl}]]></StaticResource>
              ${(c.clickTracking ?? []).map((u) => `<CompanionClickTracking><![CDATA[${u}]]></CompanionClickTracking>`).join("\n              ")}
              ${(c.creativeViewTracking ?? []).length > 0 ? `<TrackingEvents>${(c.creativeViewTracking ?? []).map((u) => `<Tracking event="creativeView"><![CDATA[${u}]]></Tracking>`).join("")}</TrackingEvents>` : ""}
            </Companion>`,
			)
			.join("\n");
		companionAdsXml = `
        <Creative>
          <CompanionAds${reqAttr}>${companionsXml}
          </CompanionAds>
        </Creative>`;
	}

	let nonLinearAdsXml = "";
	if (options?.nonLinearTracking || options?.nonLinearClickTracking) {
		const nlTrackingXml = Object.entries(options?.nonLinearTracking ?? {})
			.flatMap(([event, urls]) =>
				urls.map(
					(u) => `<Tracking event="${event}"><![CDATA[${u}]]></Tracking>`,
				),
			)
			.join("\n              ");
		const nlClickTrackingXml = (options?.nonLinearClickTracking ?? [])
			.map(
				(u) =>
					`<NonLinearClickTracking><![CDATA[${u}]]></NonLinearClickTracking>`,
			)
			.join("\n              ");
		nonLinearAdsXml = `
          <NonLinearAds>
            <TrackingEvents>
              ${nlTrackingXml}
            </TrackingEvents>
            <NonLinear width="468" height="60">
              ${nlClickTrackingXml}
            </NonLinear>
          </NonLinearAds>`;
	}

	let adVerificationsXml = "";
	if (options?.verifications) {
		adVerificationsXml = `<AdVerifications>${options.verifications
			.map(
				(v) =>
					`<Verification vendor="${v.vendor}"><JavaScriptResource apiFramework="${v.apiFramework ?? "omid"}"><![CDATA[${v.jsResource}]]></JavaScriptResource></Verification>`,
			)
			.join("")}</AdVerifications>`;
	}

	let extensionsXml = "";
	if (options?.extensions) {
		extensionsXml = `<Extensions>${options.extensions
			.map((e) => `<Extension type="${e.type}">${e.content}</Extension>`)
			.join("")}</Extensions>`;
	}

	let viewableImpressionXml = "";
	if (options?.viewableImpression) {
		const vi = options.viewableImpression;
		viewableImpressionXml = `<ViewableImpression>${(vi.viewable ?? [])
			.map((u) => `<Viewable><![CDATA[${u}]]></Viewable>`)
			.join("")}${(vi.notViewable ?? [])
			.map((u) => `<NotViewable><![CDATA[${u}]]></NotViewable>`)
			.join("")}${(vi.viewUndetermined ?? [])
			.map((u) => `<ViewUndetermined><![CDATA[${u}]]></ViewUndetermined>`)
			.join("")}</ViewableImpression>`;
	}

	return `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="wrapper">
    <Wrapper>
      <AdSystem>WrapperServer</AdSystem>
      <VASTAdTagURI><![CDATA[${adTagUri}]]></VASTAdTagURI>
      ${impressions}
      ${errors}
      ${adVerificationsXml}
      ${extensionsXml}
      ${viewableImpressionXml}
      <Creatives>
        <Creative>
          <Linear>
            <TrackingEvents>
              ${trackingXml}
            </TrackingEvents>
            <VideoClicks>
              ${clickTracking}
            </VideoClicks>
          </Linear>${nonLinearAdsXml}
        </Creative>${companionAdsXml}
      </Creatives>
    </Wrapper>
  </Ad>
</VAST>`;
}

describe("resolveVast", () => {
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	function mockFetchResponse(body: string, ok = true, status = 200) {
		return Promise.resolve({
			ok,
			status,
			text: () => Promise.resolve(body),
		});
	}

	it("resolves a direct InLine ad without modification", async () => {
		const inlineXml = makeInlineVast({
			impressions: ["http://example.com/imp"],
			tracking: { start: ["http://example.com/start"] },
		});
		fetchMock.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/vast");
		expect(result.ads).toHaveLength(1);
		expect(result.ads[0].id).toBe("ad-001");
		expect(result.ads[0].impressions).toEqual(["http://example.com/imp"]);
	});

	it("resolves Wrapper 1 deep → InLine", async () => {
		const wrapperXml = makeWrapperVast("http://example.com/inline");
		const inlineXml = makeInlineVast();

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapperXml))
			.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/wrapper");
		expect(result.ads).toHaveLength(1);
		expect(result.ads[0].id).toBe("ad-001");
	});

	it("resolves Wrapper 3 deep → InLine with merged tracking", async () => {
		const wrapper1 = makeWrapperVast("http://example.com/w2", {
			tracking: { start: ["http://w1.com/start"] },
		});
		const wrapper2 = makeWrapperVast("http://example.com/w3", {
			tracking: { start: ["http://w2.com/start"] },
		});
		const wrapper3 = makeWrapperVast("http://example.com/inline", {
			tracking: { start: ["http://w3.com/start"] },
		});
		const inlineXml = makeInlineVast({
			tracking: { start: ["http://inline.com/start"] },
		});

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapper1))
			.mockReturnValueOnce(mockFetchResponse(wrapper2))
			.mockReturnValueOnce(mockFetchResponse(wrapper3))
			.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/w1");
		expect(result.ads).toHaveLength(1);

		const startEvents = result.ads[0].creatives[0].linear?.trackingEvents.start;
		expect(startEvents).toEqual([
			"http://w1.com/start",
			"http://w2.com/start",
			"http://w3.com/start",
			"http://inline.com/start",
		]);
	});

	it("returns error when depth limit exceeded", async () => {
		// Create 6 wrappers (default maxDepth is 5, loop runs 0..5 = 6 iterations)
		for (let i = 0; i < 7; i++) {
			const wrapper = makeWrapperVast(`http://example.com/w${i + 1}`);
			fetchMock.mockReturnValueOnce(mockFetchResponse(wrapper));
		}

		const result = await resolveVast("http://example.com/w0");
		expect(result.ads).toEqual([]);
		expect(result.errors).toContain("VAST wrapper depth limit exceeded");
	});

	it("returns error on timeout", async () => {
		fetchMock.mockImplementation(
			(_url: string, init?: { signal?: AbortSignal }) =>
				new Promise((resolve, reject) => {
					const timer = setTimeout(
						() => resolve({ ok: true, text: () => "" }),
						5000,
					);
					init?.signal?.addEventListener("abort", () => {
						clearTimeout(timer);
						reject(
							new DOMException("The operation was aborted.", "AbortError"),
						);
					});
				}),
		);

		const result = await resolveVast("http://example.com/vast", {
			timeout: 1,
		});
		expect(result.ads).toEqual([]);
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it("merges wrapper tracking events into InLine tracking", async () => {
		const wrapperXml = makeWrapperVast("http://example.com/inline", {
			tracking: {
				start: ["http://wrapper.com/start"],
				firstQuartile: ["http://wrapper.com/fq"],
			},
		});
		const inlineXml = makeInlineVast({
			tracking: {
				start: ["http://inline.com/start"],
				midpoint: ["http://inline.com/mid"],
			},
		});

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapperXml))
			.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/wrapper");
		const events = result.ads[0].creatives[0].linear?.trackingEvents;

		expect(events.start).toEqual([
			"http://wrapper.com/start",
			"http://inline.com/start",
		]);
		expect(events.firstQuartile).toEqual(["http://wrapper.com/fq"]);
		expect(events.midpoint).toEqual(["http://inline.com/mid"]);
	});

	it("merges wrapper impressions (prepended)", async () => {
		const wrapperXml = makeWrapperVast("http://example.com/inline", {
			impressions: ["http://wrapper.com/imp"],
		});
		const inlineXml = makeInlineVast({
			impressions: ["http://inline.com/imp"],
		});

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapperXml))
			.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/wrapper");
		expect(result.ads[0].impressions).toEqual([
			"http://wrapper.com/imp",
			"http://inline.com/imp",
		]);
	});

	it("merges wrapper errors (prepended)", async () => {
		const wrapperXml = makeWrapperVast("http://example.com/inline", {
			errors: ["http://wrapper.com/error"],
		});
		const inlineXml = makeInlineVast({
			errors: ["http://inline.com/error"],
		});

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapperXml))
			.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/wrapper");
		expect(result.ads[0].errors).toEqual([
			"http://wrapper.com/error",
			"http://inline.com/error",
		]);
	});

	it("detects circular reference", async () => {
		const wrapperXml = makeWrapperVast("http://example.com/wrapper");

		fetchMock.mockReturnValue(mockFetchResponse(wrapperXml));

		const result = await resolveVast("http://example.com/wrapper");
		expect(result.ads).toEqual([]);
		expect(result.errors).toContain("VAST circular reference detected");
	});

	it("returns error on fetch failure mid-chain", async () => {
		const wrapperXml = makeWrapperVast("http://example.com/inline");

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapperXml))
			.mockReturnValueOnce(mockFetchResponse("Server Error", false, 500));

		const result = await resolveVast("http://example.com/wrapper");
		expect(result.ads).toEqual([]);
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it("merges clickTracking from wrapper", async () => {
		const wrapperXml = makeWrapperVast("http://example.com/inline", {
			clickTracking: ["http://wrapper.com/click"],
		});
		const inlineXml = makeInlineVast({
			clickTracking: ["http://inline.com/click"],
		});

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapperXml))
			.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/wrapper");
		expect(result.ads[0].creatives[0].linear?.clickTracking).toEqual([
			"http://wrapper.com/click",
			"http://inline.com/click",
		]);
	});

	it("InLine companions take precedence over wrapper companions", async () => {
		const wrapperXml = makeWrapperVast("http://example.com/inline", {
			companions: [
				{ width: 300, height: 250, staticUrl: "http://wrapper.com/banner.png" },
			],
		});
		const inlineXml = makeInlineVast({
			companions: [
				{
					width: 728,
					height: 90,
					staticUrl: "http://inline.com/leaderboard.png",
				},
			],
		});

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapperXml))
			.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/wrapper");
		const companionAds = result.ads[0].creatives[0].companionAds;
		expect(companionAds).toBeDefined();
		expect(companionAds!.companions).toHaveLength(1);
		expect(companionAds!.companions[0].width).toBe(728);
		expect(companionAds!.companions[0].height).toBe(90);
	});

	it("uses wrapper companions when InLine has none", async () => {
		const wrapperXml = makeWrapperVast("http://example.com/inline", {
			companions: [
				{ width: 300, height: 250, staticUrl: "http://wrapper.com/banner.png" },
			],
		});
		const inlineXml = makeInlineVast();

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapperXml))
			.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/wrapper");
		const companionAds = result.ads[0].creatives[0].companionAds;
		expect(companionAds).toBeDefined();
		expect(companionAds!.companions).toHaveLength(1);
		expect(companionAds!.companions[0].width).toBe(300);
	});

	it("closest wrapper to InLine wins when InLine has no companions", async () => {
		const wrapper1 = makeWrapperVast("http://example.com/w2", {
			companions: [
				{
					width: 300,
					height: 250,
					staticUrl: "http://outer-wrapper.com/banner.png",
				},
			],
		});
		const wrapper2 = makeWrapperVast("http://example.com/inline", {
			companions: [
				{
					width: 728,
					height: 90,
					staticUrl: "http://inner-wrapper.com/banner.png",
				},
			],
		});
		const inlineXml = makeInlineVast();

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapper1))
			.mockReturnValueOnce(mockFetchResponse(wrapper2))
			.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/w1");
		const companionAds = result.ads[0].creatives[0].companionAds;
		expect(companionAds).toBeDefined();
		expect(companionAds!.companions[0].width).toBe(728);
		expect(companionAds!.companions[0].resources[0]).toEqual({
			type: "static",
			url: "http://inner-wrapper.com/banner.png",
			creativeType: "image/png",
		});
	});

	it("merges wrapper CompanionClickTracking into InLine companions", async () => {
		const wrapperXml = makeWrapperVast("http://example.com/inline", {
			companions: [
				{
					width: 300,
					height: 250,
					staticUrl: "http://wrapper.com/banner.png",
					clickTracking: ["http://wrapper.com/comp-click"],
				},
			],
		});
		const inlineXml = makeInlineVast({
			companions: [
				{
					width: 300,
					height: 250,
					staticUrl: "http://inline.com/banner.png",
					clickTracking: ["http://inline.com/comp-click"],
				},
			],
		});

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapperXml))
			.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/wrapper");
		const companionAds = result.ads[0].creatives[0].companionAds;
		expect(companionAds!.companions[0].clickTracking).toEqual([
			"http://wrapper.com/comp-click",
			"http://inline.com/comp-click",
		]);
	});

	it("merges wrapper NonLinearClickTracking into InLine NonLinear", async () => {
		const wrapperXml = makeWrapperVast("http://example.com/inline", {
			nonLinearClickTracking: ["http://wrapper.com/nl-click"],
		});
		const inlineXml = makeInlineVast({
			nonLinears: [
				{
					width: 468,
					height: 60,
					staticUrl: "http://inline.com/overlay.png",
					clickTracking: ["http://inline.com/nl-click"],
				},
			],
		});

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapperXml))
			.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/wrapper");
		const nlAds = result.ads[0].creatives[0].nonLinearAds;
		expect(nlAds).toBeDefined();
		expect(nlAds!.nonLinears[0].clickTracking).toEqual([
			"http://wrapper.com/nl-click",
			"http://inline.com/nl-click",
		]);
	});

	it("merges wrapper NonLinearAds TrackingEvents into InLine", async () => {
		const wrapperXml = makeWrapperVast("http://example.com/inline", {
			nonLinearTracking: {
				creativeView: ["http://wrapper.com/nlview"],
			},
		});
		const inlineXml = makeInlineVast({
			nonLinears: [
				{
					width: 468,
					height: 60,
					staticUrl: "http://inline.com/overlay.png",
				},
			],
			nonLinearTracking: {
				creativeView: ["http://inline.com/nlview"],
			},
		});

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapperXml))
			.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/wrapper");
		const nlAds = result.ads[0].creatives[0].nonLinearAds;
		expect(nlAds).toBeDefined();
		expect(nlAds!.trackingEvents.creativeView).toEqual([
			"http://wrapper.com/nlview",
			"http://inline.com/nlview",
		]);
	});

	// === AdVerifications merge ===

	it("merges AdVerifications from wrapper and InLine", async () => {
		const wrapperXml = makeWrapperVast("http://example.com/inline", {
			verifications: [
				{ vendor: "wrapper-vendor", jsResource: "http://wrapper.com/omid.js" },
			],
		});
		const inlineXml = makeInlineVast({
			verifications: [
				{ vendor: "inline-vendor", jsResource: "http://inline.com/omid.js" },
			],
		});

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapperXml))
			.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/wrapper");
		expect(result.ads[0].verifications).toEqual([
			{
				vendor: "wrapper-vendor",
				resourceUrl: "http://wrapper.com/omid.js",
				apiFramework: "omid",
				parameters: undefined,
			},
			{
				vendor: "inline-vendor",
				resourceUrl: "http://inline.com/omid.js",
				apiFramework: "omid",
				parameters: undefined,
			},
		]);
	});

	it("merges AdVerifications from 2-deep wrapper chain", async () => {
		const wrapper1 = makeWrapperVast("http://example.com/w2", {
			verifications: [
				{ vendor: "outer", jsResource: "http://outer.com/omid.js" },
			],
		});
		const wrapper2 = makeWrapperVast("http://example.com/inline", {
			verifications: [
				{ vendor: "inner", jsResource: "http://inner.com/omid.js" },
			],
		});
		const inlineXml = makeInlineVast({
			verifications: [
				{ vendor: "inline", jsResource: "http://inline.com/omid.js" },
			],
		});

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapper1))
			.mockReturnValueOnce(mockFetchResponse(wrapper2))
			.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/w1");
		expect(result.ads[0].verifications).toHaveLength(3);
		expect(result.ads[0].verifications![0].vendor).toBe("outer");
		expect(result.ads[0].verifications![1].vendor).toBe("inner");
		expect(result.ads[0].verifications![2].vendor).toBe("inline");
	});

	it("uses wrapper verifications when InLine has none", async () => {
		const wrapperXml = makeWrapperVast("http://example.com/inline", {
			verifications: [
				{ vendor: "wrapper-vendor", jsResource: "http://wrapper.com/omid.js" },
			],
		});
		const inlineXml = makeInlineVast();

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapperXml))
			.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/wrapper");
		expect(result.ads[0].verifications).toHaveLength(1);
		expect(result.ads[0].verifications![0].vendor).toBe("wrapper-vendor");
	});

	// === Extensions merge ===

	it("merges Extensions from wrapper and InLine", async () => {
		const wrapperXml = makeWrapperVast("http://example.com/inline", {
			extensions: [{ type: "wrapper-ext", content: "<Foo>bar</Foo>" }],
		});
		const inlineXml = makeInlineVast({
			extensions: [{ type: "inline-ext", content: "<Baz>qux</Baz>" }],
		});

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapperXml))
			.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/wrapper");
		expect(result.ads[0].extensions).toHaveLength(2);
		expect(result.ads[0].extensions![0].type).toBe("wrapper-ext");
		expect(result.ads[0].extensions![1].type).toBe("inline-ext");
	});

	it("preserves undefined extensions when none present", async () => {
		const wrapperXml = makeWrapperVast("http://example.com/inline");
		const inlineXml = makeInlineVast();

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapperXml))
			.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/wrapper");
		expect(result.ads[0].extensions).toBeUndefined();
	});

	// === ViewableImpression merge ===

	it("merges ViewableImpression from wrapper and InLine", async () => {
		const wrapperXml = makeWrapperVast("http://example.com/inline", {
			viewableImpression: {
				viewable: ["http://wrapper.com/viewable"],
			},
		});
		const inlineXml = makeInlineVast({
			viewableImpression: {
				viewable: ["http://inline.com/viewable"],
			},
		});

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapperXml))
			.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/wrapper");
		expect(result.ads[0].viewableImpression).toEqual({
			viewable: ["http://wrapper.com/viewable", "http://inline.com/viewable"],
			notViewable: [],
			viewUndetermined: [],
		});
	});

	it("merges all three ViewableImpression URL types", async () => {
		const wrapperXml = makeWrapperVast("http://example.com/inline", {
			viewableImpression: {
				viewable: ["http://wrapper.com/viewable"],
				notViewable: ["http://wrapper.com/not-viewable"],
				viewUndetermined: ["http://wrapper.com/undetermined"],
			},
		});
		const inlineXml = makeInlineVast({
			viewableImpression: {
				viewable: ["http://inline.com/viewable"],
				notViewable: ["http://inline.com/not-viewable"],
				viewUndetermined: ["http://inline.com/undetermined"],
			},
		});

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapperXml))
			.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/wrapper");
		const vi = result.ads[0].viewableImpression;
		expect(vi).toBeDefined();
		expect(vi!.viewable).toEqual([
			"http://wrapper.com/viewable",
			"http://inline.com/viewable",
		]);
		expect(vi!.notViewable).toEqual([
			"http://wrapper.com/not-viewable",
			"http://inline.com/not-viewable",
		]);
		expect(vi!.viewUndetermined).toEqual([
			"http://wrapper.com/undetermined",
			"http://inline.com/undetermined",
		]);
	});

	it("preserves undefined viewableImpression when none present", async () => {
		const wrapperXml = makeWrapperVast("http://example.com/inline");
		const inlineXml = makeInlineVast();

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapperXml))
			.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/wrapper");
		expect(result.ads[0].viewableImpression).toBeUndefined();
	});

	// === Companion creativeView tracking merge ===

	it("merges wrapper companion creativeView tracking into InLine companions", async () => {
		const wrapperXml = makeWrapperVast("http://example.com/inline", {
			companions: [
				{
					width: 300,
					height: 250,
					staticUrl: "http://wrapper.com/banner.png",
					creativeViewTracking: ["http://wrapper.com/comp-view"],
				},
			],
		});
		const inlineXml = makeInlineVast({
			companions: [
				{
					width: 300,
					height: 250,
					staticUrl: "http://inline.com/banner.png",
					creativeViewTracking: ["http://inline.com/comp-view"],
				},
			],
		});

		fetchMock
			.mockReturnValueOnce(mockFetchResponse(wrapperXml))
			.mockReturnValueOnce(mockFetchResponse(inlineXml));

		const result = await resolveVast("http://example.com/wrapper");
		const companionAds = result.ads[0].creatives[0].companionAds;
		expect(companionAds!.companions[0].trackingEvents.creativeView).toEqual([
			"http://wrapper.com/comp-view",
			"http://inline.com/comp-view",
		]);
	});
});
