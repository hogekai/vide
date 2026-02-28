## 8.1 API Specifics

### 8.1.1 Methods

**initAd()**

initAd(width : Number, height : Number, viewMode : String, desiredBitrate : Number, creativeData : Object, environmentVars : Object) : void

- The basic use of `initAd()` and parameters is same as the AS3 and silverlight implementation, but there are few differences:
  - The 'creativeData' and 'environmentVars' arguments are Objects
  - creativeData parameter is used for passing in additional ad initialization data, specifically adParameters node of a VAST response.
  - The 'environmentVars' object contains a reference, 'slot', to the HTML element on the page in which the ad is to be rendered. The ad unit essentially gets control of that element. See the following code example on how to set this value.
  - The 'environmentVars' object would contain a reference, 'videoSlot', to the video element on the page where the ad video is to be rendered and a boolean flag, 'videoSlotCanAutoPlay' indicating whether the 'videoSlot' is capable of autoplaying. It is upto the player implementation to decide what video element to pass to the ad. Two choices with associated tradeoffs are:
    1. The player can pass the video element used for playing the content video.
       - This allows the ad unit and content videos to share the same video element, allowing a consistent user experience between content and ad playback including sharing of the control bar.
       - This approach is similar to flash implementation.
       - This also allows the ad implementer to get around the autoplay limitation in iOS and Chrome mobile where video elements can't start without user interaction.
       - In this case, boolean flag , 'videoSlotCanAutoPlay', should be set to true.
    2. The player can pass a video element different than what it used to play the content video.
       - The advantage of this choice is that player can pre-buffer the video content to be played after the ad, potentially providing a better content play experience.
       - In this case, on iOS and Chrome mobile, the ad video will not autoplay. For these devices, and any future devices with similar restriction, boolean flag , 'videoSlotCanAutoPlay', should be set to false.
       - For the cases where ad video cannot autoplay, it is recommended that the ad video be rendered with "poster" attribute and/or the ad video is built such that the first frame is meaningful to the user.

Example code for populating 'CreativeData' and 'EnvironmentVars':

```javascript
// Populating CreativeData - The AdParameters string should be extracted by parsing the VAST XML
CreativeData.AdParameters = "linear/NonLinear AdParameter node from VAST without the CDATA wrapper";

// Example assumes that ad is to be rendered within a div with id 'videoAdLayer'
// Example assumes that the content video plays within video element with id 'videoElement'
var slot = document.getElementById('videoAdLayer');
environmentVars.slot = slot;

// Share the content video slot with the ad
environmentVars.videoSlot =
    document.getElementById('videoElement');
environmentVars.videoSlotCanAutoPlay = true;
ad.initAd(slot.style.width, slot.style.height, viewMode, desiredBitrate, creativeData,
environmentVars)
```

```javascript
// The following method call is specific to JavaScript
```

**subscribe**

subscribe (fn : Reference, event : String, [listenerScope : Reference]) :void

- The video player calls this method to register a listener to a particular event
  - fn is a reference to the function that needs to be called when the specified event occurs
  - event is the name of the event that the video player is subscribing to
  - [optional] listenerScope is a reference to the object in which the function is defined

**unsubscribe**

unsubscribe (fn: Reference, event : String): void

- The video player calls this method to remove a listener for a particular event
  - event is the name of the event that the video player is unsubscribing from
  - fn is the event listener that is being removed