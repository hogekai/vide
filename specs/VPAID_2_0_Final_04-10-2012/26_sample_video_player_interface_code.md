## Sample Video player Interface Code

- This code is meant to be part of the video player that interacts with the ad.
- It effectively wraps the VPAID creative into an enveloping object that the video player can interact with
  - The example illustrates how callback can be registered with the creative.

```javascript
// This class is meant to be part of the video player that interacts with the Ad.
// It takes the VPAID creative as a parameter in its constructor.
VPAIDWrapper = function(VPAIDCreative) {
  this._creative = VPAIDCreative;
  if(!this.checkVPAIDInterface(VPAIDCreative))
  {
    //The VPAIDCreative doesn't conform to the VPAID spec
    return;
  }
  this.setCallbacksForCreative();
};

// This function registers the callbacks of each of the events
VPAIDWrapper.prototype.setCallbacksForCreative = function() {

  //The key of the object is the event name and the value is a reference to the
  callback function that is registered with the creative
  var callbacks = {
    AdStarted : this.onStartAd,
    AdStopped : this.onStopAd,
    AdSkipped : this.onSkipAd,
    AdLoaded : this.onAdLoaded,
    AdLinearChange : this.onAdLinearChange,
    AdSizeChange : this.onAdSizeChange,
    AdExpandedChange : this.onAdExpandedChange,
    AdSkippableStateChange : this.onAdSkippableStateChange,
    AdDurationChange : this.onAdDurationChange,
    AdRemainingTimeChange : this.onAdRemainingTimeChange,
    AdVolumeChange : this.onAdVolumeChange,
    AdImpression : this.onAdImpression,
    AdClickThru : this.onAdClickThru,
    AdInteraction : this.onAdInteraction,
    AdVideoStart : this.onAdVideoStart,
    AdVideoFirstQuartile : this.onAdVideoFirstQuartile,
    AdVideoMidpoint : this.onAdVideoMidpoint,
    AdVideoThirdQuartile : this.onAdVideoThirdQuartile,
    AdVideoComplete : this.onAdVideoComplete,
    AdUserAcceptInvitation : this.onAdUserAcceptInvitation,
    AdUserMinimize : this.onAdUserMinimize,
    AdUserClose : this.onAdUserClose,
    AdPaused : this.onAdPaused,
    AdPlaying : this.onAdPlaying,
    AdError : this.onAdError,
    AdLog : this.onAdLog
  };

  // Looping through the object and registering each of the callbacks with the
  creative
  for ( var eventName in callbacks) {
    this._creative.subscribe(callbacks[eventName],
      eventName, this);
  }

};

// Pass through for initAd - when the video player wants to call the ad
VPAIDWrapper.prototype.initAd = function(width, height,
    viewMode, desiredBitrate, creativeData,
    environmentVars) {
  this._creative.initAd(width, height, viewMode,
      desiredBitrate, creativeData,
      environmentVars);
};

// Callback for AdPaused
VPAIDWrapper.prototype.onAdPaused = function() {
  console.log("onAdPaused");
  .
  .
  .
};
// Callback for AdPlaying
VPAIDWrapper.prototype.onAdPlaying = function() {
  console.log("onAdPlaying");
  .
  .
  .
};
// Callback for AdError
VPAIDWrapper.prototype.onAdError = function(message) {
  console.log("onAdError: " + message);
  .
  .
  .
};
// Callback for AdLog
VPAIDWrapper.prototype.onAdLog = function(message) {
  console.log("onAdLog: " + message);
  .
  .
  .
};
// Callback for AdUserAcceptInvitation
VPAIDWrapper.prototype.onAdUserAcceptInvitation = function() {
  console.log("onAdUserAcceptInvitation");
  .
  .
  .
};
// Callback for AdUserMinimize
VPAIDWrapper.prototype.onAdUserMinimize = function() {
  console.log("onAdUserMinimize");
  .
  .
  .
};
// Callback for AdUserClose
VPAIDWrapper.prototype.onAdUserClose = function() {
  console.log("onAdUserClose");
  .
  .
  .
};
// Callback for AdSkippableStateChange
VPAIDWrapper.prototype.onAdSkippableStateChange = function() {
  console.log("Ad Skippable State Changed to: " +
    this._creative.getAdSkippableState());
  .
  .
  .
};
// Callback for AdExpandedChange
VPAIDWrapper.prototype.onAdExpandedChange = function() {
  console.log("Ad Expanded Changed to: " + this._creative.getAdExpanded());
  .
  .
  .
};
// Pass through for getAdExpanded
VPAIDWrapper.prototype.getAdExpanded = function() {
  console.log("getAdExpanded");
  return this._creative.getAdExpanded();
};
// Pass through for getAdSkippableState
VPAIDWrapper.prototype.getAdSkippableState = function() {
  console.log("getAdSkippableState");
  return this._creative.getAdSkippableState();
};
// Callback for AdSizeChange
VPAIDWrapper.prototype.onAdSizeChange = function() {
  console.log("Ad size changed to: w=" + this._creative.getAdWidth() + " h=" +
    this._creative.getAdHeight());
};

// Callback for AdDurationChange
VPAIDWrapper.prototype.onAdDurationChange = function() {
  // console.log("Ad Duration Changed to: " + this._creative.getAdDuration());
};

// Callback for AdRemainingTimeChange
VPAIDWrapper.prototype.onAdRemainingTimeChange = function() {
  // console.log("Ad Remaining Time Changed to: " +
    this._creative.getAdRemainingTime());
  .
  .
  .
};
// Pass through for getAdRemainingTime
VPAIDWrapper.prototype.getAdRemainingTime = function() {
  console.log("getAdRemainingTime");
  return this._creative.getAdRemainingTime();
};

// Callback for AdImpression
VPAIDWrapper.prototype.onAdImpression = function() {
  console.log("Ad Impression");
  .
  .
  .
};

// Callback for AdClickThru
VPAIDWrapper.prototype.onAdClickThru = function(url, id, playerHandles) {
  console.log("Clickthrough portion of the ad was clicked");
  .
  .
  .
};

// Callback for AdInteraction
VPAIDWrapper.prototype.onAdInteraction = function(id) {
  console.log("A non-clickthrough event has occured");
  .
  .
  .
};

// Callback for AdVideoStart
VPAIDWrapper.prototype.onAdVideoStart = function() {
  console.log("Video 0% completed");
  .
  .
  .
};

// Callback for AdVideoFirstQuartile
VPAIDWrapper.prototype.onAdVideoFirstQuartile = function() {
  console.log("Video 25% completed");
  .
  .
  .
};
// Callback for AdVideoMidpoint
VPAIDWrapper.prototype.onAdVideoMidpoint = function() {
  console.log("Video 50% completed");
  .
  .
  .
};
// Callback for AdVideoThirdQuartile
VPAIDWrapper.prototype.onAdVideoThirdQuartile = function() {
  console.log("Video 75% completed");
  .
  .
  .
};
// Callback for AdVideoComplete
VPAIDWrapper.prototype.onAdVideoComplete = function() {
  console.log("Video 100% completed");
  .
  .
  .
};
// Callback for AdLinearChange
VPAIDWrapper.prototype.onAdLinearChange = function() {
  console.log("Ad linear has changed: " + this._creative.getAdLinear())
  .
  .
  .
};
// Pass through for getAdLinear
VPAIDWrapper.prototype.getAdLinear = function() {
  console.log("getAdLinear");
  return this._creative.getAdLinear();
};

// Pass through for startAd()
VPAIDWrapper.prototype.startAd = function() {
  console.log("startAd");
  this._creative.startAd();
};
// Callback for AdLoaded
VPAIDWrapper.prototype.onAdLoaded = function() {
  console.log("ad has been loaded");
  .
  .
  .
};
// Callback for StartAd()
VPAIDWrapper.prototype.onStartAd = function() {
  console.log("Ad has started");
  .
  .
  .
};
//Pass through for stopAd()
VPAIDWrapper.prototype.stopAd = function() {
  this._creative.stopAd();
};

// Callback for AdStopped
VPAIDWrapper.prototype.onStopAd = function() {
  console.log("Ad has stopped");
  .
  .
  .
};

// Callback for AdSkipped
VPAIDWrapper.prototype.onSkipAd = function() {
  console.log("Ad was skipped");
  .
  .
  .
};
//Passthrough for setAdVolume
VPAIDWrapper.prototype.setAdVolume = function(val) {
  this._creative.setAdVolume(val);
};

//Passthrough for getAdVolume
VPAIDWrapper.prototype.getAdVolume = function() {
  return this._creative.getAdVolume();
};

// Callback for AdVolumeChange
VPAIDWrapper.prototype.onAdVolumeChange = function() {
  console.log("Ad Volume has changed to - " + this._creative.getAdVolume());
  .
  .
  .
};

//Passthrough for resizeAd
VPAIDWrapper.prototype.resizeAd = function(width, height,
    viewMode) {
  this._creative.resizeAd();
};
//Passthrough for pauseAd()
VPAIDWrapper.prototype.pauseAd = function() {
  this._creative.pauseAd();
};
//Passthrough for resumeAd()
VPAIDWrapper.prototype.resumeAd = function() {
  this._creative.resumeAd();
};
//Passthrough for expandAd()
VPAIDWrapper.prototype.expandAd = function() {
  this._creative.expandAd();
};
//Passthrough for collapseAd()
VPAIDWrapper.prototype.collapseAd = function() {
  this._creative.collapseAd();
};
```