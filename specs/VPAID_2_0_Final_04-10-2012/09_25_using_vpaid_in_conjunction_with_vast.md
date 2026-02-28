## 2.5 Using VPAID in Conjunction with VAST

Where possible, VPAID should be sent to the video player in a VAST ad response. This section provides information about how VAST and VPAID work together.

### 2.5.1 API Framework

When a VPAID ad unit is referenced from a VAST document, the value for the `apiFramework` attribute in the `<MediaFile>` element must be VPAID (all caps). This attribute identifies the VPAID API for the creative. Version information should be handled by the VPAID `handshakeVersion()` call (rather than identified in the VAST file). See Section 3.1.1 for more information.

### 2.5.2 How to Initialize the VPAID Ad Unit

When using VAST, the only way to pass information from VAST into a VPAID ad unit is using the `<AdParameters>` elements in VAST.

Linear and nonlinear VPAID ad units are loaded in a VAST context using the VPAID `initAd()` method. Depending on the ad unit's linearity, the `creativeData` parameter in this method must be set to accept `<AdParameters>` value from either the `<Linear>` or the `<NonLinear>` element from the VAST document. In VAST, the `<AdParameters>` value may be wrapped in a CDATA block but the ad unit may have trouble processing the `]>` string used to close a CDATA block.

To identify the platform used to implement the ad unit (i.e. MIME types such as application/x-shockwave-flash or application/javascript), use the `type` attribute on the `<MediaFile>` element in VAST if it's a linear creative. For a nonlinear creative, if using `StaticResource` then use the `creativeType` attribute, if using HTMLResource, the implication is that the creative is javascript. If two or more technology platforms are provided through multiple media files, the video player should use the one closest to its own technology.

In the `initAd()` function call, the `environmentVars` function parameter is optional. It should be used when certain information is unavailable as the VPAID ad unit is requested, but made known as the VPAID ad unit loads.

### 2.5.3 How to handle event tracking

When a VPAID ad unit is sent to the video player in a VAST response, the video player may receive VPAID events from the ad unit. In this situation, the video player should send requests to the tracking URI(s) in the VAST response for the VAST event that corresponds to the VPAID event.

For example, if the video player received the VPAID event `AdVideoStart`, and there was a tracking URI in the VAST response for the corresponding VAST event `"start"`, then the video player should send a request to VAST tracking URI. Note that some VPAID events do not have corresponding VAST events, such as the `AdLinearChange` event.

Duplicate events may be recorded if the VPAID ad unit sends tracking requests to the event tracking URIs while also dispatching VPAID events to the video player because the video player may also send tracking requests to the same event URIs.

Table 2.5.3 below shows the correspondence between VPAID events and VAST events. When served in a VAST response, VPAID events in the left column of the table should trigger the corresponding VAST event (if any) in the column on the right.

| Receive VPAID event... | ...triggers VAST TrackingEvent |
|---|---|
| AdLoaded | - |
| AdSkipped | skip |
| AdStarted | creativeView |
| AdStopped | - |
| AdLinearChange | - |
| AdExpandedChange | - |
| AdRemainingTimeChange | - |
| AdVolumeChange | if {currentVolume==0 and lastVolume>0} then mute if {currentVolume>0 and lastVolume==0} then unmute |
| AdImpression | \<Impression\> (the VAST element; not an event type) |
| AdVideoStart, AdVideoFirstQuartile, AdVideoMidpoint, AdVideoThirdQuartile, AdVideoComplete | start, firstQuartile, midpoint, thirdQuartile, complete |
| AdClickThru | \<ClickTracking\> (ClickTracking is a VAST element under \<VideoClicks\>, not an event type) |
| AdInteraction | - |
| AdUserAcceptInvitation, | acceptInvitation, |
| AdUserMinimize, | collapse, |
| AdUserClose | close |
| AdPaused, | pause, |
| AdPlaying | resume |
| AdLog | |
| AdError | error (with error code 901, as noted in VAST 3.0) |

**Table 2.5.3: VPAID/VAST Tracking Event Map**

### 2.5.4 How to handle VPAID clicks in VAST context

The following logic determines how the video player should respond to clicks:

- The `event.data.url` is optional
- If `event.data.playerHandles` is true and e.data.url is:
  - a. Not defined: then the video player must use the VAST element, `<VideoClicks>/<ClickThrough>`.
  - b. Defined: then the video player must use `event.data.url`.
- If `event.data.playerHandles` is false, then the video player doesn't open the landing page URL. The ad unit is responsible for opening the landing page URL in a new window in this case.

**Note:** Regardless of the state of the `event.data.handles`, the video player must request the resource specified by the URIs in the `<VideoClicks>` and `<ClickTracking>` elements of VAST when it receives an `AdClickThru` VPAID event.

### 2.5.5 How to Interpret the VAST Linear/Duration Element

VAST doesn't support interactive ad properties like the variable duration supported in VPAID ad units that can change in response to user interaction. When a VPAID ad unit has variable duration, the `Linear/Duration` element in VAST should be identified as the duration of the interactive ad unit before any user interaction.

- In VPAID 1.0, the value of `Linear/Duration` element in VAST should use the value of the VPAID property, `adRemainingTime`, collected at the time of the `AdStarted` event (before user interaction).
- In VPAID 2.0, use the VPAID property, `adDuration`, instead.