## 3 VPAID Protocol Details

VPAID protocols enable the video player and the ad unit to communicate the state of the ad playback and include methods, properties and events.

The diagram below provides an example of how methods and events are used in sequence by the ad unit and video player. The video player on the left of the diagrams makes calls (red) to the ad unit on the right. The ad unit responds by dispatching events (teal) to the video player. Sometimes, the video player checks (or "gets") ad unit properties (yellow) and uses the information to modify its UI or manage content video playback.

[Figure: A sequence diagram showing the interaction between Video Player (left) and Ad (right). The flow proceeds as follows:

1. Video Player calls `handshakeVersion` → Ad responds with `Version string` (with Timeout)
2. Video Player calls `initAd` → Ad responds with `AdLoaded` (with Timeout)
3. Video Player calls `startAd` → Ad responds with `AdStarted` (with Timeout)
4. During "Ad Play and Interactions" phase:
   - Ad dispatches `pauseAd` → Video Player responds with `AdPaused` (labeled "Ad Pauses/Play")
   - Ad dispatches `resumeAd` → Video Player responds with `AdPlaying`
   - Ad dispatches `AdLinearChange` (labeled "Ad Linear Change")
   - Ad dispatches `adVolume`
   - Ad dispatches `expandAd` → Video Player responds with `AdExpandedChange` (with Timeout, labeled "Ad Expand Change")
   - Ad dispatches `adExpanded`
5. Video Player calls `stopAd` → Ad responds with `AdStopped` (with Timeout)]

Whenever the video player must wait for the ad unit to respond, the ad unit may take too long to send the appropriate event. In each of these cases, the video player should implement timeout instructions for how to respond in the absence of an expected ad unit response. Please see section 3.4 Error Handling and Timeouts for more information on timeouts.

The following sections provide descriptions for all VPAID protocols.

### 3.1 Methods

All methods are called by the video player on the ad unit's VPAID member property object.

The video player must refrain from calling any methods (besides `handshakeVersion()` or `initAd()`) on the ad unit or access any properties until after the `AdLoaded` event has been dispatched. The ad unit may not be able to provide any information or response until after the ad unit has loaded and `AdLoaded` has been dispatched.

#### 3.1.1 handshakeVersion

`handshakeVersion(playerVPAIDVersion : String) : String`

The video player calls handshakeVersion immediately after loading the ad unit to indicate to the ad unit that VPAID will be used. The video player passes in its latest VPAID version string. The ad unit returns a version string minimally set to "1.0", and of the form "major.minor.patch" (i.e. "2.1.05"). The video player must verify that it supports the particular version of VPAID or cancel the ad.

In VPAID 2.0, updates were made with support of version 1.0 and later in mind. Video players of version 2.0 should correctly display ads of version 1.0 and later, and video players of 1.0 and later should be able to display ads of version 2.0, but not all features will be supported. Testing should included ad play in different version environments to verify any compatibility issues.

Static interface definition implementations may require an external agreement for version matching, in which case the handshakeVersion method call isn't necessary. However, when dynamic languages are used, the ad unit or the video player can adapt to match the other's version if necessary. Dynamic implementations may use the handshakeVersion method call to determine if an ad unit supports VPAID. A good practice is to always call handshakeVersion even if the version has been coordinated externally.

#### 3.1.2 initAd()

`initAd(width : Number, height : Number, viewMode : String, desiredBitrate : Number, [creativeData : String], [environmentVars : String]) : void`

After the ad unit is loaded and the video player calls handshakeVersion, the video player calls `initAd()` to initialize the ad experience. The video player may preload the ad unit and delay calling `initAd()` until nearing the ad playback time; however, the ad unit does not load its assets until `initAd()` is called. Once the ad unit's assets are loaded, the ad unit sends the `AdLoaded` event to notify the video player that it is ready for display. Receiving the AdLoaded response indicates that the ad unit has verified that all files are ready to execute.

Parameters used in the `initAd()` method:

- **width:** indicates the available ad display area width in pixels
- **height:** indicates the available ad display area height in pixels
- **viewMode:** indicates either "normal", "thumbnail", or "fullscreen" as the view mode for the video player as defined by the publisher. Default is "normal".
- **desiredBitrate:** indicates the desired bitrate as number for kilobits per second (kbps). The ad unit may use this information to select appropriate bitrate for any streaming content.
- **creativeData:** (optional) used for additional initialization data. In a VAST context, the ad unit should pass the value for either the Linear or NonLinear AdParameter element specified in the VAST document.
- **environmentVars:** (optional) used for passing implementation-specific runtime variables. Refer to the language specific API description for more details.

#### 3.1.3 resizeAd()

`resizeAd(width : Number, height : Number, viewMode : String) : void`

The `resizeAd()` method is only called when the video player changes the width and height of the video content container, which prompts the ad unit to scale or reposition. The ad unit then resizes itself to a width and height that is equal to or less than the width and height supplied by the video player. Once resized, the ad unit writes updated dimensions to the `adWidth` and `adHeight` properties and sends the `AdSizeChange` event to confirm that it has resized itself.

Calling resizeAd() is solely for prompting the ad to scale or reposition. Use expandAd() to prompt the ad unit to extend additional creative space.

The parameters for this method call are:

- **Width/Height:** The maximum display area allotted for the ad. The ad unit must resize itself to a width and height that is within the values provided. The video player must always provide width and height unless it is in fullscreen mode. In fullscreen mode, the ad unit can ignore width/height parameters and resize to any dimension.
- **ViewMode:** Can be one of "normal" "thumbnail" or "fullscreen" to indicate the mode to which the video player is resizing. Width and height are not required when viewmode is fullscreen.

By using the `resizeAd()` method to resize, the video player enables the ad unit to resize itself and report its dimensions to the video player. This method is preferred over the video player using its own technology to set the ad size upon video player resize. In fact, the video player should never set the width and height properties of the ad unit. Instead, the video player can get the `adWidth` and `adHeight` properties to verify that the ad unit has resized itself to within the supplied dimensions.

#### 3.1.4 startAd()

`startAd() : void`

`startAd()` is called by the video player when the video player is ready for the ad to display. The ad unit responds by sending an `AdStarted` event that notifies the video player when the ad unit has started playing. Once started, the video player cannot restart the ad unit by calling `startAd()` and `stopAd()` multiple times.

#### 3.1.5 stopAd()

`stopAd() : void`

The video player calls `stopAd()` when it will no longer display the ad or needs to cancel the ad unit. The ad unit responds by closing the ad, cleaning up its resources and then sending the `AdStopped` event. The process for stopping an ad may take time. Please see section 3.4 Error Handling and Timeouts for more information on error reporting and timeouts.

#### 3.1.6 pauseAd()

`pauseAd() : void`

The video player calls `pauseAd()` to prompt the ad unit to pause ad display. The ad unit responds by suspending any audio, animation or video and then sending the `AdPaused` event. Instead of simply stopping animation and perhaps dimming display brightness, the ad unit may choose to remove UI elements. Once `AdPaused` is sent, the video player may hide the ad by adjusting the visibility setting for the display container. If the video player does not receive the `AdPaused` event after a `pauseAd()` call, then either the ad unit cannot be paused or it failed to send the `AdPaused` event. In either case, the video player should treat the lack of response as a failed attempt to pause the ad.

#### 3.1.7 resumeAd()

`resumeAd() : void`

Following a call to `pauseAd()`, the video player calls `resumeAd()` to continue ad playback. The ad unit responds by resuming playback and sending the `AdPlaying` event to confirm. If the video player does not receive the `AdPlaying` event after a `resumeAd()` call, then either the ad unit cannot resume play or it failed to send the `AdPlaying` event. In either case, the video player should treat the lack of response as a failed attempt to initiate resumed playback of the ad.

#### 3.1.8 expandAd()

`expandAd() : void`

The video player calls `expandAd()` when the timing is appropriate for an expandable ad unit to play or additional interactive ad space, such as an expanding panel. The video player may use this call when it provides an "Expand" button that calls `expandAd()` when clicked. The ad unit responds by setting the `adExpanded` property to true and dispatching the `AdExpandedChange` event, to confirm that the `expandAd()` call caused a change in behavior or appearance of the ad.

#### 3.1.9 collapseAd()

`collapseAd() : void`

When the ad unit is in an expanded state, the video player may call `collapseAd()` to prompt the ad unit to retract any extended ad space. The ad unit responds by setting the `adExpanded` property to false and dispatching the `AdExpandedChange` event, to confirm that the `collapseAd()` call caused a change in behavior or appearance of the ad.

The video player can verify that the ad unit is in an expanded state by checking the value of the `adExpanded` property at any time. The ad unit responds by restoring ad dimensions to its smallest width and height settings and setting its `adExpanded` property to "false."

The expectation is that the smallest UI size should have the least visible impact on the user, for best user-experience. Therefore, if the ad unit has multiple collapsed states, such as a minimized "pill" and a larger click to video banner state (see `expandAd()` for more details), then the `collapseAd()` call should result in the minimized "pill" state. Ad designers should consider implementing both collapsed states in all of their video ads for best user-experience. However, only one collapsed state is required.

**Note:** If the video player does not call `collapseAd()`, and the ad unit instead initiates a collapse on its own by setting adExpanded to false and sending the AdExpandedChange event, then the ad is free to choose any collapsed state it supports and not necessarily the smallest UI size.

#### 3.1.10 skipAd()

`skipAd() : void`

The `skipAd()` method is new in VPAID 2.0.

This method supports skip controls that the video player may implement. The video player calls `skipAd()` when a user activates a skip control implemented by the video player. When called, the ad unit responds by closing the ad, cleaning up its resources and sending the AdSkipped event.

The player should check the ad property `adSkippableState` before calling `skipAd()`. `skipAd()` will only work if this property is set to true. If player calls `skipAd()` when the `adSkippableState` property is set to false, the ad can ignore the skip request.

The process for stopping an ad may take time. Please see section 3.4 Error Handling and Timeouts for more information on error reporting and timeouts.

An AdSkipped event can also be sent as a result of a skip control in the ad unit and the video player should handle it the same way it handles an AdStopped event. If a skip control in the ad unit triggers the AdSkipped event, the video player may also send an AdStopped event to support video players using an earlier version of VPAID. The AdStopped event sent right after an AdSkipped event can be ignored in video players using VPAID 2.0 or later.

Also, if the VPAID version for the ad unit precedes version 2.0, the ad unit will not acknowledge a `skipAd()` method call. Skip controls in the video player should use the `stopAd()` method to close skipped ads that use earlier versions of VPAID.