## 6.2 Custom events

As with the VPAID interface itself, event class definitions are not shared between the video player and the ad unit. The following class definition can be defined in both the video player and the ad unit, but since they are in separate ApplicationDomains it cannot be shared.

The ad unit must create a flash events.Event derived class that implements a data property getter as shown in the example below.

Two considerations should be noted when implementing VPAID:

- When defining the VPAIDEvent object, the "bubbles" attribute should be set to false [as in the public function VPAIDEvent() near the bottom of the example provided].
- When listening for a VPAIDEvent, the listener can optionally call "stopPropagation".

```actionscript
package
{
  import flash.events.Event;

  public class VPAIDEvent extends Event
  {
    public static const AdLoaded : String = "AdLoaded";
    public static const AdStarted : String = "AdStarted";
    public static const AdStopped : String = "AdStopped";
    public static const AdSkipped : String = "AdSkipped";
    public static const AdLinearChange : String = "AdLinearChange";
    public static const AdSizeChange : String = "AdSizeChange";
    public static const AdExpandedChange : String = "AdExpandedChange";
    public static const AdSkippableStateChange : String = "AdSkippableStateChange";
    public static const AdRemainingTimeChange : String = "AdRemainingTimeChange";
    public static const AdDurationChange : String = "AdDurationChange";
    public static const AdVolumeChange : String = "AdVolumeChange";
    public static const AdImpression : String = "AdImpression";
    public static const AdVideoStart : String = "AdVideoStart";
    public static const AdVideoFirstQuartile : String = "AdVideoFirstQuartile";
    public static const AdVideoMidpoint : String = "AdVideoMidpoint";
    public static const AdVideoThirdQuartile : String = "AdVideoThirdQuartile";
    public static const AdVideoComplete : String = "AdVideoComplete";
    public static const AdClickThru : String = "AdClickThru";
    public static const AdInteraction : String = "AdInteraction";
    public static const AdUserAcceptInvitation : String = "AdUserAcceptInvitation";
    public static const AdUserMinimize : String = "AdUserMinimize";
    public static const AdUserClose : String = "AdUserClose";
    public static const AdPaused : String = "AdPaused";
    public static const AdPlaying : String = "AdPlaying";
    public static const AdLog : String = "AdLog";
    public static const AdError : String = "AdError";

    private var _data:Object;

    public function VPAIDEvent(type:String, data:Object=null, bubbles:Boolean=false,
      cancelable:Boolean=false) {
      super(type, bubbles, cancelable);
      _data = data;
    }

    public function get data():Object {
      return _data;
    }

    public function clone():Object {
      return new VpaidEvent(type, data, bubbles, cancelable);
    }
  }
}
```

```actionscript
// example ad dispatch call from a function within ad's VPAID class
dispatchEvent(new VPAIDEvent(VPAIDEvent.AdStarted));
dispatchEvent(new VPAIDEvent(VPAIDEvent.AdClickThru,
  {url:myurl,id:myid,playerHandles:true}));
```

The video player uses addEventListener with a handler function that receives an Object as a parameter. To continue the above example:

```actionscript
public function onAdClickThru(event:Object) : void
{
  trace("Ad url is: " + event.data.url);
}

_VPAID.addEventListener(VPAIDEvent.AdClickThru, onAdClickThru);
```