## 6.3. Typical Start Creative WorkFlow

*Normal* `Player:startCreative` *Sequence*

[Figure: A UML sequence diagram showing the interaction between three participants: "player", "creative", and "media". The sequence is as follows: (1) "playing" «event» is sent from media to player. (2) "startCreative" «message» is sent from player to creative, with {latency} timing. (3) "resolve" «message» is sent from creative to player, with {immediate} timing. (4) player calls "display()" internally.]

1. Media playback begins.
2. Player posts `Player:startCreative`.
3. Creative responds with a `resolve`.
4. Player displays the creative iframe.