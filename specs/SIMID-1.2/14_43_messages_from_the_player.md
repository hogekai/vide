## 4.3. Messages from the player

SIMID specifies a group of messages that enables the player to transmit data, instructions, or state changes to the creative. The player prepends such message types with the `SIMID:Player` namespace.

`SIMID:Player` messages do not communicate ad media states. SIMID dedicates § 4.2 Messages Triggered by Media Element Events to report media status.

While some `SIMID:Player` messages expect `resolve` and/or `reject` creative responses, other messages do not require replies.

`SIMID:Player` **messages summary.**

| Event Name | Required | Event Name | Required | Event Name | Required |
|---|---|---|---|---|---|
| abort | | interrupted | | seeked | |
| canplay | | loadeddata | | seeking | |
| canplaythrough | | loadedmetadata | | stalled | |
| durationchange | | loadstart | | suspend | |
| emptied | | pause | | timeupdate | |
| encrypted | | play | | volumechange | |
| ended | | playing | | waiting | |
| error | | progress | | | |
| interruptbegin | | ratechange | | | |

| Message type | parameters | Responses |
|---|---|---|
| § 4.3.1 SIMID:Player:adSkipped | n/a | § 4.3.1.1 resolve |
| § 4.3.2 SIMID:Player:adStopped | code | § 4.3.2.1 resolve |
| § 4.3.3 SIMID:Player:appBackgrounded | n/a | § 4.3.3.1 resolve |
| § 4.3.4 SIMID:Player:appForegrounded | n/a | n/a |
| § 4.3.6 SIMID:Player:fatalError | errorCode errorMessage | § 4.3.6.1 resolve |
| § 4.3.7 SIMID:Player:init | environmentData creativeData | § 4.3.7.1 resolve § 4.3.7.2 reject |
| § 4.3.8 SIMID:Player:log | message | n/a |
| § 4.3.9 SIMID:Player:resize | mediaDimensions creativeDimensions fullscreen | n/a |
| § 4.3.10 SIMID:Player:startCreative | n/a | § 4.3.10.1 resolve § 4.3.10.2 reject |

### 4.3.1. SIMID:Player:adSkipped

The player posts a `SIMID:Player:adSkipped` message immediately after the user ends ad experience. For example, by clicking on the player-owned Skip Ad button. The player must stop the media and hide the creative iframe before sending the `Player:adSkipped` message.

The player waits for the `resolve` creative response. The player may time out if the creative takes too long to respond and unload the iframe. The timeout should be reasonable to allow creative to conclude ad-end logic.

#### 4.3.1.1. resolve

The creative must respond to `Player:adSkipped` with `resolve` once its internal ad-end processes finalize. When the player receives `resolve`, it unloads the creative iframe.

### 4.3.2. SIMID:Player:adStopped

The player posts a `SIMID:Player:adStopped` message immediately after it terminates the ad for any reason other than a user generated skip. See § 4.3.1 SIMID:Player:adSkipped.

The player must stop media playback and hide the creative iframe before reporting `Player:adStopped`. The player must wait for a `resolve` response from the creative allotting a reasonable timeout to accommodate creative's needs to finalize the ad-end logic.

```webidl
dictionary MessageArgs {
  required unsigned short code;
};
```

**code,**

Ad stop cause code. Values:

- 0 Unspecified
- 1 User-initiated close
- 2 Auto-close due to media playback completion
- 3 Player-initiated close before media playback completion
- 4 Creative-initiated close
- 5 Nonlinear duration complete.

#### 4.3.2.1. resolve

The creative must respond to `Player:adStopped` with `resolve` once its internal ad-end processes finalize. When the player receives `resolve`, it unloads the creative iframe.

### 4.3.3. SIMID:Player:appBackgrounded

Within mobile in-app ads, when the app moves to the background, the player posts a `SIMID:Player:appBackgrounded` message.

#### 4.3.3.1. resolve

The creative responds to appBackgrounded with `resolve` message.

### 4.3.4. SIMID:Player:appForegrounded

Within mobile in-app ad executions, when the app moves from the background to the foreground, the player posts a `SIMID:Player:appForegrounded` message.

### 4.3.5. SIMID:Player:collapseNonlinear

The player may resize the ad to its default dimensions without the creative requesting a collapse. The player may collapse the ad based on its internal logic or in response to the user resuming media playback.

The player posts the § 4.3.5 SIMID:Player:collapseNonlinear message before it resizes the creative iframe.

The § 4.3.5 SIMID:Player:collapseNonlinear is an information-only message; there are no associated resolution responses.

### 4.3.6. SIMID:Player:fatalError

The player posts a `SIMID:Player:fatalError` message when it encounters exceptions that disqualify the ad from displaying any longer. If feasible, the player stops the ad media.

Regardless of the player's ability to terminate playback, the player should hide creative iframe and wait for `resolve` response before unloading iframe.

See § 6.9.5 Ad Errors Out

```webidl
dictionary MessageArgs {
  required unsigned short errorCode;
  DOMString errorMessage;
};
```

**errorCode,**

See § 9 Error Codes.

**errorMessage,**

Additional information

#### 4.3.6.1. resolve

The creative must respond to Player:fatalError with `resolve`. After `resolve` arrives, the player should remove the iframe.

See § 6.9.5 Ad Errors Out

### 4.3.7. SIMID:Player:init

The purpose of the `SIMID:player:init` message is to transport data to assist with the interactive component initialization. See § 6.2 Typical Initialization WorkFlow and § 6.4 Uninterrupted Initialization WorkFlow.

The creative must respond to Player:init with either § 4.3.7.1 resolve or § 4.3.7.2 reject.

```webidl
dictionary MessageArgs {
  required EnvironmentData environmentData;
  required CreativeData creativeData;
};
```

**environmentData,**

Information about publisher's environment and media player capacities.

**creativeData,**

Information that pertains to the specific creative.

```webidl
dictionary CreativeData {
  required DOMString adParameters;
  DOMString clickThruUrl;
};
```

**adParameters,**

Typically, the value of VAST `<AdParameters>` node.

**clickThruUrl,**

Value of VAST `<ClickThrough>` node.

```webidl
dictionary EnvironmentData {
  required Dimensions videoDimensions;
  required Dimensions creativeDimensions;
  required boolean fullscreen;
  required boolean fullscreenAllowed;
  required boolean variableDurationAllowed;
  required SkippableState skippableState;
  DOMString skipoffset;
  required DOMString version;
  DOMString siteUrl;
  DOMString appId;
  DOMString useragent;
  DOMString deviceId;
  boolean muted;
  float volume;
  NavigationSupport navigationSupport;
  CloseButtonSupport closeButtonSupport;
  float nonlinearDuration;
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

```webidl
enum SkippableState {"playerHandles", "adHandles", "notSkippable"};
enum NavigationSupport {"adHandles", "playerHandles", "notSupported"};
enum CloseButtonSupport {"adHandles", "playerHandles"};
```

**videoDimensions,**

Communicates media element coordinates and size. -1 indicates an unknown value.

**creativeDimensions,**

Communicates creative iframe coordinates and size the player will set when iframe becomes visible. The value of -1 indicates an unknown value, such as when responsive dimensions are dependent on the environment.

**fullscreen,**

The value `true` indicates that the player is currently in fullscreen mode.

**fullscreenAllowed,**

Communicates the player's capacity to toggle screen modes.

- The value `true` indicates that creative may request screen mode change.
- The value `false` denotes that the player will reject calls to change screen mode.*

**variableDurationAllowed,**

Communicates player's capacity† to:

a. interrupt ad playback progress – the ability to pause the media;
b. extend ad user experience length beyond ad media duration after ad playback completion;
c. accommodate creative's ad stop request.

The value `true` asserts that the player can:

- pause media playback in response to creative's requests;
- extend ad experience after media playback completion (and abstaining from ad unloading) if the creative posts ad duration change instructions;
- accommodate creative's ad stop request.‡

**skippableState,**

Expresses:

a. player's ability to skip the ad;†
b. VAST skippability-associated instructions logic management;
c. Skip Ad button handling delegation.

The value `playerHandles` indicates that all of the following applies:

- the publisher controls skippability logic (including handling of VAST `skipoffset` directives);
- either VAST contains `skipoffset` or the skippability is the publisher-administered behavior;
- the player implements the Skip Ad button;
- the player will ignore skip requests from the creative.

The value `adHandles` signals that the player:

- can skip the ad;
- does not implement internal Skip Ad button;
- disregards VAST skippability directives;
- will skip the ad in response to §4.4.16 SIMID:Creative:requestSkip message.§

The value `notSkippable` declares that the player:

- cannot skip the ad;
- ignores VAST skippability instructions;
- will disregard skip request from the creative.

With both `playerHandles` and `notSkippable`, the creative avoids the Skip Ad button drawing.

**skipoffset,**

Optional parameter that communicates the time the ad becomes skippable for the current session.

The `skipoffset` value format is "`HH:MM:SS`" or "`HH:MM:SS.mmm`".

The value can differ from the `skipoffset` in the VAST response when the player controls skippability. If the parameter's `skippableState` value is "`adHandles`", the creative must display the Skip Ad button when media playback arrives at the time specified by the `skipoffset` parameter.

**version,**

The SIMID version the player implements.

**muted,**

`true` if the player is muted.

**volume,**

Player's volume – expressed as a number between `0` and `1.0`.

**siteUrl,**

The URI of the publisher's site. May be full or partial URL.

**appId,**

The ID of the mobile app, if applicable.

**useragent,**

The information about SDKs as well as the player's vendor and version. The value should comply with VAST-specified conventions.

**deviceId,**

IDFA or AAID

**NavigationSupport,**

Indicates how clickthroughs should be handled.

- **playerHandles** Indicates that because of the platform, the player should handle clickthrough via §4.4.12 SIMID:Creative:requestNavigation. Mobile platforms are often this way.
- **adHandles** Indicates that the creative should open tabs or windows in response to user clicks. Web platforms are often this way.
- **notSupported** The platform does not support clickthrough.

**CloseButtonSupport,**

Indicates what should render a close button for nonlinear ads.

- **playerHandles** Indicates the player will render a close button for nonlinear ads.
- **adHandles** Indicates that the creative may render a close button. If the player will not render a close button it should always use adHandles for this parameter.

**nonlinearDuration,**

The duration in seconds that a nonlinear ad will play for. Often, this might be the same as minSuggestedDuration from the VAST response or the duration of the content.

\* see § 4.4.10 SIMID:Creative.requestFullscreen and § 4.4.11 SIMID:Creative.requestExitFullscreen messages.

† In SSAI, live broadcast, and other time-constrained environments, the player must support uninterrupted media (both content and ads) playback progress. Specifically, the player may not be able to pause the media, shorten ad, or extend user ad experience.

‡ see § 4.4.13 SIMID:Creative.requestPause, § 4.4.14 SIMID:Creative.requestPlay, § 4.4.8 SIMID:Creative.requestChangeAdDuration, and § 4.4.17 SIMID:Creative.requestStop.

§ SIMID does not expect device audio state information.

Values of `muted` and `volume` are independent. While the player is muted, `volume` can be greater than zero; the `volume` zero does not mean the player is muted.

#### 4.3.7.1. resolve

The creative acknowledges the initialization parameters.

If the creative delays calling resolve, see § 6.5 Creative Delays Resolving Init.

#### 4.3.7.2. reject

The creative may respond with a reject based on its internal logic.

```webidl
dictionary MessageArgs {
  required unsigned short errorCode;
  DOMString reason;
};
```

**errorCode,**

See § 9 Error Codes.

**reason,**

Optional information about rejection cause.

The player then will follow the rejection workflow. See § 6.6 Creative Rejects Init.