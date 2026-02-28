import { describe, expect, it } from "vitest";
import { parseTimeOffset, parseVmap } from "../../src/vmap/parser.js";

const SAMPLE_VMAP = `<?xml version="1.0" encoding="UTF-8"?>
<VMAP xmlns:vmap="http://www.iab.net/videosuite/vmap" version="1.0">
  <AdBreak timeOffset="start" breakType="linear" breakId="preroll">
    <AdSource id="pre-ad" allowMultipleAds="false" followRedirects="true">
      <AdTagURI><![CDATA[http://example.com/vast/preroll]]></AdTagURI>
    </AdSource>
  </AdBreak>
  <AdBreak timeOffset="00:05:00" breakType="linear" breakId="midroll-1">
    <AdSource id="mid-ad">
      <AdTagURI><![CDATA[http://example.com/vast/midroll]]></AdTagURI>
    </AdSource>
  </AdBreak>
  <AdBreak timeOffset="end" breakType="linear" breakId="postroll">
    <AdSource id="post-ad">
      <AdTagURI><![CDATA[http://example.com/vast/postroll]]></AdTagURI>
    </AdSource>
  </AdBreak>
</VMAP>`;

describe("parseVmap", () => {
	it("parses 3 ad breaks (pre + mid + post)", () => {
		const result = parseVmap(SAMPLE_VMAP);
		expect(result.version).toBe("1.0");
		expect(result.adBreaks).toHaveLength(3);

		expect(result.adBreaks[0].timeOffset).toEqual({ type: "start" });
		expect(result.adBreaks[0].breakType).toBe("linear");
		expect(result.adBreaks[0].breakId).toBe("preroll");

		expect(result.adBreaks[1].timeOffset).toEqual({
			type: "time",
			seconds: 300,
		});
		expect(result.adBreaks[1].breakId).toBe("midroll-1");

		expect(result.adBreaks[2].timeOffset).toEqual({ type: "end" });
		expect(result.adBreaks[2].breakId).toBe("postroll");
	});

	it("parses AdSource with AdTagURI as vastUrl", () => {
		const result = parseVmap(SAMPLE_VMAP);
		const adSource = result.adBreaks[0].adSource;
		expect(adSource).not.toBeNull();
		expect(adSource?.vastUrl).toBe("http://example.com/vast/preroll");
		expect(adSource?.id).toBe("pre-ad");
		expect(adSource?.allowMultipleAds).toBe(false);
		expect(adSource?.followRedirects).toBe(true);
	});

	it("parses AdSource with VASTAdData as vastData", () => {
		const xml = `<?xml version="1.0"?>
<VMAP version="1.0">
  <AdBreak timeOffset="start" breakType="linear">
    <AdSource id="inline-ad">
      <VASTAdData>
        <VAST version="4.1">
          <Ad id="ad-001">
            <InLine>
              <AdSystem>Test</AdSystem>
              <AdTitle>Inline Ad</AdTitle>
              <Impression><![CDATA[http://example.com/imp]]></Impression>
              <Creatives>
                <Creative>
                  <Linear>
                    <Duration>00:00:15</Duration>
                    <MediaFiles>
                      <MediaFile delivery="progressive" type="video/mp4" width="640" height="360">
                        <![CDATA[http://cdn.example.com/ad.mp4]]>
                      </MediaFile>
                    </MediaFiles>
                  </Linear>
                </Creative>
              </Creatives>
            </InLine>
          </Ad>
        </VAST>
      </VASTAdData>
    </AdSource>
  </AdBreak>
</VMAP>`;
		const result = parseVmap(xml);
		const adSource = result.adBreaks[0].adSource;
		expect(adSource).not.toBeNull();
		expect(adSource?.vastData).toBeDefined();
		expect(adSource?.vastData).toContain("VAST");
		expect(adSource?.vastData).toContain("ad-001");
	});

	it("handles empty VMAP (no breaks)", () => {
		const xml = `<?xml version="1.0"?>
<VMAP version="1.0">
</VMAP>`;
		const result = parseVmap(xml);
		expect(result.version).toBe("1.0");
		expect(result.adBreaks).toEqual([]);
	});

	it("handles invalid XML", () => {
		const result = parseVmap("<not valid>>>");
		expect(result.adBreaks).toEqual([]);
	});

	it("handles non-VMAP root element", () => {
		const result = parseVmap("<html><body>hello</body></html>");
		expect(result.adBreaks).toEqual([]);
	});

	it("handles namespaced VMAP (vmap:VMAP)", () => {
		const xml = `<?xml version="1.0"?>
<vmap:VMAP xmlns:vmap="http://www.iab.net/videosuite/vmap" version="1.0">
  <vmap:AdBreak timeOffset="start" breakType="linear">
    <vmap:AdSource id="src-1">
      <vmap:AdTagURI><![CDATA[http://example.com/vast]]></vmap:AdTagURI>
    </vmap:AdSource>
  </vmap:AdBreak>
</vmap:VMAP>`;
		const result = parseVmap(xml);
		expect(result.version).toBe("1.0");
		expect(result.adBreaks).toHaveLength(1);
		expect(result.adBreaks[0].timeOffset).toEqual({ type: "start" });
		expect(result.adBreaks[0].adSource?.vastUrl).toBe(
			"http://example.com/vast",
		);
	});

	it("handles AdBreak without AdSource", () => {
		const xml = `<?xml version="1.0"?>
<VMAP version="1.0">
  <AdBreak timeOffset="start" breakType="linear">
  </AdBreak>
</VMAP>`;
		const result = parseVmap(xml);
		expect(result.adBreaks).toHaveLength(1);
		expect(result.adBreaks[0].adSource).toBeNull();
	});

	it("validates breakType attribute values", () => {
		const xml = `<?xml version="1.0"?>
<VMAP version="1.0">
  <AdBreak timeOffset="start" breakType="nonlinear"></AdBreak>
  <AdBreak timeOffset="end" breakType="display"></AdBreak>
  <AdBreak timeOffset="00:05:00" breakType="bogus"></AdBreak>
</VMAP>`;
		const result = parseVmap(xml);
		expect(result.adBreaks[0].breakType).toBe("nonlinear");
		expect(result.adBreaks[1].breakType).toBe("display");
		expect(result.adBreaks[2].breakType).toBe("linear");
	});
});

describe("parseVmap — AdBreak TrackingEvents", () => {
	it("parses breakStart, breakEnd, and error tracking events", () => {
		const xml = `<?xml version="1.0"?>
<VMAP version="1.0">
  <AdBreak timeOffset="start" breakType="linear" breakId="pre">
    <AdSource id="src">
      <AdTagURI><![CDATA[http://example.com/vast]]></AdTagURI>
    </AdSource>
    <TrackingEvents>
      <Tracking event="breakStart"><![CDATA[http://example.com/breakStart]]></Tracking>
      <Tracking event="breakEnd"><![CDATA[http://example.com/breakEnd]]></Tracking>
      <Tracking event="error"><![CDATA[http://example.com/error]]></Tracking>
    </TrackingEvents>
  </AdBreak>
</VMAP>`;
		const result = parseVmap(xml);
		const adBreak = result.adBreaks[0];
		expect(adBreak.trackingEvents.breakStart).toEqual([
			"http://example.com/breakStart",
		]);
		expect(adBreak.trackingEvents.breakEnd).toEqual([
			"http://example.com/breakEnd",
		]);
		expect(adBreak.trackingEvents.error).toEqual(["http://example.com/error"]);
	});

	it("returns empty arrays when no TrackingEvents element", () => {
		const result = parseVmap(SAMPLE_VMAP);
		for (const adBreak of result.adBreaks) {
			expect(adBreak.trackingEvents.breakStart).toEqual([]);
			expect(adBreak.trackingEvents.breakEnd).toEqual([]);
			expect(adBreak.trackingEvents.error).toEqual([]);
		}
	});

	it("handles multiple tracking URLs per event type", () => {
		const xml = `<?xml version="1.0"?>
<VMAP version="1.0">
  <AdBreak timeOffset="start" breakType="linear">
    <TrackingEvents>
      <Tracking event="breakStart"><![CDATA[http://example.com/bs1]]></Tracking>
      <Tracking event="breakStart"><![CDATA[http://example.com/bs2]]></Tracking>
    </TrackingEvents>
  </AdBreak>
</VMAP>`;
		const result = parseVmap(xml);
		expect(result.adBreaks[0].trackingEvents.breakStart).toEqual([
			"http://example.com/bs1",
			"http://example.com/bs2",
		]);
	});
});

describe("parseTimeOffset", () => {
	it("parses 'start'", () => {
		expect(parseTimeOffset("start")).toEqual({ type: "start" });
	});

	it("parses 'end'", () => {
		expect(parseTimeOffset("end")).toEqual({ type: "end" });
	});

	it("parses HH:MM:SS", () => {
		expect(parseTimeOffset("00:05:00")).toEqual({
			type: "time",
			seconds: 300,
		});
		expect(parseTimeOffset("01:30:45")).toEqual({
			type: "time",
			seconds: 5445,
		});
	});

	it("parses HH:MM:SS.mmm", () => {
		expect(parseTimeOffset("00:00:10.500")).toEqual({
			type: "time",
			seconds: 10.5,
		});
	});

	it("parses percentage offset", () => {
		expect(parseTimeOffset("50%")).toEqual({ type: "percentage", pct: 50 });
		expect(parseTimeOffset("25.5%")).toEqual({
			type: "percentage",
			pct: 25.5,
		});
	});

	it("handles invalid percentage", () => {
		expect(parseTimeOffset("abc%")).toEqual({ type: "time", seconds: 0 });
	});
});
