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
		expect(linear.clickThrough).toBe("http://advertiser.example.com/landing");
		expect(linear.clickTracking).toEqual(["http://tracker.example.com/click"]);
	});

	it("parses tracking events", () => {
		const result = parseVast(SAMPLE_VAST);
		const events = result.ads[0].creatives[0].linear?.trackingEvents;
		expect(events.start).toEqual(["http://tracker.example.com/start"]);
		expect(events.firstQuartile).toEqual([
			"http://tracker.example.com/firstQuartile",
		]);
		expect(events.midpoint).toEqual(["http://tracker.example.com/midpoint"]);
		expect(events.thirdQuartile).toEqual([
			"http://tracker.example.com/thirdQuartile",
		]);
		expect(events.complete).toEqual(["http://tracker.example.com/complete"]);
		expect(events.pause).toEqual(["http://tracker.example.com/pause"]);
		expect(events.resume).toEqual(["http://tracker.example.com/resume"]);
		expect(events.skip).toEqual(["http://tracker.example.com/skip"]);
	});
});

describe("parseVast — edge cases", () => {
	it("handles empty XML string", () => {
		const result = parseVast("");
		expect(result.ads).toEqual([]);
		expect(result.errors).toEqual(["VAST XML parse error"]);
	});

	it("handles invalid XML", () => {
		const result = parseVast("<not valid xml>>>");
		expect(result.ads).toEqual([]);
		expect(result.errors).toEqual(["VAST XML parse error"]);
	});

	it("handles non-VAST root element", () => {
		const result = parseVast("<html><body>hello</body></html>");
		expect(result.ads).toEqual([]);
		expect(result.version).toBe("");
		expect(result.errors).toEqual(["Document is not a VAST response"]);
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

describe("parseVast — VAST 4.2 additions", () => {
	it("parses AdVerifications", () => {
		const xml = `<?xml version="1.0"?>
<VAST version="4.2">
  <Ad id="ad-v42">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>Verified Ad</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <AdVerifications>
        <Verification vendor="company.com-omid">
          <JavaScriptResource apiFramework="omid">
            <![CDATA[http://example.com/verify.js]]>
          </JavaScriptResource>
          <VerificationParameters><![CDATA[param=value]]></VerificationParameters>
        </Verification>
      </AdVerifications>
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
		const ad = result.ads[0];
		expect(ad.verifications).toBeDefined();
		expect(ad.verifications).toHaveLength(1);
		expect(ad.verifications?.[0].vendor).toBe("company.com-omid");
		expect(ad.verifications?.[0].resourceUrl).toBe(
			"http://example.com/verify.js",
		);
		expect(ad.verifications?.[0].apiFramework).toBe("omid");
		expect(ad.verifications?.[0].parameters).toBe("param=value");
	});

	it("returns undefined verifications when absent", () => {
		const result = parseVast(SAMPLE_VAST);
		expect(result.ads[0].verifications).toBeUndefined();
	});

	it("parses Categories", () => {
		const xml = `<?xml version="1.0"?>
<VAST version="4.2">
  <Ad id="ad-cat">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>Categorized Ad</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Category authority="iabtechlab.com">232</Category>
      <Category authority="google.com">auto</Category>
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:10</Duration>
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
		const ad = result.ads[0];
		expect(ad.categories).toBeDefined();
		expect(ad.categories).toHaveLength(2);
		expect(ad.categories?.[0]).toEqual({
			authority: "iabtechlab.com",
			value: "232",
		});
		expect(ad.categories?.[1]).toEqual({
			authority: "google.com",
			value: "auto",
		});
	});

	it("returns undefined categories when absent", () => {
		const result = parseVast(SAMPLE_VAST);
		expect(result.ads[0].categories).toBeUndefined();
	});
});

describe("parseVast — NaN and type safety", () => {
	it("handles non-numeric sequence attribute", () => {
		const xml = `<?xml version="1.0"?>
<VAST version="4.1">
  <Ad id="ad-nan" sequence="abc">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>NaN Seq</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative sequence="xyz">
          <Linear>
            <Duration>00:00:10</Duration>
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
		expect(result.ads[0].sequence).toBeUndefined();
		expect(result.ads[0].creatives[0].sequence).toBeUndefined();
	});

	it("handles non-numeric width/height/bitrate attributes", () => {
		const xml = `<?xml version="1.0"?>
<VAST version="4.1">
  <Ad id="ad-dim">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>Bad Dims</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:10</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="abc" height="def" bitrate="ghi">
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
		const mf = result.ads[0].creatives[0].linear?.mediaFiles[0];
		expect(mf.width).toBe(0);
		expect(mf.height).toBe(0);
		expect(mf.bitrate).toBeUndefined();
	});

	it("validates delivery attribute values", () => {
		const xml = `<?xml version="1.0"?>
<VAST version="4.1">
  <Ad id="ad-del">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>Delivery</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:10</Duration>
            <MediaFiles>
              <MediaFile type="video/mp4" width="640" height="360" delivery="streaming">
                <![CDATA[http://example.com/stream.mp4]]>
              </MediaFile>
              <MediaFile type="video/mp4" width="640" height="360" delivery="unknown">
                <![CDATA[http://example.com/unknown.mp4]]>
              </MediaFile>
              <MediaFile type="video/mp4" width="640" height="360">
                <![CDATA[http://example.com/noattr.mp4]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		const files = result.ads[0].creatives[0].linear?.mediaFiles;
		expect(files[0].delivery).toBe("streaming");
		expect(files[1].delivery).toBe("progressive");
		expect(files[2].delivery).toBe("progressive");
	});
});

describe("parseVast — InteractiveCreativeFile", () => {
	it("parses InteractiveCreativeFile with SIMID apiFramework", () => {
		const xml = `<?xml version="1.0"?>
<VAST version="4.1">
  <Ad id="ad-simid">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>SIMID Ad</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:30</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="640" height="360">
                <![CDATA[http://example.com/ad.mp4]]>
              </MediaFile>
              <InteractiveCreativeFile type="text/html" apiFramework="SIMID" variableDuration="true">
                <![CDATA[https://adserver.com/ads/creative.html]]>
              </InteractiveCreativeFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		const linear = result.ads[0].creatives[0].linear!;
		expect(linear.interactiveCreativeFiles).toHaveLength(1);
		expect(linear.interactiveCreativeFiles[0].url).toBe(
			"https://adserver.com/ads/creative.html",
		);
		expect(linear.interactiveCreativeFiles[0].apiFramework).toBe("SIMID");
		expect(linear.interactiveCreativeFiles[0].variableDuration).toBe(true);
	});

	it("parses variableDuration=false", () => {
		const xml = `<?xml version="1.0"?>
<VAST version="4.1">
  <Ad id="ad-simid2">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>SIMID Ad 2</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:15</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="640" height="360">
                <![CDATA[http://example.com/ad.mp4]]>
              </MediaFile>
              <InteractiveCreativeFile type="text/html" apiFramework="SIMID" variableDuration="false">
                <![CDATA[https://adserver.com/creative2.html]]>
              </InteractiveCreativeFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		const icf = result.ads[0].creatives[0].linear?.interactiveCreativeFiles[0];
		expect(icf.variableDuration).toBe(false);
	});

	it("returns empty array when no InteractiveCreativeFile present", () => {
		const result = parseVast(SAMPLE_VAST);
		const linear = result.ads[0].creatives[0].linear!;
		expect(linear.interactiveCreativeFiles).toEqual([]);
	});
});

describe("parseVast — extended tracking events", () => {
	it("parses loaded, mute, unmute, rewind, playerExpand, playerCollapse, closeLinear, creativeView", () => {
		const xml = `<?xml version="1.0"?>
<VAST version="4.1">
  <Ad id="ad-events">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>Events Ad</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:30</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="640" height="360">
                <![CDATA[http://example.com/ad.mp4]]>
              </MediaFile>
            </MediaFiles>
            <TrackingEvents>
              <Tracking event="loaded"><![CDATA[http://example.com/loaded]]></Tracking>
              <Tracking event="mute"><![CDATA[http://example.com/mute]]></Tracking>
              <Tracking event="unmute"><![CDATA[http://example.com/unmute]]></Tracking>
              <Tracking event="rewind"><![CDATA[http://example.com/rewind]]></Tracking>
              <Tracking event="playerExpand"><![CDATA[http://example.com/expand]]></Tracking>
              <Tracking event="playerCollapse"><![CDATA[http://example.com/collapse]]></Tracking>
              <Tracking event="closeLinear"><![CDATA[http://example.com/close]]></Tracking>
              <Tracking event="creativeView"><![CDATA[http://example.com/creativeView]]></Tracking>
              <Tracking event="notUsed"><![CDATA[http://example.com/notUsed]]></Tracking>
              <Tracking event="otherAdInteraction"><![CDATA[http://example.com/other]]></Tracking>
            </TrackingEvents>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		const events = result.ads[0].creatives[0].linear?.trackingEvents;
		expect(events.loaded).toEqual(["http://example.com/loaded"]);
		expect(events.mute).toEqual(["http://example.com/mute"]);
		expect(events.unmute).toEqual(["http://example.com/unmute"]);
		expect(events.rewind).toEqual(["http://example.com/rewind"]);
		expect(events.playerExpand).toEqual(["http://example.com/expand"]);
		expect(events.playerCollapse).toEqual(["http://example.com/collapse"]);
		expect(events.closeLinear).toEqual(["http://example.com/close"]);
		expect(events.creativeView).toEqual(["http://example.com/creativeView"]);
		expect(events.notUsed).toEqual(["http://example.com/notUsed"]);
		expect(events.otherAdInteraction).toEqual(["http://example.com/other"]);
	});

	it("parses progress events with offsets", () => {
		const xml = `<?xml version="1.0"?>
<VAST version="4.1">
  <Ad id="ad-progress">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>Progress Ad</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:30</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="640" height="360">
                <![CDATA[http://example.com/ad.mp4]]>
              </MediaFile>
            </MediaFiles>
            <TrackingEvents>
              <Tracking event="progress" offset="00:00:05"><![CDATA[http://example.com/progress5]]></Tracking>
              <Tracking event="progress" offset="00:00:10"><![CDATA[http://example.com/progress10]]></Tracking>
            </TrackingEvents>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		const events = result.ads[0].creatives[0].linear?.trackingEvents;
		expect(events.progress).toEqual([
			{ offset: 5, url: "http://example.com/progress5" },
			{ offset: 10, url: "http://example.com/progress10" },
		]);
	});

	it("returns empty arrays for new tracking events when absent", () => {
		const result = parseVast(SAMPLE_VAST);
		const events = result.ads[0].creatives[0].linear?.trackingEvents;
		expect(events.loaded).toEqual([]);
		expect(events.mute).toEqual([]);
		expect(events.unmute).toEqual([]);
		expect(events.rewind).toEqual([]);
		expect(events.playerExpand).toEqual([]);
		expect(events.playerCollapse).toEqual([]);
		expect(events.closeLinear).toEqual([]);
		expect(events.notUsed).toEqual([]);
		expect(events.otherAdInteraction).toEqual([]);
		expect(events.creativeView).toEqual([]);
		expect(events.progress).toEqual([]);
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

// === CompanionAds ===

const COMPANION_VAST = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="ad-comp">
    <InLine>
      <AdSystem>TestAdServer</AdSystem>
      <AdTitle>Companion Ad</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative id="c1">
          <Linear>
            <Duration>00:00:30</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="640" height="360">
                <![CDATA[http://example.com/ad.mp4]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
          <CompanionAds required="all">
            <Companion width="300" height="250" id="comp-1" assetWidth="280" assetHeight="230" expandedWidth="600" expandedHeight="500" apiFramework="VPAID" adSlotId="sidebar" pxratio="2" renderingMode="concurrent">
              <StaticResource creativeType="image/png"><![CDATA[http://example.com/banner.png]]></StaticResource>
              <CompanionClickThrough><![CDATA[http://example.com/click]]></CompanionClickThrough>
              <CompanionClickTracking><![CDATA[http://example.com/track-click]]></CompanionClickTracking>
              <TrackingEvents>
                <Tracking event="creativeView"><![CDATA[http://example.com/view]]></Tracking>
              </TrackingEvents>
              <AltText>Banner ad</AltText>
              <AdParameters><![CDATA[param=value]]></AdParameters>
            </Companion>
          </CompanionAds>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;

describe("parseVast — CompanionAds", () => {
	it("parses a companion with StaticResource", () => {
		const result = parseVast(COMPANION_VAST);
		const creative = result.ads[0].creatives[0];
		expect(creative.companionAds).toBeDefined();
		expect(creative.companionAds!.required).toBe("all");
		expect(creative.companionAds!.companions).toHaveLength(1);

		const comp = creative.companionAds!.companions[0];
		expect(comp.width).toBe(300);
		expect(comp.height).toBe(250);
		expect(comp.id).toBe("comp-1");
		expect(comp.resources).toHaveLength(1);
		expect(comp.resources[0]).toEqual({
			type: "static",
			url: "http://example.com/banner.png",
			creativeType: "image/png",
		});
		expect(comp.clickThrough).toBe("http://example.com/click");
		expect(comp.clickTracking).toEqual(["http://example.com/track-click"]);
		expect(comp.trackingEvents.creativeView).toEqual([
			"http://example.com/view",
		]);
		expect(comp.altText).toBe("Banner ad");
		expect(comp.adParameters).toBe("param=value");
	});

	it("parses all three resource types", () => {
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="ad-multi">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>Multi Resource</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative>
          <CompanionAds>
            <Companion width="300" height="250">
              <StaticResource creativeType="image/jpeg"><![CDATA[http://example.com/img.jpg]]></StaticResource>
              <IFrameResource><![CDATA[http://example.com/iframe.html]]></IFrameResource>
              <HTMLResource><![CDATA[<div>Hello</div>]]></HTMLResource>
            </Companion>
          </CompanionAds>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		const comp = result.ads[0].creatives[0].companionAds!.companions[0];
		expect(comp.resources).toHaveLength(3);
		expect(comp.resources[0]).toEqual({
			type: "static",
			url: "http://example.com/img.jpg",
			creativeType: "image/jpeg",
		});
		expect(comp.resources[1]).toEqual({
			type: "iframe",
			url: "http://example.com/iframe.html",
		});
		expect(comp.resources[2]).toEqual({
			type: "html",
			content: "<div>Hello</div>",
		});
	});

	it("parses required attribute values", () => {
		function makeVastWithRequired(required: string | null): string {
			const attr = required !== null ? ` required="${required}"` : "";
			return `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="ad-req">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>Required Test</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative>
          <CompanionAds${attr}>
            <Companion width="300" height="250">
              <StaticResource creativeType="image/png"><![CDATA[http://example.com/img.png]]></StaticResource>
            </Companion>
          </CompanionAds>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		}

		expect(
			parseVast(makeVastWithRequired("all")).ads[0].creatives[0].companionAds!
				.required,
		).toBe("all");
		expect(
			parseVast(makeVastWithRequired("any")).ads[0].creatives[0].companionAds!
				.required,
		).toBe("any");
		expect(
			parseVast(makeVastWithRequired("none")).ads[0].creatives[0].companionAds!
				.required,
		).toBe("none");
		expect(
			parseVast(makeVastWithRequired(null)).ads[0].creatives[0].companionAds!
				.required,
		).toBe("none");
	});

	it("parses all optional companion attributes", () => {
		const result = parseVast(COMPANION_VAST);
		const comp = result.ads[0].creatives[0].companionAds!.companions[0];
		expect(comp.assetWidth).toBe(280);
		expect(comp.assetHeight).toBe(230);
		expect(comp.expandedWidth).toBe(600);
		expect(comp.expandedHeight).toBe(500);
		expect(comp.apiFramework).toBe("VPAID");
		expect(comp.adSlotId).toBe("sidebar");
		expect(comp.pxratio).toBe(2);
		expect(comp.renderingMode).toBe("concurrent");
	});

	it("skips companion without width or height", () => {
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="ad-skip">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>Skip Test</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative>
          <CompanionAds>
            <Companion height="250">
              <StaticResource creativeType="image/png"><![CDATA[http://example.com/img.png]]></StaticResource>
            </Companion>
          </CompanionAds>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		expect(result.ads[0].creatives[0].companionAds).toBeUndefined();
	});

	it("returns undefined companionAds when no CompanionAds element", () => {
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="ad-none">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>No Companion</AdTitle>
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
		expect(result.ads[0].creatives[0].companionAds).toBeUndefined();
	});

	it("parses multiple companions", () => {
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="ad-multi-comp">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>Multi Companion</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative>
          <CompanionAds required="any">
            <Companion width="300" height="250">
              <StaticResource creativeType="image/png"><![CDATA[http://example.com/banner1.png]]></StaticResource>
            </Companion>
            <Companion width="728" height="90">
              <StaticResource creativeType="image/png"><![CDATA[http://example.com/banner2.png]]></StaticResource>
            </Companion>
          </CompanionAds>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		const companionAds = result.ads[0].creatives[0].companionAds!;
		expect(companionAds.required).toBe("any");
		expect(companionAds.companions).toHaveLength(2);
		expect(companionAds.companions[0].width).toBe(300);
		expect(companionAds.companions[0].height).toBe(250);
		expect(companionAds.companions[1].width).toBe(728);
		expect(companionAds.companions[1].height).toBe(90);
	});

	it("ignores non-creativeView tracking events for companions", () => {
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="ad-track">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>Tracking Test</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative>
          <CompanionAds>
            <Companion width="300" height="250">
              <StaticResource creativeType="image/png"><![CDATA[http://example.com/img.png]]></StaticResource>
              <TrackingEvents>
                <Tracking event="creativeView"><![CDATA[http://example.com/view]]></Tracking>
                <Tracking event="start"><![CDATA[http://example.com/start]]></Tracking>
              </TrackingEvents>
            </Companion>
          </CompanionAds>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		const comp = result.ads[0].creatives[0].companionAds!.companions[0];
		expect(comp.trackingEvents.creativeView).toEqual([
			"http://example.com/view",
		]);
		expect(Object.keys(comp.trackingEvents)).toEqual(["creativeView"]);
	});

	it("parses creative with both Linear and CompanionAds", () => {
		const result = parseVast(COMPANION_VAST);
		const creative = result.ads[0].creatives[0];
		expect(creative.linear).not.toBeNull();
		expect(creative.linear!.duration).toBe(30);
		expect(creative.companionAds).toBeDefined();
		expect(creative.companionAds!.companions).toHaveLength(1);
	});

	it("parses renderingMode end-card", () => {
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="ad-endcard">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>End Card</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative>
          <CompanionAds>
            <Companion width="320" height="480" renderingMode="end-card">
              <StaticResource creativeType="image/png"><![CDATA[http://example.com/endcard.png]]></StaticResource>
            </Companion>
          </CompanionAds>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		const comp = result.ads[0].creatives[0].companionAds!.companions[0];
		expect(comp.renderingMode).toBe("end-card");
	});

	it("leaves renderingMode undefined when not specified", () => {
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="ad-nomode">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>No Mode</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative>
          <CompanionAds>
            <Companion width="300" height="250">
              <StaticResource creativeType="image/png"><![CDATA[http://example.com/img.png]]></StaticResource>
            </Companion>
          </CompanionAds>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		const comp = result.ads[0].creatives[0].companionAds!.companions[0];
		expect(comp.renderingMode).toBeUndefined();
	});
});

const NONLINEAR_VAST = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="ad-nl">
    <InLine>
      <AdSystem>TestAdServer</AdSystem>
      <AdTitle>NonLinear Ad</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative id="c1">
          <NonLinearAds>
            <TrackingEvents>
              <Tracking event="creativeView"><![CDATA[http://example.com/nlview]]></Tracking>
              <Tracking event="acceptInvitation"><![CDATA[http://example.com/accept]]></Tracking>
              <Tracking event="close"><![CDATA[http://example.com/close]]></Tracking>
            </TrackingEvents>
            <NonLinear width="468" height="60" id="nl-1" minSuggestedDuration="00:00:15"
                       scalable="true" maintainAspectRatio="true"
                       expandedWidth="800" expandedHeight="600" apiFramework="VPAID">
              <StaticResource creativeType="image/png"><![CDATA[http://example.com/overlay.png]]></StaticResource>
              <NonLinearClickThrough><![CDATA[http://example.com/click]]></NonLinearClickThrough>
              <NonLinearClickTracking><![CDATA[http://example.com/track-click]]></NonLinearClickTracking>
              <AdParameters><![CDATA[param=value]]></AdParameters>
            </NonLinear>
          </NonLinearAds>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;

describe("parseVast — NonLinearAds", () => {
	it("parses a NonLinear with StaticResource and all attributes", () => {
		const result = parseVast(NONLINEAR_VAST);
		const creative = result.ads[0].creatives[0];
		expect(creative.nonLinearAds).toBeDefined();
		expect(creative.nonLinearAds!.nonLinears).toHaveLength(1);

		const nl = creative.nonLinearAds!.nonLinears[0];
		expect(nl.width).toBe(468);
		expect(nl.height).toBe(60);
		expect(nl.id).toBe("nl-1");
		expect(nl.expandedWidth).toBe(800);
		expect(nl.expandedHeight).toBe(600);
		expect(nl.scalable).toBe(true);
		expect(nl.maintainAspectRatio).toBe(true);
		expect(nl.minSuggestedDuration).toBe(15);
		expect(nl.apiFramework).toBe("VPAID");
		expect(nl.resources).toHaveLength(1);
		expect(nl.resources[0]).toEqual({
			type: "static",
			url: "http://example.com/overlay.png",
			creativeType: "image/png",
		});
		expect(nl.clickThrough).toBe("http://example.com/click");
		expect(nl.clickTracking).toEqual(["http://example.com/track-click"]);
		expect(nl.adParameters).toBe("param=value");
	});

	it("parses container-level tracking events", () => {
		const result = parseVast(NONLINEAR_VAST);
		const nlAds = result.ads[0].creatives[0].nonLinearAds!;
		expect(nlAds.trackingEvents).toEqual({
			creativeView: ["http://example.com/nlview"],
			acceptInvitation: ["http://example.com/accept"],
			close: ["http://example.com/close"],
		});
	});

	it("parses all three resource types", () => {
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="ad-multi">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>Multi Resource</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative>
          <NonLinearAds>
            <NonLinear width="468" height="60">
              <StaticResource creativeType="image/jpeg"><![CDATA[http://example.com/img.jpg]]></StaticResource>
              <IFrameResource><![CDATA[http://example.com/iframe.html]]></IFrameResource>
              <HTMLResource><![CDATA[<div>Hello</div>]]></HTMLResource>
            </NonLinear>
          </NonLinearAds>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		const nl = result.ads[0].creatives[0].nonLinearAds!.nonLinears[0];
		expect(nl.resources).toHaveLength(3);
		expect(nl.resources[0]).toEqual({
			type: "static",
			url: "http://example.com/img.jpg",
			creativeType: "image/jpeg",
		});
		expect(nl.resources[1]).toEqual({
			type: "iframe",
			url: "http://example.com/iframe.html",
		});
		expect(nl.resources[2]).toEqual({
			type: "html",
			content: "<div>Hello</div>",
		});
	});

	it("parses minSuggestedDuration to seconds", () => {
		const result = parseVast(NONLINEAR_VAST);
		const nl = result.ads[0].creatives[0].nonLinearAds!.nonLinears[0];
		expect(nl.minSuggestedDuration).toBe(15);
	});

	it("parses scalable and maintainAspectRatio booleans", () => {
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="ad-bool">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>Bool Test</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative>
          <NonLinearAds>
            <NonLinear width="468" height="60" scalable="false" maintainAspectRatio="false">
              <StaticResource creativeType="image/png"><![CDATA[http://example.com/img.png]]></StaticResource>
            </NonLinear>
          </NonLinearAds>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		const nl = result.ads[0].creatives[0].nonLinearAds!.nonLinears[0];
		expect(nl.scalable).toBe(false);
		expect(nl.maintainAspectRatio).toBe(false);
	});

	it("leaves scalable and maintainAspectRatio undefined when not specified", () => {
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="ad-noattr">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>No Attr</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative>
          <NonLinearAds>
            <NonLinear width="468" height="60">
              <StaticResource creativeType="image/png"><![CDATA[http://example.com/img.png]]></StaticResource>
            </NonLinear>
          </NonLinearAds>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		const nl = result.ads[0].creatives[0].nonLinearAds!.nonLinears[0];
		expect(nl.scalable).toBeUndefined();
		expect(nl.maintainAspectRatio).toBeUndefined();
	});

	it("skips NonLinear without width or height", () => {
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="ad-skip">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>Skip Test</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative>
          <NonLinearAds>
            <NonLinear height="60">
              <StaticResource creativeType="image/png"><![CDATA[http://example.com/img.png]]></StaticResource>
            </NonLinear>
          </NonLinearAds>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		expect(result.ads[0].creatives[0].nonLinearAds).toBeUndefined();
	});

	it("returns undefined nonLinearAds when no NonLinearAds element", () => {
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="ad-none">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>No NonLinear</AdTitle>
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
		expect(result.ads[0].creatives[0].nonLinearAds).toBeUndefined();
	});

	it("parses multiple NonLinear elements", () => {
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="ad-multi-nl">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>Multi NonLinear</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative>
          <NonLinearAds>
            <NonLinear width="468" height="60">
              <StaticResource creativeType="image/png"><![CDATA[http://example.com/overlay1.png]]></StaticResource>
            </NonLinear>
            <NonLinear width="728" height="90">
              <StaticResource creativeType="image/png"><![CDATA[http://example.com/overlay2.png]]></StaticResource>
            </NonLinear>
          </NonLinearAds>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		const nlAds = result.ads[0].creatives[0].nonLinearAds!;
		expect(nlAds.nonLinears).toHaveLength(2);
		expect(nlAds.nonLinears[0].width).toBe(468);
		expect(nlAds.nonLinears[0].height).toBe(60);
		expect(nlAds.nonLinears[1].width).toBe(728);
		expect(nlAds.nonLinears[1].height).toBe(90);
	});

	it("parses creative with Linear, CompanionAds, and NonLinearAds", () => {
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="ad-all">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>All Types</AdTitle>
      <Impression><![CDATA[http://example.com/imp]]></Impression>
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:30</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="640" height="360">
                <![CDATA[http://example.com/ad.mp4]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
          <CompanionAds required="all">
            <Companion width="300" height="250">
              <StaticResource creativeType="image/png"><![CDATA[http://example.com/banner.png]]></StaticResource>
            </Companion>
          </CompanionAds>
          <NonLinearAds>
            <NonLinear width="468" height="60">
              <StaticResource creativeType="image/png"><![CDATA[http://example.com/overlay.png]]></StaticResource>
            </NonLinear>
          </NonLinearAds>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
		const result = parseVast(xml);
		const creative = result.ads[0].creatives[0];
		expect(creative.linear).not.toBeNull();
		expect(creative.linear!.duration).toBe(30);
		expect(creative.companionAds).toBeDefined();
		expect(creative.companionAds!.companions).toHaveLength(1);
		expect(creative.nonLinearAds).toBeDefined();
		expect(creative.nonLinearAds!.nonLinears).toHaveLength(1);
	});
});
