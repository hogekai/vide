## 8.1.5 Examples

**Example of AdLoading**

```javascript
iframe = document.createElement('iframe');
iframe.id = "adloaderframe";
document.body.appendChild(iframe);
// url points to the ad js file
iframe.contentWindow.document.write['<script src="' + url + '"><\/scr' + 'ipt>'];
var fn = iframe.contentWindow['getVPAIDAd'];
if (fn && typeof fn === 'function') {
    VPAIDCreative = fn();
}
```

In the example the return value of the function is an instance of the ad class

**Example code to check if the VPAIDCreative implements all of the functions required by the VPAID spec**

```javascript
this.checkVPAIDInterface = function(VPAIDCreative) {
    if(
        VPAIDCreative.handshakeVersion && typeof
        VPAIDCreative.handshakeVersion === "function" && typeof
        VPAIDCreative.initAd && typeof VPAIDCreative.initAd === "function" &&
        VPAIDCreative.startAd && typeof VPAIDCreative.startAd === "function" &&
        VPAIDCreative.stopAd && typeof VPAIDCreative.stopAd === "function" &&
        VPAIDCreative.skipAd && typeof VPAIDCreative.skipAd === "function" &&
        VPAIDCreative.resizeAd && typeof VPAIDCreative.resizeAd === "function" &&
        VPAIDCreative.pauseAd && typeof VPAIDCreative.pauseAd === "function" &&
        VPAIDCreative.resumeAd && typeof VPAIDCreative.resumeAd === "function" &&
        VPAIDCreative.expandAd && typeof VPAIDCreative.expandAd === "function" &&
        VPAIDCreative.collapseAd && typeof VPAIDCreative.collapseAd === "function" &&
        VPAIDCreative.subscribe && typeof VPAIDCreative.subscribe === "function" &&
        VPAIDCreative.unsubscribe && typeof VPAIDCreative.unsubscribe === "function"
    ){
        return true;
    }
    return false;
};
```

**Example Ad Implementation**

This is an example of basic implementation of a Linear VPAID ad.

```javascript
LinearAd = function() {
    // The slot is the div element on the main page that the ad is supposed to occupy
    this._slot = null;
    // The video slot is the video object that the creative can use to render and video element it
    // might have.
    this._videoSlot = null;
};

LinearAd.prototype.initAd = function(width, height, viewMode, desiredBitrate,
        creativeData, environmentVars) {
    // slot and videoSlot are passed as part of the environmentVars
    this._slot = environmentVars.slot;
    this._videoSlot = environmentVars.videoSlot;

    console.log("initAd");
};

LinearAd.prototype.startAd = function() {
    console.log("Starting ad");
    ...
};

LinearAd.prototype.stopAd = function(e, p) {
    console.log("Stopping ad");
    ...
};

LinearAd.prototype.setAdVolume = function(val) {
    console.log("setAdVolume");
    ...
};

LinearAd.prototype.getAdVolume = function() {
    console.log("getAdVolume");
    ...
};

linearAd.prototype.resizeAd = function(width, height, viewMode) {
    console.log("resizeAd");
    ...
};

LinearAd.prototype.pauseAd = function() {
    console.log("pauseAd");
    ...
};

LinearAd.prototype.resumeAd = function() {
    console.log("resumeAd");
    ...
};

LinearAd.prototype.expandAd = function() {
    console.log("expandAd");
    ...
};

LinearAd.prototype.getAdExpanded = function(val) {
    console.log("getAdExpanded");
    ...
};

LinearAd.prototype.getAdSkippableState = function(val) {
    console.log("getAdSkippableState");
    ...
};

LinearAd.prototype.collapseAd = function() {
    console.log("collapseAd");
    ...
};

LinearAd.prototype.skipAd = function() {
    console.log("skipAd");
    ...
};

// Callbacks for events are registered here
LinearAd.prototype.subscribe = function(aCallback, eventName, aContext) {
    console.log("Subscribe");
    ...
};

// Callbacks are removed based on the eventName
LinearAd.prototype.unsubscribe = function(eventName) {
    console.log("unsubscribe");
    ...
};

getVPAIDAd = function() {
    return new LinearAd();
};
```