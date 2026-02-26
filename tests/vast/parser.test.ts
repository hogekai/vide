import { describe, expect, it } from "vitest";
import { parseDuration, parseVast } from "../../src/vast/parser.js";

const SAMPLE_VAST = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="ad-001" sequence="1">
    <InLine>
      <AdSystem version="1.0">TestAdServer</AdSystem>
      <AdTitle>Test Ad</AdTitle>
      <Impression id="imp1"><![CDATA[http://tracker.example.com/impression]]></Impression>
      <Impression id="imp2"><![CDATA[http://tracker2.example.com/impression]]></Impression>
      <Error><![CDATA[http://tracker.example.com/error]]></Error>
      <Creatives>
        <Creative id="creative-001" sequence="1">
          <Linear skipoffset="00:00:05">
            <Duration>00:00:30</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="1920" height="1080" bitrate="2000">
                <![CDATA[http://cdn.example.com/ad_high.mp4]]>
              </MediaFile>
              <MediaFile delivery="progressive" type="video/mp4" width="640" height="360" bitrate="500">
                <![CDATA[http://cdn.example.com/ad_low.mp4]]>
              </MediaFile>
            </MediaFiles>
            <VideoClicks>
              <ClickThrough><![CDATA[http://advertiser.example.com/landing]]></ClickThrough>
              <ClickTracking><![CDATA[http://tracker.example.com/click]]></ClickTracking>
            </VideoClicks>
            <TrackingEvents>
              <Tracking event="start"><![CDATA[http://tracker.example.com/start]]></Tracking>
              <Tracking event="firstQuartile"><![CDATA[http://tracker.example.com/firstQuartile]]></Tracking>
              <Tracking event="midpoint"><![CDATA[http://tracker.example.com/midpoint]]></Tracking>
              <Tracking event="thirdQuartile"><![CDATA[http://tracker.example.com/thirdQuartile]]></Tracking>
              <Tracking event="complete"><![CDATA[http://tracker.example.com/complete]]></Tracking>
              <Tracking event="pause"><![CDATA[http://tracker.example.com/pause]]></Tracking>
              <Tracking event="resume"><![CDATA[http://tracker.example.com/resume]]></Tracking>
              <Tracking event="skip"><![CDATA[http://tracker.example.com/skip]]></Tracking>
            </TrackingEvents>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;

describe("parseVast", () => {
	it("parses version", () => {
		const result = parseVast(SAMPLE_VAST);
		expect(result.version).toBe("4.1");
	});

	it("parses ad metadata", () => {
		const result = parseVast(SAMPLE_VAST);
		expect(result.ads).toHaveLength(1);

		const ad = result.ads[0];
		expect(ad.id).toBe("ad-001");
		expect(ad.sequence).toBe(1);
		expect(ad.adSystem).toBe("TestAdServer");
		expect(ad.adTitle).toBe("Test Ad");
	});

	it("parses impressions", () => {
		const result = parseVast(SAMPLE_VAST);
		const ad = result.ads[0];
		expect(ad.impressions).toEqual([
			"http://tracker.example.com/impression",
			"http://tracker2.example.com/impression",
		]);
	});

	it("parses ad-level errors", () => {
		const result = parseVast(SAMPLE_VAST);
		const ad = result.ads[0];
		expect(ad.errors).toEqual(["http://tracker.example.com/error"]);
	});

	it("parses linear creative", () => {
		const result = parseVast(SAMPLE_VAST);
		const creative = result.ads[0].creatives[0];
		expect(creative.id).toBe("creative-001");
		expect(creative.sequence).toBe(1);
		expect(creative.linear).not.toBeNull();
	});

	it("parses duration and skipOffset", () => {
		const result = parseVast(SAMPLE_VAST);
		const linear = result.ads[0].creatives[0].linear!;
		expect(linear.duration).toBe(30);
		expect(linear.skipOffset).toBe(5);
	});

	it("parses media files", () => {
		const result = parseVast(SAMPLE_VAST);
		const linear = result.ads[0].creatives[0].linear!;
		expect(linear.mediaFiles).toHaveLength(2);

		const high = linear.mediaFiles[0];
		expect(high.url).toBe("http://cdn.example.com/ad_high.mp4");
		expect(high.mimeType).toBe("video/mp4");
		expect(high.width).toBe(1920);
		expect(high.height).toBe(1080);
		expect(high.bitrate).toBe(2000);
		expect(high.delivery).toBe("progressive");

		const low = linear.mediaFiles[1];
		expect(low.url).toBe("http://cdn.example.com/ad_low.mp4");
		expect(low.bitrate).toBe(500);
	});

	it("parses video clicks", () => {
		const result = parseVast(SAMPLE_VAST);
		const linear = result.ads[0].creatives[0].linear!;
		expect(linear.clickThrough).toBe(
			"http://advertiser.example.com/landing",
		);
		expect(linear.clickTracking).toEqual([
			"http://tracker.example.com/click",
		]);
	});

	it("parses tracking events", () => {
		const result = parseVast(SAMPLE_VAST);
		const events = result.ads[0].creatives[0].linear!.trackingEvents;
		expect(events.start).toEqual(["http://tracker.example.com/start"]);
		expect(events.firstQuartile).toEqual([
			"http://tracker.example.com/firstQuartile",
		]);
		expect(events.midpoint).toEqual([
			"http://tracker.example.com/midpoint",
		]);
		expect(events.thirdQuartile).toEqual([
			"http://tracker.example.com/thirdQuartile",
		]);
		expect(events.complete).toEqual([
			"http://tracker.example.com/complete",
		]);
		expect(events.pause).toEqual(["http://tracker.example.com/pause"]);
		expect(events.resume).toEqual(["http://tracker.example.com/resume"]);
		expect(events.skip).toEqual(["http://tracker.example.com/skip"]);
	});
});

describe("parseVast — edge cases", () => {
	it("handles empty XML string", () => {
		const result = parseVast("");
		expect(result.ads).toEqual([]);
		expect(result.errors).toEqual([]);
	});

	it("handles invalid XML", () => {
		const result = parseVast("<not valid xml>>>");
		expect(result.ads).toEqual([]);
	});

	it("handles non-VAST root element", () => {
		const result = parseVast("<html><body>hello</body></html>");
		expect(result.ads).toEqual([]);
		expect(result.version).toBe("");
	});

	it("handles VAST with no ads (error response)", () => {
		const xml = `<?xml version="1.0"?>
<VAST version="4.1">
  <Error><![CDATA[http://tracker.example.com/noads]]></Error>
</VAST>`;
		const result = parseVast(xml);
		expect(result.ads).toEqual([]);
		expect(result.errors).toEqual(["http://tracker.example.com/noads"]);
	});

	it("handles Wrapper ads (skips them in v0.1)", () => {
		const xml = `<?xml version="1.0"?>
<VAST version="4.1">
  <Ad id="wrapper">
    <Wrapper>
      <AdSystem>Wrapper</AdSystem>
      <VASTAdTagURI><![CDATA[http://example.com/vast]]></VASTAdTagURI>
    </Wrapper>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		expect(result.ads).toEqual([]);
	});

	it("handles creative without Linear", () => {
		const xml = `<?xml version="1.0"?>
<VAST version="4.1">
  <Ad id="ad-002">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>NonLinear Ad</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative id="c1">
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		expect(result.ads).toHaveLength(1);
		expect(result.ads[0].creatives[0].linear).toBeNull();
	});

	it("handles Linear without skipoffset", () => {
		const xml = `<?xml version="1.0"?>
<VAST version="4.1">
  <Ad id="ad-003">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>No Skip</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:15</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="640" height="360">
                <![CDATA[http://example.com/ad.mp4]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		const linear = result.ads[0].creatives[0].linear!;
		expect(linear.duration).toBe(15);
		expect(linear.skipOffset).toBeUndefined();
	});

	it("handles multiple ads with sequence", () => {
		const xml = `<?xml version="1.0"?>
<VAST version="4.1">
  <Ad id="ad-1" sequence="1">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>Ad 1</AdTitle>
      <Impression><![CDATA[http://example.com/imp1]]></Impression>
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:10</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="640" height="360">
                <![CDATA[http://example.com/ad1.mp4]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
  <Ad id="ad-2" sequence="2">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>Ad 2</AdTitle>
      <Impression><![CDATA[http://example.com/imp2]]></Impression>
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:20</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="640" height="360">
                <![CDATA[http://example.com/ad2.mp4]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		expect(result.ads).toHaveLength(2);
		expect(result.ads[0].id).toBe("ad-1");
		expect(result.ads[0].sequence).toBe(1);
		expect(result.ads[1].id).toBe("ad-2");
		expect(result.ads[1].sequence).toBe(2);
	});

	it("handles percentage skipoffset", () => {
		const xml = `<?xml version="1.0"?>
<VAST version="4.1">
  <Ad id="ad-004">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>Pct Skip</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative>
          <Linear skipoffset="25%">
            <Duration>00:00:20</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="640" height="360">
                <![CDATA[http://example.com/ad.mp4]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		const linear = result.ads[0].creatives[0].linear!;
		expect(linear.skipOffset).toBe(5); // 25% of 20s
	});
});

describe("parseDuration", () => {
	it("parses HH:MM:SS", () => {
		expect(parseDuration("00:00:30")).toBe(30);
		expect(parseDuration("00:01:00")).toBe(60);
		expect(parseDuration("01:00:00")).toBe(3600);
		expect(parseDuration("01:30:45")).toBe(5445);
	});

	it("parses HH:MM:SS.mmm", () => {
		expect(parseDuration("00:00:15.500")).toBe(15.5);
		expect(parseDuration("00:00:00.100")).toBeCloseTo(0.1);
	});

	it("returns 0 for empty string", () => {
		expect(parseDuration("")).toBe(0);
	});

	it("returns 0 for invalid format", () => {
		expect(parseDuration("30")).toBe(0);
		expect(parseDuration("abc")).toBe(0);
		expect(parseDuration("00:30")).toBe(0);
	});
});
