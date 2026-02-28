## 6.4. Uninterrupted Initialization WorkFlow

In the case where publisher environments prohibit media playback interruptions, waiting for the creatives is not possible. The media player renders the ad media immediately - before the creative confirms its readiness (Special Creative Initialization Cases). Some examples include SSAI and live broadcasts.

In these situations, the player keeps the iframe invisible and refrains from posting messages to the creative until it responds to the `Player:init` with a `resolve` message.

**Special Creative Initialization Cases**

[Figure: A sequence diagram titled "Init Diagram" showing interactions between three participants: player, creative, and media. (1) player sends play() to media. (2) player sends Player:init «message» to creative, with a {variable} annotation on the player lifeline. (3) creative performs process data() as a self-call, with a {latency} annotation. creative sends resolve «message» back to player. {immediate} annotation follows. (5) player sends Player:startCreative «message» to creative.]

1. Player initializes ad media playback.
2. Player posts `Player:init` message after ad media playback started.
3. Creative processes initialization data and finalizes assets loading. Sub-loading routines may cause latencies.
4. Creative responds with § 4.3.7.1 resolve.
5. Player posts § 4.3.10 SIMID:Player:startCreative immediately.