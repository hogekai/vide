## 6.8. How to Handle Ad Playback

The media player is responsible for ad media playback handling as well as tracking media related events. The SIMID creative manages interactive content and internal tracking related to interactivity.

### 6.8.1. Ad Pause

If the `variableDurationAllowed` flag is set to `true` then the player should enable media pause by the SIMID creative via the SIMID:Creative:requestPause message. The player must respond to SIMID:Creative:requestPause with the `AdPaused` event.

When the SIMID creative would like to resume media playback, it should send a SIMID:Creative:requestPlay message. The player must respond to SIMID:Creative:requestPlay message with resolve and play the media.

### 6.8.2. Ad Resizing and Fullscreen

The player may resize the ad slot. The player must send a § 4.3.9 SIMID:Player:resize message any time the ad slot size is changed.

If `fullscreenAllowed` is `true`, the SIMID creative may send a § 4.4.10 SIMID:Creative:requestFullscreen message. The player must resize only the ad slot to fullscreen (not the video). The SIMID creative then will resize the video as it sees fit. The player must send a § 4.3.9 SIMID:Player:resize message to the SIMID creative with `fullscreen` set to `true` and `videoDimensions` and `creativeDimensions` set to the fullscreen dimensions.

If player goes fullscreen on its own. Then the player must send a § 4.3.9 SIMID:Player:resize message to the SIMID creative with `fullscreen` set to `true` and `videoDimensions` and `creativeDimensions` set to the fullscreen dimensions.