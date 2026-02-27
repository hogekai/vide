import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveVast } from "../../src/vast/parser.js";

function makeInlineVast(options?: {
	adId?: string;
	impressions?: string[];
	errors?: string[];
	tracking?: Record<string, string[]>;
	clickTracking?: string[];
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

	return `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="${adId}">
    <InLine>
      <AdSystem>TestAdServer</AdSystem>
      <AdTitle>Test Ad</AdTitle>
      ${impressions}
      ${errors}
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
          </Linear>
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

	return `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="wrapper">
    <Wrapper>
      <AdSystem>WrapperServer</AdSystem>
      <VASTAdTagURI><![CDATA[${adTagUri}]]></VASTAdTagURI>
      ${impressions}
      ${errors}
      <Creatives>
        <Creative>
          <Linear>
            <TrackingEvents>
              ${trackingXml}
            </TrackingEvents>
            <VideoClicks>
              ${clickTracking}
            </VideoClicks>
          </Linear>
        </Creative>
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

		const startEvents = result.ads[0].creatives[0].linear!.trackingEvents.start;
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
		const events = result.ads[0].creatives[0].linear!.trackingEvents;

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
		expect(result.ads[0].creatives[0].linear!.clickTracking).toEqual([
			"http://wrapper.com/click",
			"http://inline.com/click",
		]);
	});
});
