import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import type { Player } from "../../src/types.js";
import { vast } from "../../src/vast/index.js";
import * as tracker from "../../src/vast/tracker.js";

// Mock fetchVast to avoid network calls
vi.mock("../../src/vast/parser.js", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("../../src/vast/parser.js")>();
	return {
		...actual,
		fetchVast: vi.fn(),
	};
});

import { fetchVast } from "../../src/vast/parser.js";

const mockedFetchVast = fetchVast as Mock;

// Minimal VAST XML with all tracking events and click data
function makeVastXml(
	opts: {
		skipOffset?: number;
		clickThrough?: string;
		clickTracking?: string[];
	} = {},
): string {
	const skipAttr =
		opts.skipOffset !== undefined
			? ` skipoffset="${formatTime(opts.skipOffset)}"`
			: "";
	const clickThrough = opts.clickThrough ?? "https://example.com/landing";
	const clickTrackingTags = (
		opts.clickTracking ?? ["https://example.com/click-track"]
	)
		.map((u) => `<ClickTracking><![CDATA[${u}]]></ClickTracking>`)
		.join("");

	return `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.1">
  <Ad id="ad-1">
    <InLine>
      <AdSystem>Test</AdSystem>
      <AdTitle>Test Ad</AdTitle>
      <Impression><![CDATA[https://example.com/impression]]></Impression>
      <Creatives>
        <Creative>
          <Linear${skipAttr}>
            <Duration>00:00:30</Duration>
            <TrackingEvents>
              <Tracking event="start"><![CDATA[https://example.com/start]]></Tracking>
              <Tracking event="firstQuartile"><![CDATA[https://example.com/firstQuartile]]></Tracking>
              <Tracking event="midpoint"><![CDATA[https://example.com/midpoint]]></Tracking>
              <Tracking event="thirdQuartile"><![CDATA[https://example.com/thirdQuartile]]></Tracking>
              <Tracking event="complete"><![CDATA[https://example.com/complete]]></Tracking>
              <Tracking event="pause"><![CDATA[https://example.com/pause]]></Tracking>
              <Tracking event="resume"><![CDATA[https://example.com/resume]]></Tracking>
              <Tracking event="skip"><![CDATA[https://example.com/skip]]></Tracking>
            </TrackingEvents>
            <VideoClicks>
              <ClickThrough><![CDATA[${clickThrough}]]></ClickThrough>
              ${clickTrackingTags}
            </VideoClicks>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="640" height="360" bitrate="500">
                <![CDATA[https://example.com/ad.mp4]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
}

function formatTime(seconds: number): string {
	const h = Math.floor(seconds / 3600)
		.toString()
		.padStart(2, "0");
	const m = Math.floor((seconds % 3600) / 60)
		.toString()
		.padStart(2, "0");
	const s = (seconds % 60).toString().padStart(2, "0");
	return `${h}:${m}:${s}`;
}

/** Stub jsdom's unimplemented media methods. */
function stubMediaMethods(el: HTMLVideoElement): void {
	el.play = vi.fn().mockResolvedValue(undefined);
	el.pause = vi.fn();
	el.load = vi.fn();
}

/** Set up a player that is in "ready" state with a parent container. */
function setupPlayer(): {
	player: Player;
	el: HTMLVideoElement;
	container: HTMLDivElement;
} {
	const container = document.createElement("div");
	const el = document.createElement("video");
	stubMediaMethods(el);
	container.appendChild(el);
	document.body.appendChild(container);

	const player = createPlayer(el);
	// Drive to ready state
	el.dispatchEvent(new Event("loadstart"));
	el.dispatchEvent(new Event("canplay"));
	return { player, el, container };
}

/** Trigger ad load and canplay so the plugin reaches ad:playing state. */
function triggerAdPlaying(el: HTMLVideoElement): void {
	el.dispatchEvent(new Event("canplay"));
}

describe("vast plugin — ad:click", () => {
	let trackSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		trackSpy = vi.spyOn(tracker, "track");
		vi.stubGlobal("navigator", { sendBeacon: vi.fn() });
	});

	it("emits ad:click with clickThrough and fires clickTracking on video click", async () => {
		const { player, el, container } = setupPlayer();
		mockedFetchVast.mockResolvedValueOnce(makeVastXml());

		const clickHandler = vi.fn();
		player.on("ad:click", clickHandler);

		player.use(vast({ tagUrl: "https://example.com/vast.xml" }));
		await vi.waitFor(() => expect(player.state).toBe("ad:loading"));
		triggerAdPlaying(el);
		await vi.waitFor(() => expect(player.state).toBe("ad:playing"));

		el.click();

		expect(trackSpy).toHaveBeenCalledWith(["https://example.com/click-track"]);
		expect(clickHandler).toHaveBeenCalledWith({
			clickThrough: "https://example.com/landing",
			clickTracking: ["https://example.com/click-track"],
		});

		player.destroy();
		container.remove();
		vi.restoreAllMocks();
	});

	it("emits ad:click with undefined clickThrough when absent", async () => {
		const { player, el, container } = setupPlayer();
		const xml = makeVastXml({ clickThrough: "" });
		mockedFetchVast.mockResolvedValueOnce(
			xml.replace(/<ClickThrough><!\[CDATA\[\]\]><\/ClickThrough>/, ""),
		);

		const clickHandler = vi.fn();
		player.on("ad:click", clickHandler);

		player.use(vast({ tagUrl: "https://example.com/vast.xml" }));
		await vi.waitFor(() => expect(player.state).toBe("ad:loading"));
		triggerAdPlaying(el);
		await vi.waitFor(() => expect(player.state).toBe("ad:playing"));

		el.click();

		expect(clickHandler).toHaveBeenCalledWith({
			clickThrough: undefined,
			clickTracking: ["https://example.com/click-track"],
		});

		player.destroy();
		container.remove();
		vi.restoreAllMocks();
	});

	it("does not emit ad:click after ad has ended", async () => {
		const { player, el, container } = setupPlayer();
		mockedFetchVast.mockResolvedValueOnce(makeVastXml());

		const clickHandler = vi.fn();
		player.on("ad:click", clickHandler);

		player.use(vast({ tagUrl: "https://example.com/vast.xml" }));
		await vi.waitFor(() => expect(player.state).toBe("ad:loading"));
		triggerAdPlaying(el);
		await vi.waitFor(() => expect(player.state).toBe("ad:playing"));

		el.dispatchEvent(new Event("ended"));

		el.click();
		expect(clickHandler).not.toHaveBeenCalled();

		player.destroy();
		container.remove();
		vi.restoreAllMocks();
	});
});

describe("vast plugin — pause/resume tracking", () => {
	let trackSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		trackSpy = vi.spyOn(tracker, "track");
		vi.stubGlobal("navigator", { sendBeacon: vi.fn() });
	});

	it("fires pause tracking when ad is paused", async () => {
		const { player, el, container } = setupPlayer();
		mockedFetchVast.mockResolvedValueOnce(makeVastXml());

		player.use(vast({ tagUrl: "https://example.com/vast.xml" }));
		await vi.waitFor(() => expect(player.state).toBe("ad:loading"));
		triggerAdPlaying(el);
		await vi.waitFor(() => expect(player.state).toBe("ad:playing"));

		trackSpy.mockClear();
		el.dispatchEvent(new Event("pause"));

		expect(trackSpy).toHaveBeenCalledWith(["https://example.com/pause"]);
		expect(player.state).toBe("ad:paused");

		player.destroy();
		container.remove();
		vi.restoreAllMocks();
	});

	it("fires resume tracking when ad resumes", async () => {
		const { player, el, container } = setupPlayer();
		mockedFetchVast.mockResolvedValueOnce(makeVastXml());

		player.use(vast({ tagUrl: "https://example.com/vast.xml" }));
		await vi.waitFor(() => expect(player.state).toBe("ad:loading"));
		triggerAdPlaying(el);
		await vi.waitFor(() => expect(player.state).toBe("ad:playing"));

		// Pause first
		el.dispatchEvent(new Event("pause"));
		expect(player.state).toBe("ad:paused");

		trackSpy.mockClear();
		el.dispatchEvent(new Event("play"));

		expect(trackSpy).toHaveBeenCalledWith(["https://example.com/resume"]);
		expect(player.state).toBe("ad:playing");

		player.destroy();
		container.remove();
		vi.restoreAllMocks();
	});

	it("does not fire pause tracking after ad has ended", async () => {
		const { player, el, container } = setupPlayer();
		mockedFetchVast.mockResolvedValueOnce(makeVastXml());

		player.use(vast({ tagUrl: "https://example.com/vast.xml" }));
		await vi.waitFor(() => expect(player.state).toBe("ad:loading"));
		triggerAdPlaying(el);
		await vi.waitFor(() => expect(player.state).toBe("ad:playing"));

		el.dispatchEvent(new Event("ended"));
		trackSpy.mockClear();

		// This pause is from content restoration, not the ad
		el.dispatchEvent(new Event("pause"));
		expect(trackSpy).not.toHaveBeenCalledWith(["https://example.com/pause"]);

		player.destroy();
		container.remove();
		vi.restoreAllMocks();
	});
});

describe("vast plugin — ad:skip", () => {
	let trackSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		trackSpy = vi.spyOn(tracker, "track");
		vi.stubGlobal("navigator", { sendBeacon: vi.fn() });
	});

	it("fires skip tracking and ends ad on ad:skip event", async () => {
		const { player, el, container } = setupPlayer();
		mockedFetchVast.mockResolvedValueOnce(makeVastXml({ skipOffset: 5 }));

		const endHandler = vi.fn();
		player.on("ad:end", endHandler);

		player.use(vast({ tagUrl: "https://example.com/vast.xml" }));
		await vi.waitFor(() => expect(player.state).toBe("ad:loading"));
		triggerAdPlaying(el);
		await vi.waitFor(() => expect(player.state).toBe("ad:playing"));

		trackSpy.mockClear();
		player.emit("ad:skip", { adId: "ad-1" });

		expect(trackSpy).toHaveBeenCalledWith(["https://example.com/skip"]);
		expect(endHandler).toHaveBeenCalledWith({ adId: "ad-1" });

		player.destroy();
		container.remove();
		vi.restoreAllMocks();
	});

	it("does not fire skip tracking after ad has ended", async () => {
		const { player, el, container } = setupPlayer();
		mockedFetchVast.mockResolvedValueOnce(makeVastXml({ skipOffset: 5 }));

		player.use(vast({ tagUrl: "https://example.com/vast.xml" }));
		await vi.waitFor(() => expect(player.state).toBe("ad:loading"));
		triggerAdPlaying(el);
		await vi.waitFor(() => expect(player.state).toBe("ad:playing"));

		el.dispatchEvent(new Event("ended"));
		trackSpy.mockClear();

		player.emit("ad:skip", { adId: "ad-1" });
		expect(trackSpy).not.toHaveBeenCalledWith(["https://example.com/skip"]);

		player.destroy();
		container.remove();
		vi.restoreAllMocks();
	});
});

describe("vast plugin — content restoration after ad", () => {
	beforeEach(() => {
		vi.spyOn(tracker, "track");
		vi.stubGlobal("navigator", { sendBeacon: vi.fn() });
	});

	it("transitions to playing state after pause→ended sequence (browser behavior)", async () => {
		const { player, el, container } = setupPlayer();
		mockedFetchVast.mockResolvedValueOnce(makeVastXml());

		player.use(vast({ tagUrl: "https://example.com/vast.xml" }));
		await vi.waitFor(() => expect(player.state).toBe("ad:loading"));
		triggerAdPlaying(el);
		await vi.waitFor(() => expect(player.state).toBe("ad:playing"));

		// Browser fires pause before ended
		el.dispatchEvent(new Event("pause"));
		expect(player.state).toBe("ad:paused");

		el.dispatchEvent(new Event("ended"));
		expect(player.state).toBe("playing");

		player.destroy();
		container.remove();
		vi.restoreAllMocks();
	});

	it("transitions to playing state when ended fires without prior pause", async () => {
		const { player, el, container } = setupPlayer();
		mockedFetchVast.mockResolvedValueOnce(makeVastXml());

		player.use(vast({ tagUrl: "https://example.com/vast.xml" }));
		await vi.waitFor(() => expect(player.state).toBe("ad:loading"));
		triggerAdPlaying(el);
		await vi.waitFor(() => expect(player.state).toBe("ad:playing"));

		el.dispatchEvent(new Event("ended"));
		expect(player.state).toBe("playing");

		player.destroy();
		container.remove();
		vi.restoreAllMocks();
	});
});

describe("vast plugin — ad error recovery", () => {
	beforeEach(() => {
		vi.spyOn(tracker, "track");
		vi.stubGlobal("navigator", { sendBeacon: vi.fn() });
	});

	it("restores content and emits ad:end on media error", async () => {
		const { player, el, container } = setupPlayer();
		mockedFetchVast.mockResolvedValueOnce(makeVastXml());

		const errorHandler = vi.fn();
		const endHandler = vi.fn();
		player.on("ad:error", errorHandler);
		player.on("ad:end", endHandler);

		player.use(vast({ tagUrl: "https://example.com/vast.xml" }));
		await vi.waitFor(() => expect(player.state).toBe("ad:loading"));
		triggerAdPlaying(el);
		await vi.waitFor(() => expect(player.state).toBe("ad:playing"));

		el.dispatchEvent(new Event("error"));

		expect(errorHandler).toHaveBeenCalled();
		expect(endHandler).toHaveBeenCalledWith({ adId: "ad-1" });

		player.destroy();
		container.remove();
		vi.restoreAllMocks();
	});
});
