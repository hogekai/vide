## 6.5. Creative Delays Resolving Init

The interactive creative responding to a `Player:init` message with a `resolve` message is a critical step in the SIMID ad serving flow (Init Diagram, 2 above). The player keeps the SIMID iframe invisible and does not post either `SIMID:Player` or `SIMID:Media` messages until the iframe replies with a `resolve` message.

If the interactive creative fails to respond to a `player:init` message within the allotted time, the player may continue with ad media rendering only (Player:init resolve 5).

The player maintains the hidden interactive creative until ad media playback completion.

If the interactive creative does not resume communication by the playback end, the player must report the VAST error tracker (if available) with the code 1212. See Player:init resolve 5).

*Player:init resolve **delay***

[Figure: A sequence diagram showing interactions between four participants: player, creative, media, and metrics server. (1) player sends Player:init «message» to creative, with a {timeout} timer on the player lifeline. (2) player sends play() to media. (3) player sends impression «tracker» to metrics server. (4) media sends complete «event» back to player. (5) player sends error «tracker» to metrics server. (6) player sends unload() to creative, which destroys creative.]

1. Player posts `Player:init` message and establishes a timeout.
2. Player starts ad media playback upon timeout expiration.
3. Player reports impression.
4. Media playback completes.
5. Player reports error tracker.
6. Player unloads the iframe.