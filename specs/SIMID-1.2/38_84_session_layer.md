## 8.4. Session Layer

The media player may manage several ads that are in different phases of their lifespans; multiple concurrent sessions may be active. For example, while the player is rendering ad-A, it preloads and engages ad-B. Simultaneous two-way communication between the player and both ads persists.

Each session has a unique identifier. All messages that belong to a specific session must reference the same session id. The session id must be cryptographically safe to prevent brute force attacks that would try to guess the session id and spoof as the creative or player.

Note: A robust implementation like `window.crypto.getRandomValues` or `window.crypto.randomUUID` is recommended.

### 8.4.1. Establishing a New Session

SIMID delegates the session initialization to the creative overlay. The creative generates a unique session id and posts the first session message with the `Message.type` `createSession`. By posting the `createSession` message, the creative acknowledges its readiness to receive messages from the player.

Note: There is no expectation for the interactive component to be entirely able to participate in ad rendering at the time the creative signals `createSession` message. Full creative initialization may occur at later stages when the player provides complete data - see § 4.3.7 SIMID:Player.init.

Example of `createSession` Message data:

```json
{
    sessionId: "17331f8a6-b2e1-11e9-a1a1-3a2ae2dbcce4",
    messageId: 0,
    timestamp: 1564501643047,
    type: "createSession",
    args: { }
}
```

Creative should initialize the session as soon as possible. The player should establish a reasonable timeout for the session initialization message receipt.

The player responds to `createSession` with a `resolve` message.

*Typical Session Initialization Sequence*

[Figure: A sequence diagram showing the session initialization flow between three participants: "player", "timeout", and "creative". (1) start() — the player starts a timeout timer. (2) load() — the player sends a load request to the creative. (3) createSession «message» — the creative posts a createSession message back to the player. (4) cancel() — the player cancels the timeout timer. (5) resolve «message» — the player sends a resolve message to the creative. (6) Player:init «message» — the player sends a Player:init message to the creative.]

1. The player starts a `createSession` message timeout.
2. The player loads creative.
3. Creative posts `createSession` message.
4. The player cancels the timeout.
5. The player responds with a `resolve` message.
6. The player initializes creative. See § 4.3.7 SIMID:Player.init.

### 8.4.2. Session Establishing Delays and Failures

Typically, the player should wait for the creative to post a `createSession` message before proceeding to the simultaneous rendering of both ad media and the interactive component. However, SIMID recognizes scenarios when:

- The creative fails to establish a session within the allotted time.
- The player's environment restricts timeout usage (effectively, the timeout is zero). Specifically, SSAI and live broadcasts force zero-timeout use cases.

The creative's failure to establish a session does not prevent the player from rendering the ad media. If the creative does not post a `createSession` message on time, the player may proceed with the ad media rendering. However, the player allows the creative to recover in the middle of the ad media playback. The player:

- Does not unload the creative.
- Does not post messages to the creative.
- Maintains the `createSession` message handler.

If the creative has not established a session before the media playback is complete, the player will report a VAST Error tracker with the proper error code. Examples of situations when this may occur are listed below.

#### Sequence for a failed session initialization

1. The timeout expires.
2. The `createSession` message does not arrive.
3. The player starts ad media.
4. The player reports the impression.
5. The ad media playback completes.
6. The player reports the VAST error tracker.
7. The player unloads the creative iframe.

#### Creative posts a `createSession` message after the timeout occurs

1. The timeout expires.
2. The player retains the interactive component.
3. The player initiates ad media playback.
4. The player reports the impression.
5. The player does not post messages to the creative.
6. The creative posts `createSession` message.
7. The player proceeds with the creative initialization.