## 6 ActionScript 3 Implementation

This section provides information for how to implement VPAID using ActionScript 3. Also included are details on using custom events and addressing security concerns.

### 6.1 API Specifics

The loaded ad .swf file should be loaded into its own `ApplicationDomain` and therefore be treated as a \* data type. Both the ad unit and the video player need their own VPAID interface (IVPAID) definition since they both run in separate `ApplicationDomain`s. The interface cannot be shared.

The video player accesses VPAID by calling `getVPAID` on the ad object. For safety when calling VPAID, the video player may wrap the returned \* object with a class that implements VPAID explicitly, as shown in the following example. The VPAID class must extend `EventDispatcher`, and the video player should call `addEventListener` on the VPAID object using events with String names for the events listed in section 3.3.

To provide frame rate information {Stage.frameRate}, use the environmentVars parameter in the `initAd()` method.

For more information on passing custom event information, please Custom Events in section 6.2 following the sample code below.

**Sample code for implementing VPAID in ActionScript 3:**

```actionscript
package
{
  public interface IVPAID
  {
    // Properties
    function get adLinear() : Boolean;
    function get adWidth() : Number;
    function get adHeight() : Number;
    function get adExpanded() : Boolean;
    function get adSkippableState() : Boolean;
    function get adRemainingTime() : Number;
    function get adDuration() : Number;
    function get adVolume() : Number;
    function get adCompanions() : String;
    function get adIcons() : Boolean;

    // Methods
    function handshakeVersion(playerVPAIDVersion : String) : String;
    function initAd(width : Number, height : Number, viewMode : String, desiredBitrate : Number, creativeData :
    String="", environmentVars : String="") : void;
    function resizeAd(width : Number, height : Number, viewMode : String) : void;
    function startAd() : void;
    function stopAd() : void;
    function pauseAd() : void;
    function resumeAd() : void;
    function expandAd() : void;
    function collapseAd() : void;
    function skipAd() : void;
  }
}

package
{
  // Player wrapper for untyped loaded swf
  public class VPAIDWrapper extends EventDispatcher implements IVPAID
  {
    private var _ad:*;

    public function VPAIDWrapper(ad:*) {
      if(ad.hasOwnProperty('getVPAID'))
        _ad = ad.getVPAID();
      else
        _ad = ad;
    }

    // Properties
    public function get adLinear():Boolean {
      return _ad.adLinear;
    }
    public function get adWidth():Number {
      return _ad.adWidth;
    }
    public function get adHeight():Number {
      return _ad.adHeight;
    }
    public function get adExpanded():Boolean {
      return _ad.adExpanded;
    }
    public function get adSkippableState():Boolean {
      return _ad.adSkippableState;
    }
    public function get adRemainingTime():Number {
      return _ad.adRemainingTime;
    }
    public function get adDuration():Number{
      return _ad.adDuration;
    }
    public function get adVolume():Number {
      return _ad.adVolume;
    }
    public function set adVolume(value:Number):void {
      _ad.adVolume = value;
    }
    public function get adCompanions():String{
      return _ad.adCompanions;
    }
    public function get adIcons():Boolean {
      return _ad.adIcons;
    }

    // Methods
    public function handshakeVersion(playerVPAIDVersion : String):String {
      return _ad.handshakeVersion(playerVPAIDVersion);
    }
    public function initAd(width:Number, height:Number, viewMode:String, desiredBitrate:Number,
    creativeData:String="", environmentVars : String="") :void {
      _ad.initAd(width, height, viewMode, desiredBitrate, creativeData, environmentVars);
    }
    public function resizeAd(width:Number, height:Number, viewMode:String) :void {
      _ad.resizeAd(width, height, viewMode);
    }
    public function startAd():void {
      _ad.startAd();
    }
    public function stopAd() :void {
      _ad.stopAd();
    }
    public function pauseAd():void {
      _ad.pauseAd();
    }
    public function resumeAd() :void {
      _ad.resumeAd();
    }
    public function expandAd():void {
      _ad.expandAd();
    }
    public function collapseAd():void {
      _ad.collapseAd();
    }
    public function skipAd():void {
      _ad.collapseAd();
    }

    // EventDispatcher overrides
    override public function addEventListener(type:String, listener:Function, useCapture:Boolean=false,
    priority:int=0, useWeakReference:Boolean=false):void {
      _ad.addEventListener(type, listener, useCapture, priority, useWeakReference);
    }
    override public function removeEventListener(type:String, listener:Function,
    useCapture:Boolean=false):void {
      _ad.removeEventListener(type, listener, useCapture);
    }
    override public function dispatchEvent(event:Event):Boolean {
      return _ad.dispatchEvent(event);
    }
    override public function hasEventListener(type:String):Boolean {
      return _ad.hasEventListener(type);
    }
    override public function willTrigger(type:String):Boolean {
      return _ad.willTrigger(type);
    }
  }
}
```