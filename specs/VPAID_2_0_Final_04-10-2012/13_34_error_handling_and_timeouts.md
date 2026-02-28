## 3.4 Error Handling and Timeouts

Any fatal errors detected by the ad unit initiates an `AdError` event that cancels ad playback and returns the video player to content playback state. Errors should only be sent through the `AdError` event and *no uncaught exceptions should ever be thrown*.

The video player should also implement timeout mechanisms anywhere an ad response is expected and not received.

Recovery actions are provided for each of the timeout situations below:

- **Delay of request of ad file to ad file successfully loaded:** cancel ad load and move on to the next ad or return to regular content playback.
- **Calling `initAd()` and not receiving `AdLoaded` event:** remove ad from UI and delete all ad resources. Move on to next ad or return to regular content playback.
- **Calling `startAd()` and not receiving `AdStarted` event:** call `stopAd()`. If no response is received, remove the ad from the UI and delete all resources. Move on to the next ad or return to regular content playback.
- **Receiving `AdLinearChange` event with `adLinear` set to true but never receiving `AdLinearChange` event with `adLinear` set to false (excluding ad pause/resume time):** call `stopAd()`. If no response is received, remove the ad from the UI and delete all resources. Move on to the next ad or return to regular content playback.
- **Calling `stopAd()` and not receiving `AdStopped` event:** remove the ad from the UI and delete all resources. Move on to the next ad or return to regular content playback.

The amount of time to allot for a timeout is up to the publisher and should be discussed with partners and vendors, but allowing more than a few seconds before moving on may cause the publisher to miss opportunities for executing alternative ads within the allotted ad space.