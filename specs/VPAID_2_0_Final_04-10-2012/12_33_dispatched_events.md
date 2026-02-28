## 3.3 Dispatched Events

All events are dispatched from the ad unit to the video player, usually in response to method calls made by the video player. Event handlers in the video player may in turn call ad methods. Video players must be written in a way to prevent a stack overflow caused by calling back into methods as a result of an event.

The ad unit should avoid dispatching any events before `AdLoaded` is sent or after `AdStopped` or `AdSkipped` is sent.

### 3.3.1 AdLoaded

When the video player calls the `initAd()` method, the ad unit can begin loading assets. Once loaded and ready for display, the ad dispatches the `AdLoaded` event. No UI elements should be visible before `AdLoaded` is sent, but sending `AdLoaded` indicates that the ad unit has verified that all files are ready to execute. Also, if `initAd()` was called, and the ad unit is unable to display and/or send `AdLoaded`, then `AdError` should be dispatched.

### 3.3.2 AdStarted

The `AdStarted` event is sent by the ad unit to notify the video player that the ad is displaying and is a response to the `startAd()` method.

### 3.3.3 AdStopped

The `AdStopped` event is sent by the ad unit to notify the video player that the ad has stopped displaying and all ad resources have been cleaned up. This event is only for responding the `stopAd()` method call made by the video player. It should never be used to initiate the ad unit's end or used to inform the video player that it can now call `stopAd()`.

### 3.3.4 AdSkipped

The `AdSkipped` event is sent by the ad unit to notify the video player that the ad has been skipped, stopped displaying and all ad resources have been cleaned up.

The `AdSkipped` event can be sent in response to the `skipAd()` method call or as a result of a skip control activated within the ad unit (rather than in the video player).

In response to a `skipAd()` method call, the ad unit must stop ad play, clean up all resources, and send the `AdSkipped` event. If a skip control is activated within the ad unit, the ad unit must stop ad play, clean up all resource, and send the `AdSkipped` event followed by the `AdStopped` event. Sending the `AdStopped` event for skip controls activated in the ad unit ensures that video players using earlier versions of VPAID receive notice that the ad has stopped playing.

### 3.3.5 AdSkippableStateChange

`AdSkippableStateChange` is new to VPAID 2.0.

When an ad unit only allows its creative to be skipped within a specific time frame, it can use the `AdSkippableStateChange` event to prompt the video player to check the value of the `adSkippableState` property, which keeps the video player updated on when the ad can be skipped and when it cannot be skipped.

### 3.3.6 AdSizeChange

`AdSizeChange` is new to VPAID 2.0

The `AdSizeChange` event is sent in response to the `resizeAd()` method call. When the video player resizes, it notifies the ad unit so that the ad unit can also scale to maintain the same ad space ratio that it had relevant to the previous video player size.

When the video player calls `resizeAd()`, the ad unit must scale its width and height value to equal or less than the width and height value supplied in the video player call. If the video player doesn't provide width and height values (as in fullscreen mode), then the ad unit can resize to any dimension.

Once the ad unit has resized itself, it writes width and height values to the `adWidth` and `adHeight` properties, respectively. The `AdSizeChange` event is then sent to confirm that the ad unit has resized itself.

See resizeAd(), adWidth and adHeight for more information.

### 3.3.7 AdLinearChange

The `AdLinearChange` event is sent by the ad unit to notify the video player that the ad unit has changed playback mode. To find out the current state of the ad unit's linearity, the video player must use the get `adLinear` property and update its UI accordingly. See the adLinear property for more information.

### 3.3.8 AdDurationChange

`AdDurationChange` is new to VPAID 2.0.

The duration for some video ads can change in response to user interaction or other factors. When the ad duration changes, the ad unit updates the values of the `adDuration` and `adRemainingTime` properties and dispatches the `AdDurationChange` event, notifying the video player that duration has changed. The video player can then get `adDuration` and `adRemainingTime` to update its UI, such as the duration indicator, if applicable.

During normal playback, adDurationChange should not be dispatched unless the total duration of the ad changes.

### 3.3.9 AdExpandedChange

When the expanded state of the ad changes, the ad unit must update the `adExpanded` property and dispatch the `AdExpandedChange` event to notify the video player of the change. The video player responds by using the get `adExpanded` property to update its UI accordingly. An `AdExpandedChange` event may be triggered by the `expandAd()` method.

The AdExpandedChange event is only for notifying the player of a change in ad unit expansion, such as the expand or collapse of an interactive panel. To dispatch a change in standard display size, please use AdSizeChange.

### 3.3.10 AdRemainingTimeChange (Deprecated in 2.0)

The `AdRemainingTimeChange` event is still supported in order to accommodate ads and video players using VPAID 1.0; however, in 2.0 versions, please use `AdDurationChange`.

The `AdRemainingTimeChange` event is sent by the ad unit to notify the video player that the ad's remaining playback time has changed. The video player may get the `adRemainingTime` property and update its UI accordingly.

Upon initial duration change, the ad unit should update the `adRemainingTime` property and send the `AdRemainingTimeChange` event at least once per second but no more than four times per second (to maintain optimum performance) so that the video player can keep its UI in synch with actual time remaining.

### 3.3.11 AdVolumeChange

If the ad unit supports volume, any volume changes are updated in the `adVolume` property and the `AdVolumeChange` event is dispatched to notify the video player of the change. The video player may then use the get `adVolume` property and update its UI accordingly.

### 3.3.12 AdImpression

The `AdImpression` event is used to notify the video player that the user-visible phase of the ad has begun. The `AdImpression` event may be sent using different criteria depending on the type of ad format the ad unit is implementing.

For a linear mid-roll ad, the impression should coincide with the AdStart event. However, for a non-linear overlay ad, the impression will occur when the invitation banner is displayed, which is normally before the ad video is shown. This event matches that of the same name in *Digital Video In-Stream Ad Metrics Definitions*, and must be implemented to be IAB compliant.

### 3.3.13 AdVideoStart, AdVideoFirstQuartile, AdVideoMidpoint, AdVideoThirdQuartile, AdVideoComplete

These five events are sent by the ad unit to notify the video player of the ad unit's video progress and are used in VAST under the same event names. Definitions can be found under "Percent complete" events in *Digital Video In-Stream Ad Metrics Definitions*. These events must be implemented for ads to be IAB compliant, but only apply to the video portion of the ad experience, if any.

### 3.3.14 AdClickThru

The `AdClickThru` event is sent by the ad unit when a clickthrough occurs. Three parameters can be included to give the video player the option for handling the event.

Three parameters are available for the event:

- **String url:** enables the ad unit to specify the clickthrough url
- **String Id:** used for tracking purposes
- **Boolean playerHandles:** indicates whether the video player or the ad unit handles the event. Set to true, the video player opens the new browser window to the URL provided. Set to false, the ad unit handles the event.

The `AdClickThru` event is included under the same name in *Digital Video In-Stream Ad Metrics Definitions* and must be implemented to be IAB compliant.

### 3.3.15 AdInteraction

`AdInteraction` is new in VPAID 2.0.

This event was introduced to capture all user interactions under one metric aside from any clicks that result in redirecting the user to specified site. `AdInteraction` events might include hover-overs, clicks that don't result in a `ClickThru`, click-and-drag interactions, and the events described in section 3.3.16. While `AdInteraction` does not replace any other metric, it can be used in addition to other metrics. Keep in mind that recording both an `AdUserMinimize` and an `AdInteraction` for the same event is just one event with two names. Other custom interactions, such as "Dealer Locator" for example don't exist in any VPAID events, so it could be recorded under the `AdInteraction` event.

The `AdInteraction` event is sent by the ad unit to indicate any interaction with the ad EXCEPT for ad clickthroughs. An ad clickthrough is indicated using the `AdClickThru` event described in section 3.3.14.

One parameter is available for the event:

- **String Id:** used for tracking purposes

### 3.3.16 AdUserAcceptInvitation, AdUserMinimize, AdUserClose

The `AdUserAcceptInvitation`, `AdUserMinimize` and `AdUserClose` events are sent by the ad unit when they meet requirements of the same names as set in *Digital Video In-Stream Ad Metrics Definitions*. Each of these events indicates user-initiated action that the ad unit dispatches to the video player. The video player may choose to report these events externally, but takes no other action.

### 3.3.17 AdPaused, AdPlaying

The `AdPaused` and `AdPlaying` events are sent in response to the `pauseAd()` and `resumeAd()` method calls, respectively, to confirm that the ad has either paused or is playing. Sending `AdPaused` indicates that the ad has stopped all audio and any animation in progress. Other settings, such as adjusting the ad's visibility or removing ad elements from the UI, may be implemented until `resumeAd()` is called. Sending `AdPlaying` indicates that the ad unit has resumed playback from the point at which it was paused. See pauseAd() and resumeAd() method descriptions for more detail.

### 3.3.18 AdLog

The `AdLog` event is optional and can be used to relay debugging information.

One parameter is available for this event:

- **String Id:** used for tracking purposes

### 3.3.19 AdError

The `AdError` event is sent when the ad unit has experienced a fatal error. Before the ad unit sends `AdError` it must clean up all resources and cancel any pending ad playback. The video player must remove any ad UI, and recover to its regular content playback state. The **String message** parameter can be used to provide more specific information to the video player.