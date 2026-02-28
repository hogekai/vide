## 6.6. Creative Rejects Init

The creative may respond with a `reject` based on its internal logic. In response to `reject`, the player proceeds with the ad media playback. The player may unload the iframe. The player reports VAST error trackers with the `errorCode` specified by the creative.

*Player:init reject **Sequence***

[Figure: A sequence diagram showing interactions between four participants: player, creative, metrics server, and media. (1) player sends Player:init «message» to creative, with a {latency} annotation on the player lifeline. (2) creative sends reject «message» back to player. (3) player sends unload() to creative, which destroys creative. {immediate} annotation on player lifeline. (4) player sends error «tracker» to metrics server. (5) player sends play to media.]

1. Player posts `Player:init` message.
2. Creative responds with a `reject`.
3. Player unloads the creative iframe.
4. Player reports VAST error tracker.
5. Player starts media.