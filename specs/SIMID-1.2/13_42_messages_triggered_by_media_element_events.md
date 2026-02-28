## 4.2. Messages Triggered by Media Element Events

SIMID specifies a group of messages that describe ad media states. The player prepends such messages with the `SIMID:Media` namespace.

SIMID borrows media-related semantics and naming conventions from the standard `HTMLMediaElement` behavior. In player implementations where an `HTMLMediaElement` is not used, the player must translate events and property values into the associated `SIMID:Media` message.

In HTML environments, `SIMID:Media` messages contain the original media event type.

1. `HTMLMediaElement` dispatches event `play`.
2. Player sets `Message.type = SIMID:Media:play`.

The player must report `SIMID:Media` messages immediately after the associated event occurs.

The player must not queue messages in cases where the creative iframe initialization happens in the middle of the ad media playback. The player posts only messages that communicate events that occur after the iframe initialization.

`SIMID:Media` messages are information-only; they do not trigger `resolve`/`reject` responses from the creative.

The player may elect to report all standard HTML media events to the creative. However, the creative should not expect to receive messages with optional types. (See table below.)

Some `SIMID:Media` messages – `durationchange`, `error`, `timeupdate`, and `volumechange` – require additional data provided with `Message.args` parameters.

Required and optional media event types.

### 4.2.1. SIMID:Media:durationchange

When the duration of the media changes due to the player receiving the media resource metadata (in HTML, `HTMLMediaElement` dispatches the `durationchange` event), the player posts a `SIMID:Media:durationchange` message.

```webidl
dictionary MessageArgs {
    required float duration;
};
```

**duration,**

The duration of the media in seconds. In HTML, HTMLMediaElement.duration value.

\* In SSAI, `HTMLMediaElement.duration` value does not express the actual ad media duration. In such cases, the player must compute the ad's actual media length.

### 4.2.2. SIMID:Media:ended

When the media playback completes (in HTML, `HTMLMediaElement` dispatches an `ended` event), the player posts a `SIMID:Media:ended` message.

### 4.2.3. SIMID:Media:error

When playback throws an exception (in HTML, `HTMLMediaElement` dispatches an `error` event), the player posts a `SIMID:Media:error` message.

```webidl
dictionary MessageArgs {
    required unsigned short error;
    required DOMString message;
};
```

**error,**

In HTML, the value of `HTMLMediaElement.error.code`. Codes:

1. The media download was canceled
2. Network error
3. The player failed to decode the media
4. Environment does not support media resource

**message,**

In HTML, the value of `HTMLMediaElement.error.message`.

### 4.2.4. SIMID:Media:pause

When the media pauses (in HTML, `HTMLMediaElement` dispatches a `pause` event), the player posts a `SIMID:Media:pause` message.

### 4.2.5. SIMID:Media:play

When media playback starts as a result of autoplay or its state is no longer paused (in HTML, `HTMLMediaElement` dispatches a `play` event), the player posts a `SIMID:Media:play` message.

### 4.2.6. SIMID:Media:playing

The player posts a `SIMID:Media:playing` message in one of the following cases:

- the media has enough data to start playback;
- the media recovered from `stalled` state;
- playback restarts;
- after seek operation completion.

In HTML, the player posts a `Media:playing` message when `HTMLMediaElement` dispatches a `playing` event.

### 4.2.7. SIMID:Media:seeked

When the user finished moving playhead into a new position (in HTML, `HTMLMediaElement` dispatches a `seeked` event), the player posts a `SIMID:Media:seeked` message.

### 4.2.8. SIMID:Media:seeking

When the user initiates seek operation (in HTML, `HTMLMediaElement` dispatches a `seeking` event), the player posts a `SIMID:Media:seeking` message.

### 4.2.9. SIMID:Media:stalled

When media data is not available for rendering (in HTML, `HTMLMediaElement` dispatches a `stalled` event), the player posts a `SIMID:Media:stalled` message.

### 4.2.10. SIMID:Media:timeupdate

The player communicates media playhead position by posting a `SIMID:Media:timeupdate` message. The message `Media:timeupdate` frequency should be not less than every 250ms.

In HTML, the player sends a `Media:timeupdate` message when `HTMLMediaElement` dispatches a `timeupdate` event.

```webidl
dictionary MessageArgs {
    required float currentTime;
};
```

**currentTime,**

The value in seconds. In HTML, `HTMLMediaElement.currentTime` property value.

In Server-Side Ad Insertion, the client-side media playback is a continuous stream which requires additional `currentTime` calculations. For the current ad, the player must compute the `currentTime` value as a delta between the actual playhead position and the time the ad started.

### 4.2.11. SIMID:Media:volumechange

When the media audio state changes (in HTML, `HTMLMediaElement` dispatches a `volumechange` event), the player posts a `SIMID:Media:volumechange` message.

```webidl
dictionary MessageArgs {
    required float volume;
    required boolean muted;
};
```

**volume,**

The number between `0` and `1`.

**muted,**

`true` if audio is muted.

The properties `volume` and `muted` describe two independent audio states. While the media is muted, its `volume` may be greater than zero; while `volume` is zero, the media may be unmuted.