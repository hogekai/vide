## 6.9. How to Handle Ad End and Unload

Following are cases where ad can end:

1. Ad was skipped, either by player (see § 6.9.1 Player Skips Ad) or creative (See § 6.9.2 Creative Skips Ad).
2. The creative has fired § 4.4.17 SIMID:Creative:requestStop message and the player has allowed the ad to stop.
3. The player has fired § 4.3.2 SIMID:Player:adStopped message and the creative resolved.
4. Ad errors out. See § 6.9.5 Ad Errors Out.

### 6.9.1. Player Skips Ad

**Skip Ad Handled by Player**

1. The player sends a § 4.3.1 SIMID:Player:adSkipped message to the ad.
2. The player hides the creative.
3. The creative may dispatch any tracking pixels via § 4.4.7 SIMID:Creative:reportTracking.
4. The creative may wait for § 4.4.7.1 resolve from the reportTracking message.
5. The creative dispatches `resolve` on the `adSkipped` message § 4.3.1.1 resolve.
6. The player fires any skip tracking pixels.
7. The player unloads the ad.

### 6.9.2. Creative Skips Ad

The creative requests ad skip by posting a `SIMID:Creative:requestSkip` message. If feasible, in response to `requestSkip`, the player terminates the ad and goes through the § 4.3.1 SIMID:Player:adSkipped message sequence.

Note: the SIMID interactive component implements skip related behavior and features ( Skip Ad button) only if the player delegates skippability to the creative - the value of § 4.3.7 SIMID:Player:init message `args.environmentData.skippableState` is `"adHandles"`.

**`Creative:requestSkip` Sequence**

[Figure: A sequence diagram showing the interaction between three participants: creative, player, and media. The flow is as follows: Creative sends a Creative:requestSkip «message» to player. Player calls hide(). Player sends stop() to media. Player sends resolve «message» back to creative. Player sends Player:adSkipped «message» to creative. A note on the right indicates [latency]. Creative sends resolve «message» back to player. Player sends unload() to creative. Both creative and player lifelines end with X marks.]

1. Creative posts `Creative:requestSkip` message.
2. Player hides the SIMID iframe.
3. Player stops the ad media playback.
4. Player responds with § 4.4.16.1 resolve.
5. Player posts § 4.3.1 SIMID:Player:adSkipped message.
6. Creative responds to `Player:adSkipped` with § 4.3.1.1 resolve.
7. Player unloads the SIMID iframe.

### 6.9.3. Ad Ends Before Media Completion

This scenario applies when the creative signal to the player to dismiss the ad, typically at the prompting of the user. A good example is a survey that allows the viewer to skip immediately to content when completed.

1. The ad cleans up and dispatches § 4.4.17 SIMID:Creative:requestStop.
2. The player unloads the ad.

### 6.9.4. Ad Completes at Media Completion

When an ad finishes at the same time as its media.

1. The player sends a § 4.3.2 SIMID:Player.adStopped message to the ad.
2. The player hides the creative.
3. The creative may dispatch any tracking pixels via § 4.4.7 SIMID:Creative:reportTracking.
4. The creative may wait for a § 4.4.7.1 resolve response message from the reportTracking message.
5. The creative dispatches `resolve` on the adStopped message § 4.3.2.1 resolve.
6. The player unloads the ad.

### 6.9.5. Ad Errors Out

The SIMID creative or the player may terminate the ad unit with an error at any time. If the SIMID creative indicates an error, the player should try to stop ad unit playback. This might not be possible in server side stitched ads.

The player may error out if the ad does not respond with § 4.3.7.1 resolve in a reasonable amount of time.

When a player errors out it must follow these steps.

1. The player sends a § 4.3.6 SIMID:Player:fatalError message to the ad.
2. The player hides the creative.
3. The creative may dispatch any tracking pixels via § 4.4.7 SIMID:Creative:reportTracking.
4. The creative may wait for a § 4.4.7.1 resolve response from the reportTracking message.
5. The creative dispatches `resolve` on the `fatalError` message § 4.3.6.1 resolve.
6. The player unloads the ad.

### 6.9.6. Ad Requests Stop

The creative stops the ad by posting a `SIMID:Creative:requestStop` message.

If feasible, the player hides the iframe, stops media playback that is still in progress, and responds with a § 4.4.17.1 resolve. Subsequently, the player proceeds with the § 4.3.2 SIMID:Player:adStopped.

The SIMID interactive component engages ad stop functionality only if the player states its ability to vary ad duration. See § 4.3.7 SIMID:Player:init, `Message.args.variableDurationAllowed` details. The interactive component logic must expect that the player will unload SIMID iframe immediately upon posting a `resolve` response under the SIMID-compliant circumstances.

In the event the interactive component disregards or fails to accommodate player's ability to resolve `requestStop`, the iframe remains visible and the player continues sending `SIMID:Media` and `SIMID:Player` messages. The creative should maintain communication with the player. See § 4.4.17.2 reject.

**Creative:requestStop Sequence**

[Figure: A sequence diagram with three participants: "creative", "player", and "media". The flow is as follows: (1) Creative sends "Creative:requestStop" message to player. (2) Player sends "hide()" to itself. (3) Player sends "stop()" to media. (4) Player sends "resolve" message back to creative. (5) Player sends "Player:adStopped" message to creative. A note labeled "(latency)" appears between the resolve and adStopped messages. (6) Creative sends "resolve" message back to player. (7) Player sends "unload()" to itself. All three participants terminate at the bottom of the diagram.]

1. Creative posts `Creative:requestStop` message.
2. Player hides the SIMID iframe.
3. Player stops the ad media playback.
4. Player responds with § 4.4.17.1 resolve.
5. Player posts § 4.3.2 SIMID:Player:adStopped message.
6. Creative responds to `Player:adStopped` with § 4.3.2.1 resolve.
7. Player unloads the SIMID iframe.

## 6.10. Ad Duration Changed Workflow

### 6.10.1. Ad Extends Beyond Media Completion

This scenario is only possible when the `variableDurationAllowed` flag is set to `true`. Media duration must only be extended in response to user interaction.

1. User interacts at any point during playback of the media, triggering extended ad portion. This is required. Ad duration cannot be extended as part of an automated process in the ad, such as adding an end card. Time for the end card must be allotted within the original duration of the ad.
2. The Creative dispatches § 4.4.8 SIMID:Creative:requestChangeAdDuration message with the new duration.
3. The ad enters its extended phase.
4. The creative dispatches § 4.4.17 SIMID:Creative:requestStop when extended phase is finished.

### 6.10.2. Ad Duration Changed Workflow - Known Time

**Known Ad Duration Change Sequence**

[Figure: A sequence diagram with three participants: "creative", "player", and "countdown". 1) Player sends start() to countdown. 2) A note on countdown reads "countdown depends on media duration". 3) Creative sends a message labeled "[duration != -2]:: requestChangeAdDuration" («message») to player. 4) Player sends update() to countdown. 5) A note on countdown reads "countdown depends on updated duration". 6) Countdown sends finished() back to itself. 7) Countdown sends complete «signal» to player. 8) Player sends Player:adStopped «message» to creative. Both creative and player lifelines terminate with X marks.]

1. Player starts countdown. Countdown depends on the media progress.
2. Creative posts `requestChangeAdDuration` with the `duration` value greater than zero.
3. Player modifies countdown that now depends on the specified by the creative ad duration.
4. Countdown finishes.
5. Player receives countdown completion notification.
6. Player posts § 4.3.2 SIMID:Player:adStopped message.

### 6.10.3. Ad Duration Changed Workflow - Unknown Time

**Unknown Ad Duration Change Sequence**

[Figure: A sequence diagram with three participants: "creative", "player", and "countdown". 1) Player sends start() to countdown. 2) A note on countdown reads "countdown depends on media duration". 3) Creative sends a message labeled "[duration == -2]:: requestChangeAdDuration" («message») to player. 4) Player sends stop() to countdown. 5) Creative sends requestStop «message» to player. Both creative and player lifelines terminate with X marks.]

1. Player starts countdown. Countdown depends on the media progress.
2. Creative posts `requestChangeAdDuration` with the `duration` value -2.
3. Player stops countdown.
4. Creative posts § 4.4.17 SIMID:Creative:requestStop message.