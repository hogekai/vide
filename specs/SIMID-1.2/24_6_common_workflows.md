## 6. Common Workflows

### 6.1. How to Handle Ad Loading

The player must follow this workflow for loading an ad. See Diagram - SIMID Loading and Initialization below.

1. The player creates an iframe for the SIMID interactive component. The iframe should start hidden. While invisible, the iframe must be capable of executing JavaScript and loading resources.
2. The player starts listening to the `message` event on the window that is the parent of the creative iframe.
3. The player sets the iframe src attribute to the URL provided by the creative's VAST `<InteractiveCreativeFile/>` element. The player must assume the iframe is cross-origin.
4. The player waits until the creative initializes a session and posts `createSession` message (see § 8.4 Session Layer). The player responds to the session initialization with a `resolve` message.
5. The player sends a § 4.3.7 SIMID:Player:init message with relevant parameters. The player waits until the creative responds with § 4.3.7.1 resolve. If the creative responds with § 4.3.7.2 reject, the player should unload the creative's iframe.
6. Where possible, to synchronize media playback and the creative UI, the player should wait until both the creative has responded to the § 4.3.7 SIMID:Player:init with § 4.3.7.1 resolve and the media is ready to play. Media readiness means sufficient payload arrived, and the first frame shows.
7. When the media starts, the player sends a § 4.3.10 SIMID:Player:startCreative message. The creative should respond to § 4.3.10 SIMID:Player:startCreative message with § 4.3.10.1 resolve immediately.
8. The player makes the iframe visible. With video ads, the player must position the iframe over media element at player's upper-left corner and set iframe dimensions to media's width and height.

*SIMID Loading and Initialization*

[Figure: A sequence diagram showing the SIMID loading and initialization workflow between three participants: "player", "window", and "iframe". The sequence proceeds as follows:

1. player sends `addEventListener(message)` to window.
2. player sends `createElement()` to iframe (creating it).
   - 2.1. player sends `set iframe.src= :VAST SIMID URI` to iframe.
   - 2.2. player sends `add to DOM()` to iframe (with a timer icon on player side).
3. iframe sends `createSession` «message» to player (with {latency} annotation on player side and {immediate} timer on iframe side).
   - 3.1. player sends `resolve` «message» to iframe (with timer icon on player side and {immediate} on iframe side).
4. player sends `SIMID:Player:init` «message» to iframe (with {latency} annotation on player side).
   - 4.1. iframe sends `resolve` «message» to player.

An alt box labeled "4.2 Creative rejects init" contains:
   - 4.2.1. iframe sends `reject` «message» to player (with {immediate} timer on iframe side).
   - 4.2.2. player sends `unload()` to iframe.

5. player sends `play()` to a "media" component.
   - 5.1. media sends `playing` «event» back to player (with timer icon on player side).]

1. Player starts listening to `message` event on the window.
2. Player creates hidden iframe.
   1. Player sets iframe.src to the value of the VAST `<InteractiveCreativeFile>` element.
   2. Player appends iframe to its container.
3. Creative loads and posts `createSession` message.
   1. Player responds with `resolve` immediately.
4. Player posts § 4.3.7 SIMID:Player:init immediately.
   1. Creative responds with § 4.3.7.1 resolve as soon as possible.
   2. Alternatively, the creative may reject `Player:init`. In such cases:
      1. Creative posts § 4.3.7.2 reject.
      2. Player unloads creative.
5. Player initializes media at its discretion.
   1. Media playback begins.
6. Player posts § 4.3.10 SIMID:Player:startCreative immediately.
   1. Creative should respond to `Player:startCreative` with § 4.3.10.1 resolve immediately.
7. Player makes SIMID iframe visible.