## 4.4.5. SIMID:Creative:getMediaState

The creative posts a `SIMID:Creative:getMediaState` message to request the current ad media states values.

### 4.4.5.1. resolve

The player should always respond to `Creative:getMediaState` with a `resolve`, including situations when the player is unable to provide all expected values.

```webidl
dictionary MessageArgs{
  DOMString currentSrc;
  float currentTime;
  float duration;
  boolean ended;
  boolean muted;
  boolean paused;
  float volume;
  boolean fullscreen;
};
```

**currentSrc,**

The URI to the media publisher chooses for the playback. This value is optional and may not be provided in the case of server side ad insertion.

**currentTime,**

The time elapsed since the first ad media frame.

**duration,**

Ad media duration.

**ended,**

In HTML, the value of `HTMLMediaElement.ended` attribute.

**muted,**

In HTML, the value of `HTMLMediaElement.muted` attribute.

**paused,**

In HTML, the value of `HTMLMediaElement.paused` attribute.

**volume,**

In HTML, the value of `HTMLMediaElement.volume` attribute.

**fullscreen,**

The value is `true` if the media element is in full screen.

### 4.4.6. SIMID:Creative:log

The message `SIMID:Creative:log` enables the creative to communicate arbitrary information to the player.

Note: If the `log` message purpose is to notify the player about the player's non-standard behavior, the creative prepends `Message.args.message` value with "WARNING:" string. Warning messages are used to inform player developers about occurances of non-fatal issues.

```webidl
dictionary MessageArgs {
    required DOMString message;
};
```

**message,**

Logging information.

### 4.4.7. SIMID:Creative:reportTracking

The `SIMID:Creative:reportTracking` message enables a creative to delegate arbitrary metrics reporting to the player.

The creative may inject macros into trackers URIs.

In response to the `reportTracking` message, the player must:

- Send the trackers specified by the message as soon as possible.
- Replace VAST-supported macros with the corresponding values.
- Accept and send the trackers with custom macros – leave non-standard macros intact unless the publisher-ad integration involves custom macros processing.

```webidl
dictionary MessageArgs {
    required Array trackingUrls;
};
```

**trackingUrls,**

Array of URIs.

#### 4.4.7.1. resolve

The player posts a `resolve` after it sends the trackers.

#### 4.4.7.2. reject

The player posts a `reject` if it did not send the trackers.

```webidl
dictionary MessageArgs {
    required unsigned short errorCode;
    DOMString reason;
};
```

**errorCode,**

See [§9 Error Codes.](#)

**reason,**

Additional information.

### 4.4.8. SIMID:Creative:requestChangeAdDuration

In response to user interaction, the creative is requesting a new ad duration. User interaction is required for a change ad duration request. Ad duration cannot be extended as part of an automated process in the ad, such as adding an end card. Time for the end card must be allotted within the original duration of the ad.

In SIMID, ad's media determines the initial ad duration. The ad span may change due to user interaction. When ad duration changes, the creative posts `Creative:requestChangeAdDuration` message that communicates an updated value. In response to the `requestChangeAdDuration` message, the player adjusts ad-end timing and updates its ad progress UI (eg., countdown).

The creative expresses a known duration value in seconds. In cases where the duration is unknown (typically due to user interaction), the value is `-2`. With a known duration, the player unloads the ad automatically once the countdown (ad remaining time) reaches zero. See [§ 6.10.1 Ad Extends Beyond Media Completion](#) 🔒.

When the duration value is `-2`, the player displays the ad indefinitely until the creative posts [§ 4.4.17 SIMID:Creative:requestStop](#). See [§6.10.3 Ad Duration Changed Workflow - Unknown Time](#) step 5.

Note: The player communicates its capacities to modify the ad duration with [§ 4.3.7 SIMID:Player:init](#) message args parameter `variableDurationAllowed`. If the value of `variableDurationAllowed` is `false`, the creative refrains from posting `requestChangeAdDuration` message.

```webidl
dictionary MessageArgs {
    required float duration;
};
```

**duration,**

Value in seconds for a known duration.

The value `-2` indicates an unknown duration.

See [§6.10 Ad Duration Changed Workflow](#).

#### 4.4.8.1. resolve

By posting `resolve` response to `requestChangeAdDuration` message, the player signals that it will respect requested duration by modifying the ad duration-dependent behaviors.

Note: The player must accommodate an ad duration change directive if the value of the [§ 4.3.7 SIMID:Player:init](#) message parameter `variableDurationAllowed` is `true`.

#### 4.4.8.2. reject

By posting `reject` response to `requestChangeAdDuration` message, the player states that:

- It ignored the duration change request;
- Ad media playback continues uninterrupted;
- The player will stop and unload the ad once any of the prescribed player-side ad-end triggers arise.

Note: The single SIMID-supported reason for a `reject` in response to `requestChangeAdDuration` is the player's inability to alter media progress.

### 4.4.9. SIMID:Creative:requestChangeVolume

The creative requests ad volume change by posting a `SIMID:Creative:requestChangeVolume` message.

```webidl
dictionary MessageArgs {
    required float volume;
    required boolean muted;
};
```

**volume,**

The number between `0` and `1`.\*

**muted,**

`true` if media audio should be muted.\*

\* Properties `volume` and `muted` describe two independent audio states. While media is muted, its volume may be greater than zero; at the same time with zero volume, media may be unmuted.

#### 4.4.9.1. resolve

By posting `resolve` message, the player signals it has changed the media audio states to the requested values.

#### 4.4.9.2. reject

By posting `reject` message, the player signals that it did not change the audio state.

### 4.4.10. SIMID:Creative:requestFullscreen

The creative requests the player to transition the ad into fullscreen mode by posting a `SIMID:Creative:requestFullscreen` message.

Note: the player communicates its capacity to toggle screen modes with § 4.3.7 SIMID:Player:init message parameter `fullscreenAllowed`. When the value of `fullscreenAllowed` is `false`, the creative refrains from posting `Creative:requestFullscreen` message.

#### 4.4.10.1. resolve

By posting `resolve` response to `requestFullscreen` message, the player signals that it moved both the media element and the SIMID iframe into fullscreen mode.

#### 4.4.10.2. reject

By posting `reject` response to `requestFullscreen` message, the player signals that it did not change the screen mode because it is either:

- Incapable of toggling between screen modes.
- Already in the fullscreen mode.
- Disallows fullscreen mode.

### 4.4.11. SIMID:Creative:requestExitFullscreen

The creative requests the player to transition the ad into normal-screen mode by posting a `SIMID:Creative:requestExitFullscreen` message.

Note: the player communicates its capacity to toggle screen modes with § 4.3.7 SIMID:Player:init message parameter `fullscreenAllowed`. When the value of `fullscreenAllowed` is false, the creative refrains from posting `Creative:requestExitFullscreen` message.

#### 4.4.11.1. resolve

By posting `resolve` response to `requestExitFullscreen` message, the player signals that it moved both the media element and the SIMID iframe into normal-screen mode.

#### 4.4.11.2. reject

The player responds to `requestExitFullscreen` message with a `reject` when it did not change the screen mode because it is either:

- Incapable of toggling between screen modes or
- Already in the normal-screen mode.

### 4.4.12. SIMID:Creative:requestNavigation

In environments like mobile apps, the player manages redirections of the user to external landing pages. In response to § 4.4.12 SIMID:Creative:requestNavigation, the player opens a browser window with the location the creative provides with the message.args.uri parameter.

In web environments, the creative manages navigation.

The creative sends § 4.4.12 SIMID:Creative:requestNavigation in response to the user's interaction. The creative does not request navigation without user interaction.

```webidl
dictionary MessageArgs {
    required string uri;
};
```

**uri,**

The address of the landing page.

*Creative:requestNavigation Handling*

[Figure: A UML sequence diagram titled "sd dgrm-creative-requestNavigation" showing interactions between four participants: "user" (stick figure), "player" (rectangle), "creative" (rectangle), and "media" (rectangle). The flow is as follows: (1) user sends [1]:click() to a "navigation button" (circle). The navigation button sends :event to "creative". (2) "creative" sends [2]::requestNavigation «message» to "player". An alt fragment labeled "alt [3] player response" contains two branches: [[3.1] reject] — "player" sends [3.1.1]::reject «message» back to "creative"; [[3.2] resolve] — "player" sends [3.2.1]::resolve «message» back to "creative", then "player" sends [3.2.2]:pause() to "media", and "player" sends [3.2.3]:open(url) to a "window" (circle).]

1. User clicks on navigation button.
2. Creative posts `requestNavigation` message.
3. Player responds to § 4.4.12 SIMID:Creative:requestNavigation.
   1. Player responds with § 4.4.12.2 reject message if it cannot redirect the user.
   2. Player responds with § 4.4.12.1 resolve message before opening the landing page.
      1. Player pauses media.
      2. Player opens the landing page.

#### 4.4.12.1. resolve

The player posts resolve before it opens the window to assure the creative receives the message prior to app backgrounding.

#### 4.4.12.2. reject

The player did not navigate to a new window.

### 4.4.13. SIMID:Creative:requestPause

The creative requests the player to pause media playback by posting a `SIMID:Creative:requestPause` message.

Note: the player communicates its capacity to interrupt media playback with § 4.3.7 SIMID:Player:init message, parameter `variableDurationAllowed`. The creative must not post `requestPause` if the player sets `variableDurationAllowed` value to `false`.

#### 4.4.13.1. resolve

The player replies to `Creative:requestPause` with a `resolve` if it paused the media.

#### 4.4.13.2. reject

The player replies to `Creative:requestPause` with a `reject` if it did not pause the media or the playback is already paused.

### 4.4.14. SIMID:Creative:requestPlay

The creative requests the player to resume media playback by posting a `SIMID:Creative:requestPlay` message.

Note: the player communicates its capacity to interrupt media playback with § 4.3.7 SIMID:Player:init message, parameter `variableDurationAllowed`. The creative must not post `requestPlay` if the player sets `variableDurationAllowed` value to `false`.

#### 4.4.14.1. resolve

The player replies to `Creative:requestPlay` with a `resolve` if it resumed media playback.

#### 4.4.14.2. reject

The player replies to `Creative:requestPlay` with a `reject` if it did not resume the media or the playback is already in progress.

### 4.4.15. SIMID:Creative:requestResize

The creative requests ad resize by posting a `SIMID:Creative:requestResize` message.

The player must not resize the ad unless it can change the dimensions of both media element and SIMID iframe to the values specified by the `Creative:requestResize` message.

Note: the message `requestResize` must not be used to change screen mode. See the § 4.4.10 SIMID:Creative:requestFullscreen and § 4.4.11 SIMID:Creative:requestExitFullscreen messages.

```webidl
dictionary MessageArgs {
  required Dimensions mediaDimensions;
  required Dimensions creativeDimensions;
};
```

```webidl
dictionary Dimensions {
  required long x;
  required long y;
  required long width;
  required long height;
};
```

**mediaDimensions,**

Media element size and coordinates.

**creativeDimensions,**

SIMID iframe size and coordinates.

#### 4.4.15.1. resolve

The player replies to `requestResize` with a `resolve` if it has resized the ad and set the dimensions to the values specified by the `requestResize` message.

#### 4.4.15.2. reject

The player responds to `requestResize` with `reject` when it ignores the message or is unable to complete the resizing.

### 4.4.16. SIMID:Creative:requestSkip

The creative requests the player skip ad playback if possible.

See § 6.9.2 Creative Skips Ad

#### 4.4.16.1. resolve

If the player skips the ad, it responds with a `resolve`. The player then goes through its skip workflow. See § 4.3.1 SIMID:Player:adSkipped.

#### 4.4.16.2. reject

The player replies with a `reject` if it cannot skip the ad. With the skip rejection:

- The media playback continues.
- The iframe remains visible.
- The player continues posting `SIMID:Media` and `SIMID:Player` messages to the SIMID iframe.
- The creative maintains two-way communication with the player; it waits for, and responds to, the player transmitting ad completion related messages.

### 4.4.17. SIMID:Creative:requestStop

The creative requests the player stop video playback if possible.

See § 6.9.6 Ad Requests Stop

#### 4.4.17.1. resolve

If the player can stop the ad, it responds with a `resolve` (diagram 13, 8). The player then goes through § 6.9.6 Ad Requests Stop workflow (diagram 13, 927).

#### 4.4.17.2. reject

If the player cannot stop the ad, it responds with a `reject`. With the requestStop rejection:

- The media playback continues - if not previously ended;
- The iframe remains visible;
- The player continues posting messages to the iframe.

The creative keeps communication with the player open; it waits for, and responds to, the player transmitting ad completion related messages.