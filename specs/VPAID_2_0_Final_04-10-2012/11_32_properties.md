## 3.2 Properties

The video player can access all properties on the ad unit's VPAID member property object. If the property is a get property, the ad unit writes to the property and the video player reads from the property. If the property is set property, the video player writes to the property and the ad unit reads from the property.

### 3.2.1 adLinear

`get adLinear : Boolean`

The `adLinear` Boolean indicates whether the ad unit is in a linear (true) or non-linear (false) mode of operation. The `adLinear` property should only be accessed after the ad unit has dispatched the AdLoaded event or after an AdLinearChange event.

The `adLinear` property affects the state of video content. When set to true, the video player pauses video content. If set to true initially and the ad unit is designated as a pre-roll (defined externally), the video player may choose to delay loading video content until ad playback is nearly complete.

### 3.2.2 adWidth

`get adWidth : Number`

The `adWidth` property is new to VPAID 2.0.

The `adWidth` property provides the ad's width in pixels and is updated along with the `adHeight` property anytime the AdSizeChange event is sent to the video player, usually after the video player calls `resizeAd()`. The ad unit may change its size to width and height values equal to or less than the values provided by the video player in the Width and Height parameters of the `resizeAd()` method. If the ViewMode parameter in the `resizeAd()` call is set to "fullscreen," then the ad unit can ignore the Width and Height values of the video player and resize to any dimension. The video player may use `adWidth` and `adHeight` values to verify that the ad is appropriately sized.

**Note:** `adWidth` **value may be different than** `resizeAd()` **values**
The value for the `adWidth` property may be different from the width value that the video player supplies when it calls `resizeAd()`. The `resizeAd()` method provides the video player's *maximum allowed* value for width, but the `adWidth` property provides the ad's actual width, which must be equal to or less than the video player's supplied width.

### 3.2.3 adHeight

`get adHeight : Number`

The `adHeight` property is new to VPAID 2.0.

The `adHeight` property provides the ad's height in pixels and is updated along with the `adWidth` property anytime the AdSizeChange event is sent to the video player, usually after the video player calls `resizeAd()`. The ad unit may change its size to width and height values equal to or less than the values provided by the video player in the Width and Height parameters of the `resizeAd()` method. If the ViewMode parameter in the `resizeAd()` call is set to "fullscreen," then the ad unit can ignore the Width and Height values of the video player and resize to any dimension. The video player may use `adWidth` and `adHeight` values to verify that the ad is appropriately sized.

**Note:** `adHeight` **values may be different than** `resizeAd()` **values**
The value for the `adHeight` property may be different from the height value that the video player supplies when it calls `resizeAd()`. The `resizeAd()` method provides the video player's *maximum allowed* value for height, but the `adHeight` property provides the ad's actual height, which must be equal to or less than the video player's supplied height.

### 3.2.4 adExpanded

`get adExpanded : Boolean`

The `adExpanded` Boolean value indicates whether the ad unit is in a state where additional portions it occupies more UI area than its smallest area. If the ad unit has multiple collapsed states, all collapsed states show `adExpanded` being false. There can only be one expanded state for the creative, which for a non-linear ad is usually the largest possible size for the ad unit and may include a linear mode of operation (though setting `adExpanded` to true does NOT imply that the ad unit is in linear mode).

Specifically, a non-linear ad can support one or more collapsed sizes that allow users to view video content reasonably unimpeded. One example of a larger collapsed state is where a nonlinear overlay typically displays across the lower fifth of the video display area. A secondary, smaller collapsed state, often called a "pill" state, might display as a small overlay button with a visible call-to-action.

The video player can check the `adExpanded` property at any time. Use the AdExpandedChange event to indicate that the expanded state has changed. If ad is statically sized `adExpanded` is set to false.

### 3.2.5 adSkippableState

`get adSkippableState : boolean`

The `adSkippableState` property is new to VPAID 2.0.

Common to skippable ads is a timeframe for when they're allowed to be skipped. For example, some ads may only be skipped a few seconds after the ad has started or may not allow the ad to be skipped as it nears the end of playback.

The `adSkippableState` enables advertisers and publishers to align their metrics based on what can and cannot be skipped.

The default value for this property is false. When the ad reaches a point where it can be skipped, the ad unit updates this property to true and sends the `AdSkippableStateChange` event. The video player can check this property at any time, but should always check it when the `AdSkippableStateChange` event is received.

### 3.2.6 adRemainingTime

```
get adRemainingTime : Number
```

The video player may use the `adRemainingTime` property to update player UI during ad playback, such as displaying a playback counter or other ad duration indicator. The `adRemainingTime` property is provided in seconds and is relative to the total duration value provided in the `adDuration` property.

The video player may check the `adRemainingTime` property at any time, but should always check it when receiving an `AdRemainingTimeChange` (in VPAID 1.0) or `adDurationChange` event (in VPAID 2.0). The ad unit should update this property to be current within one second of actual remain time and can be updated once per second during normal playback or up to four times per second (to maintain optimum performance) so that the video player can keep its UI in synch with actual time remaining.

If the property is not implemented, the ad unit returns a value of -1. A value of -2 is returned when time remaining is unknown. Unknown remaining time usually indicates that a user is actively engaged with the ad.

### 3.2.7 adDuration

```
get adDuration : Number
```

The `adDuration` property is new to VPAID 2.0.

An ad unit may provide the `adDuration` property to indicate the total duration of the ad, relative to the current state of the ad unit. When user interaction changes the total duration of the ad, the ad unit should update this property and send the `adDurationChange` event. The initial value for `adDuration` is the expected duration before any user interaction.

The video player may check the `adDuration` property at any time, but should always check it when receiving an `adDurationChange` event.

If duration is not implemented, the ad unit returns a -1 value. If the duration is unknown, the ad unit returns a -2. Unknown duration is typical when the user has engaged the ad.

### 3.2.8 adVolume

```
get adVolume : Number
set adVolume : Number
```

The video player uses the `adVolume` property to either request the current value for ad volume (get) or change the value of the ad unit's volume (set). The `adVolume` value is between 0 and 1 and is linear, where 0 is mute and 1 is maximum volume. The video player is responsible for maintaining mute state and setting the ad volume accordingly. If volume is not implemented as part of the ad unit, -1 is returned as the value for `adVolume` when the video player attempts to get `adVolume`. If set is not implemented, the video player does nothing.

### 3.2.9 adCompanions

```
get adCompanions : String
```

The `adCompanions` property is new to VPAID 2.0.

Companion banners are ads that display outside the video player area to reinforce the messaging provided in the video ad unit. In some cases, a VPAID ad unit may request ads from other ad servers after `initAd()` has been called, and makes a decision about which ad it will display, which may or may not include ad companions. For example, a client-side yield management SDK may wrap itself in a VPAID ad when a native SDK integration might be cumbersome. In this scenario, the ad server that served the initial VAST response may not know which ad will be displayed, and therefore the VAST response itself does not include ad companions.

VPAID 2.0 enables an ad server to serve a VAST response which has no companions, but which does have a VPAID ad unit that pulls in ad companions dynamically based on the ad-serving situation. The video player can then check the VPAID ad unit for ad companions when the VAST response has none.

The video player is not required to poll this property, and because ad companion information from the VAST response takes precedence over VPAID ad companions, the video player should only access this property when the VAST response is absent of any ad companions.

The value of this property is a String that provides ad companion details in VAST 3.0 format for the `<CompanionAds>` element, and should contain all the media files and details for displaying the ad companions (i.e. the format should be of an `Inline` response and not in `Wrapper` format). Also, the value should only include details within the `<CompanionAds>` element and not an entire VAST response. If any XML elements are included outside of the `<CompanionAds>` element, they must be ignored, including any `<Impression>` elements that might have been included. However, VAST companion ad `<TrackingEvents>` elements for `<Tracking event="creativeView">` must be respected.

If the video player calls for `adCompanions()`, it must wait until after receiving the VPAID `AdLoaded` event, and any companions provided must not display until after the VPAID `AdImpression` event is received. Delaying companion display until after the `AdImpression` event prevents display of any companion banners in the case where the video ad fails to register an impression.

If this property is used but no Companions are available the property should return an empty string "".

Example of a basic `<AdCompanions>` element from VAST as it may be passed in the VPAID `adCompanions` property:

```xml
<AdCompanions>
    <Companion>
        <StaticResource type="image/jpg">
            <![CDATA[
                http://AdServer.com/120x60companion.jpg
            ]]>
        </StaticResource>
        <TrackingEvents>
            <Tracking event=creativeView>
                <![CDATA[
                    http://AdServer.com/creativeview.jpg
                ]]>
            </Tracking>
        </TrackingEvents>
    </Companion>
</AdCompanions>
```

### 3.2.10 adIcons

```
get adIcons : Boolean
```

The `adIcons` property is new to VPAID 2.0.

Several initiatives in the advertising industry involve using an icon that overlays on top of an ad creative to provide some extended functionality such as to communicate with consumers or otherwise fulfill requirements of a specific initiative. Often this icon and its functionality may be provided by a vendor, and is not necessarily served by the ad server or included in the creative itself.

One example of icon use is for compliance to certain Digital Advertising Alliance (DAA) self-regulatory principles for Online Behavioral Advertising (OBA). If you would like more information about the OBA Self Regulation program, please visit http://www.aboutads.info.

The video player can use the `adIcons` property to avoid displaying duplicate icons over any icons that might be provided in the ad unit. Until the industry provides more guidance on how to pass metadata using common ad-serving protocols, this property is limited to a Boolean response. The default value is `False`. If one or more ad icons are present within the ad, the value returned is `True`. When set to `True`, the video player should not display any ad icons of its own.