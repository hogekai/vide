## 3.13 CompanionAds

TOC Schema

Companion Ads are secondary ads included in the VAST tag that accompany the video/audio ad. The `<CompanionAds>` element is a container for one or more `<Companion>` elements, where each Companion element provides the creative files and tracking details. Companion Ads, including any creative, may be included in both InLine and Wrapper formatted VAST ads.

The `required` attribute for the `<CompanionAds>` element provides information about which Companion creative to display when multiple Companions are supplied and whether the ad can be displayed without its Companion creative. The value for `required` can be one of three values: all, any, or none.

The expected behavior for displaying Companion ads depends on the following values:

- **all:** the media player must attempt to display the contents for all `<Companion>` elements provided. If all companion creative cannot be displayed, the ad should be disregarded and the ad server should be notified using the `<Error>` element.
- **any:** the media player must attempt to display content from at least one of the `<Companion>` elements provided (i.e. display the one with dimensions that best fit the page). If none of the companion creative can be displayed, the ad should be disregarded and the ad server should be notified using the `<Error>` element.
- **none:** the media player may choose to not display any of the companion creative, but is not restricted from doing so. The ad server may use this option when the advertiser prefers that the master Linear or NonLinear ad be displayed even if the companion cannot be displayed.

If not provided, the media player can choose to display content from any or none of the `<Companion>` elements.

VAST 4.1 includes a new attribute for companions: *renderingMode*.

Previous versions of VAST did not allow for the ad server to specify how and when companions would be shown. An asset and width/height information were included, and the assumption was that the companion would be shown alongside the video as a banner. This usage of companions has dropped out of favor over time, while a new usage of the companion as an asset to be displayed full-screen after the video has gained favor in mobile in-app inventory. The renderingMode attribute accommodates the newer end-card use case as part of VAST while laying the groundwork for additional uses of the companion.

The renderingMode attribute accepts a few values. The publisher player/SDK has control of which of these renderingMode values are supported and this should be communicated as part of the publisher ad format specs.

### Companion as End-Card

A value of "end-card" signals to the player that this companion ad is meant to be shown after the video stops playing. The end-card should match the dimensions of the preceding video. If the companion width and height are not zero, the player may use these values to infer the aspect ratio of the companion ad.

Companion duration is a new consideration for the end-card and assumed to be controlled by the publisher player/SDK and communicated as part of the publisher ad format specs. Known variations in market include an "infinite" duration, which requires the viewer to close the end-card after it is shown, and a timed duration. For any companion that suspends content playback, such as an in-stream ad, and does not include a time-out, the player/SDK must implement a close control to prevent users from being trapped in the ad. For out-stream ads that do not interfere with content, the close control is not mandatory.

It is also up to the publisher whether a skippable video should show an associated end-card when the video is skipped. Most implementations by major mobile SDKs currently do so.

Click-throughs triggered from the companion should make sure to open in a new browser window rather than replacing the existing end card or another window needed by the app. This ensures that the consumer can exit the webpage that's loaded upon clicking through the ad and to make sure that the app experience isn't disrupted.

The VAST event of closeLinear must be fired upon the companion closing. This allows for ads that use companions to know when the companion was dismissed.

Companies providing the end card creative should adhere to IAB Tech Lab LEAN guidelines.

### Companion as Concurrent Display Ad

A value of "concurrent" signals to the player that this companion ad is meant to be shown alongside the video for the duration of the video playback. This reflects the original use of the companion in desktop inventory.

### Additional Creative Uses of the Companion Ad

The companion ad may be used for new implementations, and as such new values of the renderingMode attribute may be used if supported by the publisher and the ad server. The renderingMode may use other values other than the ones listed to support these additional use cases.

For example, proprietary formats that show content alongside a video could be supported by the standard with a "split-screen" renderingMode, displaying a 1:1 aspect ratio video, alongside an equal sized companion in both portrait and landscape mode.

The goal is that renderingMode will provide some initial standards support for format innovation in environments that cannot, or will not, support VPAID with future spec changes to follow market developments.

### Default or Empty renderingMode

The renderingMode attribute may be omitted. In this case, the player will assume that the renderingMode value is set as "default" and will handle the companion in whatever way it does by default.

### Non-Creative Use of the Companion Ad

The companion is intended to be used as an additional creative element. Inclusion of a companion to support non-creative functionality (e.g. additional tracking) is considered to be contrary to the intention of the spec.

| Player Support | Optional |
|---|---|
| Required in Response | No |
| Parent | Creative for both InLine and Wrapper formats |
| Bounded | 0-1 |
| Sub-elements | Companion |
| **Attributes** | **Description** |
| **required** | Accepts one of the following values: "all" "any" or "none." See descriptions listed in this section. |