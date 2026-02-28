the video player, the webpage, or other ads, display over a video ad that is currently in progress.

Also, since video ad creative are expected to adhere to industry guidelines that include a "Close X" button, the video player should not include its own close button for VPAID ad units.

### 2.3.2 API Frameworks

Existing frameworks like MRAID may also be accessed via the VPAID API by specifying the framework name in the `environmentVars` property, as described in section 3.1.2.

## 2.4 Ad Unit Requirements

The ad unit is implemented by the ad server or advertiser and is packaged within a VAST response, along with any media or tracking resources needed for the ad experience.

It must respond to calls from the video player, and supply events so that the video player can keep track of the ad progress.

The ad unit is responsible for rendering ad creative within the video player. The video player provides the ad unit with an `environmentVars` parameter that includes a slot and a `videoSlot` for playing video.

### 2.4.1 Creative Display

Any aspect of the ad unit creative, such as ad countdown timers or companion ad creative, that is only visible after the user clicks a "learn more" button or another button, cannot be tracked as ad creative viewable along with the main ad unit creative. Ad units that depend on an expanded or companion ad unit creative should also include ad creative that displays with the main VPAID creative.

### 2.4.2 Content Display After the Ad

Once the ad is complete, the ad unit must clean up all ad-related creative and return the video player creative space to its pre-ad conditions. The video player may also handle cleanup of visual elements after an ad.

## 2.5 VPAID Events

VPAID events must be subscribed to and unsubscribed from by the video player, and fired (dispatched) by the ad unit. There are three categories of events:

- **Ad Linear / Nonlinear Events:** identify whether the ad state is linear or nonlinear. These events determine whether the video player plays its content behind the ad creative.
- **Ad Interaction Events:** events associated with interactions between the ad and the user, such as clicking a "Learn More" button.
- **Ad Status Events:** indicate the operational status of the ad, such as when an impression event should be recorded, or when the ad has stopped.

## 2.6 Ad Unit Security

Some video players may want to prevent certain VPAID ad units from accessing their system. [Creative sandboxing](https://iabtechlab.com/standards/creative-sandboxing/) and the Secure Interactive Media Interface Definition (SIMID) specification are the IAB Tech Lab solutions for addressing these security concerns.

# 3 VPAID Interface Definition

Each function name and related parameters, properties, and events are detailed in this section. A brief summary of all functions, properties, and events is provided in the API summary below.

## 3.1 Methods/Functions

Summary of methods:

| Method | Arguments | Returns |
|---|---|---|
| `handshakeVersion` | `(version: String)` | `String` |
| `initAd` | `(width, height, viewMode, desiredBitrate, creativeData, environmentVars)` | None |
| `resizeAd` | `(width: Number, height: Number, viewMode: String)` | None |
| `startAd` | `()` | None |
| `stopAd` | `()` | None |
| `pauseAd` | `()` | None |
| `resumeAd` | `()` | None |
| `expandAd` | `()` | None |
| `collapseAd` | `()` | None |
| `skipAd` | `()` | None |

### 3.1.1 `handshakeVersion()`

The video player calls `handshakeVersion` immediately after loading the ad unit to indicate the VPAID version it supports. The ad unit returns a version string that identifies the latest VPAID version it supports. The video player must verify the version before calling `initAd()`. If the versions are incompatible, the video player must not initialize the ad.

### 3.1.2 `initAd()`

After the ad unit indicates that it supports the correct VPAID version from `handshakeVersion`, the video player calls `initAd()` to initialize the ad experience.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `width` | Number | Width of the ad unit |
| `height` | Number | Height of the ad unit |
| `viewMode` | String | `"normal"`, `"thumbnail"`, or `"fullscreen"` |
| `desiredBitrate` | Number | The desired bitrate indicated by the player |
| `creativeData` | Object | Used for `AdParameters` specified in the VAST response. If the `AdParameters` value in the VAST response is URL encoded, the player must decode the data and URL encode the `AdParameters` value in the Object. The expected property name is `AdParameters`. |
| `environmentVars` | Object | An Object containing a `slot` (an HTML element on the page used to render the ad), a `videoSlot` (the HTML5 Video element on the page for playing video), and a `videoSlotCanAutoPlay` property (a Boolean indicating whether the video slot can autoplay). MRAID access is granted by including an `mraid` property with the framework Object. |

The ad unit responds by firing an `AdLoaded` event.

The video player may use `initAd()` to initialize the ad for loading without immediately starting the ad so that ads may be pre-loaded for a quicker ad experience.

### 3.1.3 `resizeAd()`

The video player calls `resizeAd()` when the video player changes the size of the creative display area.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `width` | Number | Width of the ad unit |
| `height` | Number | Height of the ad unit |
| `viewMode` | String | `"normal"`, `"thumbnail"`, or `"fullscreen"` |

The ad unit responds by firing an `AdSizeChange` event.

The resizeAd method may be called by the video player during either a linear or non-linear ad experience. When `resizeAd()` is called, the ad unit must change its size to the `width` and `height` requested by the video player. If `resizeAd()` is called by the video player with the same parameter values as the last call, the ad unit should not change anything. If the video player is resized on a user or content initiated resize, the video player should call `resizeAd()` so that the ad can resize to the new player dimensions.

### 3.1.4 `startAd()`

The video player calls `startAd()` when it is ready for the ad to display. The ad unit responds by firing an `AdStarted` event notifying the video player that the ad is displaying.

Once `startAd()` is called, the video player may receive either an `AdImpression` event or an `AdError` event. If an `AdError` event is received, the video player should respond by removing the ad unit and displaying content.

### 3.1.5 `stopAd()`

The video player calls `stopAd()` when it wants the ad unit to stop and clean up all creative resources, including any video element used by the ad unit. The ad unit responds by firing an `AdStopped` event when the ad has been stopped and all creative ad resources have been removed. At that point, the video player can restore its content video and begin playback.

### 3.1.6 `pauseAd()`

The video player calls `pauseAd()` when it wants the ad unit to pause. The ad unit responds by firing an `AdPaused` event. This method should be used when the user clicks a pause control on the video player to pause the ad. The video player should not fire its own pause tracking event because the ad unit provides its own.

### 3.1.7 `resumeAd()`

The video player calls `resumeAd()` when it wants the ad unit to resume. The ad unit responds by firing an `AdPlaying` event.

### 3.1.8 `expandAd()`

The video player calls `expandAd()` when it wants the ad unit to expand. This is only used for non-linear ad units that have a small initial display area that can be expanded.

### 3.1.9 `collapseAd()`

The video player calls `collapseAd()` when it wants the ad unit to collapse its expanded state. This is only used for non-linear ad units that have expanded.

### 3.1.10 `skipAd()`

The video player calls `skipAd()` when a user activates a skip control implemented by the video player. The ad unit responds by firing an `AdSkipped` event. The ad unit may also fire `AdStopped` after `AdSkipped`.

If the ad unit is not in the skippable state, the ad unit should fire `AdSkippableStateChange` and `AdLog` events. The ad unit can inform the video player that the ad unit has its own skip feature with the `adSkippableState` property. If `adSkippableState` is set to `true`, the video player should not display its own skip button.

## 3.2 Properties

Summary of properties:

| Property | Type |
|---|---|
| `adLinear` | Boolean |
| `adWidth` | Number |
| `adHeight` | Number |
| `adExpanded` | Boolean |
| `adSkippableState` | Boolean |
| `adRemainingTime` | Number |
| `adDuration` | Number |
| `adVolume` | Number |
| `adCompanions` | String |
| `adIcons` | Boolean |

### 3.2.1 `adLinear`

The `adLinear` Boolean indicates whether the ad unit is in a linear (`true`) or non-linear (`false`) state. When the value changes, the ad unit fires an `AdLinearChange` event.

If `adLinear` is `true`, the video player should expect the ad to occupy the full player content display area.

If `adLinear` is `false`, the video player may display content video behind the nonlinear ad unit creative.

When the ad unit changes from a linear state to a non-linear state, or vice versa, the ad unit must fire the `AdLinearChange` event and the video player should check the `adLinear` property to identify what state the ad unit is in.

If the video player is designed for linear ads only, it should stop the ad when it detects a nonlinear state to prevent a poor user experience. Otherwise, a linear video ad may simply go non-linear and hover on the page for some time.

### 3.2.2 `adWidth` and `adHeight`

`adWidth` and `adHeight` identify the ad unit's width and height, respectively, and must return a value during the ad experience that represents the current ad size. The ad unit should always return the value in pixel dimensions.

### 3.2.3 `adExpanded`

The `adExpanded` Boolean value indicates whether the ad unit is in an expanded state (`true`) or collapsed state (`false`).

### 3.2.4 `adSkippableState`

The `adSkippableState` Boolean value indicates whether the ad can be skipped (`true`) or not (`false`). When this value changes, the ad unit fires the `AdSkippableStateChange` event. The video player can check `adSkippableState` to see if the ad unit supports the `skipAd()` method.

### 3.2.5 `adRemainingTime`

The `adRemainingTime` Number value indicates the ad's remaining time in seconds, and is updated by the ad unit during the ad experience. Initially, the value should be set to the ad's total duration. If unknown, the value should be `-2` and the video player may check the `adDuration` property for the ad's duration.

If the ad is not yet started, the ad unit should return the value `-1`.

### 3.2.6 `adDuration`

The `adDuration` Number value indicates the total ad duration in seconds. If unknown, the value should return `-2`.

### 3.2.7 `adVolume`

The `adVolume` Number value indicates the ad unit's current volume as a value between 0 and 1. If unknown, the value should return `-1`. The video player is responsible for maintaining the ad's mute state and setting the volume accordingly.

When the ad unit's volume changes, the ad unit fires the `AdVolumeChange` event.

### 3.2.8 `adCompanions`

The `adCompanions` XML String identifies companion ad creative that the ad unit is requesting from the video player. The string is the VAST 3.0 (or later) `<CompanionAds>` node in XML format, e.g., `<CompanionAds> ... </CompanionAds>`. The video player may use this companion ad, if present, in addition to any companion ads included in the VAST wrapper.

### 3.2.9 `adIcons`

The `adIcons` Boolean indicates whether the ad unit provides ad icon(s), such as the AdChoices icon. When `true`, the video player should not display its own ad icon. If the ad unit does not provide ad icons, `adIcons` returns `false` and the video player can display its own icon.

## 3.3 Events

The following events must be subscribed to by the video player and fired (dispatched) by the ad unit:

| Event | Parameter |
|---|---|
| `AdLoaded` | |
| `AdStarted` | |
| `AdStopped` | |
| `AdSkipped` | |
| `AdSkippableStateChange` | |
| `AdSizeChange` | |
| `AdLinearChange` | |
| `AdDurationChange` | |
| `AdExpandedChange` | |
| `AdRemainingTimeChange` | (cycled frequently during ad playback) |
| `AdVolumeChange` | |
| `AdImpression` | |
| `AdVideoStart` | |
| `AdVideoFirstQuartile` | |
| `AdVideoMidpoint` | |
| `AdVideoThirdQuartile` | |
| `AdVideoComplete` | |
| `AdClickThru` | `(url: String, id: String, playerHandles: Boolean)` |
| `AdInteraction` | `(id: String)` |
| `AdUserAcceptInvitation` | |
| `AdUserMinimize` | |
| `AdUserClose` | |
| `AdPaused` | |
| `AdPlaying` | |
| `AdLog` | `(id: String)` |
| `AdError` | `(message: String)` |

### 3.3.1 `AdLoaded`

The ad unit fires the `AdLoaded` event after the ad unit has been loaded and initialized and the video player may begin displaying the ad by calling `startAd()`. The ad unit may start loading after it receives the `initAd()` call from the video player.

### 3.3.2 `AdStarted`

The ad unit fires the `AdStarted` event when the ad unit has been started by a `startAd()` call from the video player.

### 3.3.3 `AdStopped`

The ad unit fires the `AdStopped` event when the ad unit has been stopped by a `stopAd()` call from the video player, or when the ad has finished running.

When the ad unit fires the `AdStopped` event, the video player should restore its content video and begin playback.

### 3.3.4 `AdSkipped`

The ad unit fires the `AdSkipped` event when the ad has been skipped, usually as a result of the video player calling `skipAd()`.

### 3.3.5 `AdSkippableStateChange`

The ad unit fires the `AdSkippableStateChange` event when the ad unit's skippable state has changed. The video player should check `adSkippableState` for the current value.

### 3.3.6 `AdSizeChange`

The ad unit fires the `AdSizeChange` event after the ad unit has resized itself in response to a `resizeAd()` call from the video player. The video player should check `adWidth` and `adHeight` for the current values.

### 3.3.7 `AdLinearChange`

The ad unit fires the `AdLinearChange` event when the ad unit switches between linear and nonlinear mode. The video player should check `adLinear` for the current value.

### 3.3.8 `AdDurationChange`

The ad unit fires the `AdDurationChange` event when the ad unit's duration has changed. The video player should check `adDuration` for the current value.

### 3.3.9 `AdExpandedChange`

The ad unit fires the `AdExpandedChange` event when the ad unit expands or collapses. The video player should check `adExpanded` for the current value.

### 3.3.10 `AdRemainingTimeChange`

The ad unit fires the `AdRemainingTimeChange` event periodically during the ad experience to indicate the remaining time. The video player should check `adRemainingTime` for the current value.

### 3.3.11 `AdVolumeChange`

The ad unit fires the `AdVolumeChange` event when the ad unit's volume has changed. The video player should check `adVolume` for the current value.

### 3.3.12 `AdImpression`

The ad unit fires the `AdImpression` event when the ad unit renders ad creative to indicate that an impression has been recorded.

### 3.3.13 Ad Video Events

The ad unit fires `AdVideoStart`, `AdVideoFirstQuartile`, `AdVideoMidpoint`, `AdVideoThirdQuartile`, and `AdVideoComplete` during the video ad to indicate video creative progress.

### 3.3.14 `AdClickThru`

The ad unit fires the `AdClickThru` event when a clickthrough URL is available for the video player to process. Three parameters are included with the event:

| Parameter | Description |
|---|---|
| `url` | The clickthrough URL |
| `id` | An id used by the ad unit to identify the click |
| `playerHandles` | A Boolean. When `true`, the video player should handle opening the URL. When `false`, the ad unit opens the URL and the video player does not need to do anything. |

If `playerHandles` is `true`, the video player should navigate to the URL in a new browser window. It should then either pause the ad by calling `pauseAd()` or stop the ad by calling `stopAd()`.

### 3.3.15 `AdInteraction`

The ad unit fires the `AdInteraction` event when the user interacts with the ad unit, such as clicking a "Learn More" button. The parameter `id` is used by the ad unit to identify the type of interaction. The IAB has not defined specific interaction types, so the ad unit may define any interaction type.

### 3.3.16 `AdUserAcceptInvitation`

The ad unit fires the `AdUserAcceptInvitation` event when the user clicks to expand a non-linear ad unit (e.g. an overlay), providing ad content in a larger format.

### 3.3.17 `AdUserMinimize`

The ad unit fires the `AdUserMinimize` event when the user clicks a "minimize" control to reduce the ad to its smallest size.

### 3.3.18 `AdUserClose`

The ad unit fires the `AdUserClose` event when the user clicks a "close" control to close the ad. The video player should then call `stopAd()`.

### 3.3.19 `AdPaused`

The ad unit fires the `AdPaused` event when the ad has been paused, usually as a result of the video player calling `pauseAd()`.

### 3.3.20 `AdPlaying`

The ad unit fires the `AdPlaying` event when the ad has resumed playing, usually as a result of the video player calling `resumeAd()`.

### 3.3.21 `AdLog`

The ad unit fires the `AdLog` event to relay ad unit information (such as error messages or other diagnostics) to the video player. Data may be included in the message parameter.

### 3.3.22 `AdError`

The ad unit fires the `AdError` event when a fatal ad error has occurred. The ad unit includes a message describing the error in the message parameter. After receiving `AdError`, the video player should call `stopAd()`, remove the ad unit, and then display content.

## 3.4 Error Handling

Both the video player and the ad unit should be prepared to handle errors. Errors can be organized into video player (VP) errors and ad unit (AU) errors as follows:

### Summary of Errors and Recommended Recovery Actions

#### Video Player Errors

| Error | Action |
|---|---|
| VP can't load the VPAID ad unit from the VAST URI | VP displays content |
| VP can't find or load `handshakeVersion()` | VP displays content |
| VP receives an incompatible version from `handshakeVersion()` | VP displays content |
| VP loads and gets `handshakeVersion()` but receives an error loading `initAd()` | VP displays content |
| `initAd()` succeeds but `startAd()` fails | VP displays content |
| VP receives an `AdError` after calling `startAd()` | VP stops ad and displays content |
| VP does not receive `AdImpression` within expected timeframe | VP stops ad and displays content |

#### Ad Unit Errors

| Error | Action |
|---|---|
| AU doesn't receive `startAd()` within expected timeframe after `initAd()` | AU fires `AdError` |
| AU receives `initAd()` with incorrect or bad parameters | AU fires `AdError` |

#### Additional Timeout Scenarios

| Scenario | Timeout | Action |
|---|---|---|
| VP calls `initAd()`, no `AdLoaded` response | Player decides | VP calls `stopAd()`, waits 5 sec for `AdStopped`; if no response, VP removes VPAID ad unit, displays content |
| VP calls `startAd()`, no `AdImpression` response | Player decides | VP calls `stopAd()`, waits 5 sec for `AdStopped`; if no response, VP removes VPAID ad unit, displays content |
| VP calls `stopAd()`, no `AdStopped` response | 5 seconds | VP removes VPAID ad unit, displays content |
| VP calls other methods, ad stops responding | Player decides | VP calls `stopAd()`, waits 5 sec for `AdStopped`; if no response, VP removes VPAID ad unit, displays content |

# 4 Implementation

VPAID is designed to support scripted ad units in JavaScript and is intended for HTML5 environments.

## 4.1 JavaScript (HTML5)

JavaScript VPAID ad units run within the environment of the HTML5 video player and are loaded by the video player using the JavaScript source from a URL.

### 4.1.1 Loading the JavaScript Ad Unit

The VPAID JavaScript ad unit URL is provided in a `MediaFile` element of the VAST response. The `apiFramework` value must be set to `"VPAID"`.

**Example:**

```xml
<MediaFile apiFramework="VPAID" type="application/javascript">
  https://myAdServer/creative/vpaidAd.js
</MediaFile>
```

The video player loads the ad unit by inserting the script into the page. Once the script has loaded, it is ready for use.

### 4.1.2 Calls from the Video Player

Once loaded, the video player may then access the ad unit by calling `getVPAIDAd()`, which returns a reference to the ad object. The ad unit must implement this function to return the VPAID ad interface object.

### 4.1.3 Events

JavaScript events are subscribed to and unsubscribed from by the video player. The ad unit must implement the following methods:

| Method | Parameters |
|---|---|
| `subscribe` | `(handler: Function, event: String, context: Object)` |
| `unsubscribe` | `(handler: Function, event: String)` |

The video player must subscribe to all events listed in section 3.3.

**Example:**

```javascript
vpaidAd.subscribe(eventHandler, "AdLoaded", this);
vpaidAd.subscribe(eventHandler, "AdStarted", this);
```

### 4.1.4 Security Considerations for JavaScript

JavaScript ad units may cause security concerns for a video player. The ad unit may access the surrounding page content and resources, and may need to be loaded from a different domain.

IAB Tech Lab recommends [Creative sandboxing](https://iabtechlab.com/standards/creative-sandboxing/) and the Secure Interactive Media Interface Definition (SIMID) specification for addressing these security concerns. SIMID provides a secure alternative to VPAID for interactive video ad experiences.