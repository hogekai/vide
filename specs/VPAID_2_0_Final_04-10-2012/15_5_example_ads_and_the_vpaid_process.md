## 5 Example Ads and the VPAID Process

To show how VPAID works in different video ad types, we've represented the VPAID process for four common ad types:

- Clickable Pre-Roll
- Companion Banner (achieved without VPAID)
- Overlay Banner
- Overlay Banner with Click-to-Linear Video Ad

### 5.1 Clickable Pre-Roll

[Figure: A clickable pre-roll ad example showing a movie advertisement with silhouettes of people against a sunset/orange background. The ad displays the text "Mouse over for more information" at the top and "See the Movie!" in stylized text at the bottom.]

Clickable pre-roll ads are used to enable an interactive overlay for a video ad served in advance of video content. In a clickable pre-roll ad, the viewer can interact with the overlay image or text and ultimately be redirected to the advertiser's specified webpage.

**VPAID Process for a Clickable Pre-Roll Ad:**

1. Video player calls handshakeVersion("2.0").
   a. Ad unit returns "2.0."
2. Video player calls initAd(500, 400, "normal", 500).
   a. Ad unit loads and returns `AdLoaded`.
3. Video player calls `startAd()`.
   a. Ad unit starts ad display and returns `AdStarted`.
4. Video player gets `adLinear`.
   a. Video player sees that the value is `true`.
   b. Video player delays loading/displaying content video.
5. Video player gets `adDuration`, sets `adVolume`, manages playback with calls to `pauseAd()`, `resumeAd()`, `resizeAd()`, etc. \*
   a. Ad unit responds appropriately to each call.
   b. When ad play is complete, ad unit sends `AdStopped`.
6. Video player buffers and plays content video.

\* Without VPAID, the interactivity offered in step 5 is only possible with a custom solution. The `adDuration` property in VPAID supports variable duration resulting from interaction. The `resizeAd()` method ensures predictable ad size scaling. And the set `adVolume` property enables control over ad volume.

### 5.2 Companion Banner

[Figure: A companion banner ad example showing the same movie advertisement with silhouettes against a sunset/orange background, with "See the Movie!" text. Below the video player area is a companion banner showing a smaller version of the same ad creative.]

The companion ad format is used with linear ads to provide an interactive ad outside the video player (shown below the video player in the example to the right).

The companion banner information can be provided either in the initial VAST response, or by using the VPAID `adCompanions()` property. See section 3.2.9 for more information.

### 5.3 Overlay Banner

[Figure: An overlay banner ad example showing a semi-transparent banner overlaid on top of content video during playback. The banner displays the movie advertisement creative with the sunset/silhouette imagery.]

An overlay banner is an ad that displays over content video during video playback. The video player may control the designated ad display area dimensions, position and display timing.

**VPAID Process for Overlay Banners:**

1. Video player calls handshakeVersion("2.0").
   a. Ad unit returns "2.0."
2. Video player calls initAd(500, 400, "normal", 500).
   a. Ad unit loads and returns `AdLoaded`.
3. Video player calls `startAd()`.
   a. Ad unit starts ad display and returns `AdStarted`.
4. Video player gets `adLinear`.
   a. Video player sees that the value is `false`.
   b. Video player begins loading/displaying content video.
   c. Video player may begin playing content video when ready.
5. Video player calls `stopAd()` when ad display time has elapsed.
   a. Ad unit stops ad play, cleans up resources and responds with `AdStopped`.
6. Content video continues to play.

Without VPAID, the overlay banner can be executed using a non-linear ad with defined duration in which the video player defines ad position. However, interaction is limited unless VPAID or some custom solution for the ad unit and video player is implemented. The example below shows how VPAID enables interactivity for the overlay banner.

### 5.4 Overlay Banner with Click-to-Linear Video Ad

VPAID enables a rich, interactive experience in video overlay banners. As in the standard overlay example on the previous page, the ad displays over the content video while the content video is playing. However, VPAID enables the video player to stop its video content playback when a viewer clicks the ad so that the ad unit can initiate a linear video ad or expand for a broader engagement opportunity. When the linear ad or expanded portion has completed, the content video resumes playback.

[Figure: An overlay banner with click-to-linear video ad example showing the movie advertisement creative overlaid on content video, with an interactive element allowing the viewer to click to expand into a full linear video ad.]

**VPAID Process for a Click-to-Linear Video Ad:**

1. Video player calls handshakeVersion("2.0").
   a. Ad unit returns "2.0."
2. Video player calls initAd(500, 400, "normal", 500).
   a. Ad unit loads and returns `AdLoaded`.
3. Video player calls `startAd()`.
   a. Ad unit starts ad display and returns `AdStarted`.
4. Video player gets `adLinear`.
   a. Video player sees that the value is `false`.
   b. Video player delays loading content video.
5. If viewer clicks to expand the ad:
   a. Ad unit sets `adLinear = true` and sends `AdLinearChange`.
   b. Ad may set `adExpanded = true` and send `AdExpandedChange`.
   c. Ad sends `AdInteraction`.
   d. Video player pauses content video.
   e. The video ad plays and completes.
   f. Ad unit sets adExpanded = false and sends `AdExpandedChange`.
   g. Ad unit sets `adLinear = false` and sends `AdLinearChange`.
   h. Video player continues content video playback
6. Video player calls `stopAd()` when ad display time has elapsed.
   a. Ad unit sends `AdStopped`.
   b. Video player continues content video playback.

Without VPAID (or a custom solution), this interaction is not possible. Other interactions, such expanding the ad upon click and variable duration dependent on interaction, are also enabled with VPAID. Creative video ad development is encouraged with VPAID as long as guidelines are respected along with other applicable digital video guidelines listed on page 7.