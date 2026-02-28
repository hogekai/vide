## 6.2. Typical Initialization WorkFlow

The ideal user ad experience has the simultaneous start of media playback and display of the interactive overlay (the SIMID creative). Once the SIMID creative recieves the `Player:init` message, its may not yet be ready to display (for example it maybe be loading assets). To accommodate this latency, the player posts a `Player:init` message before ad media playback begins and waits for the SIMID iframe to respond with § 4.3.7.1 resolve.

The player should post `Player:init` as soon as the creative dispatches a `createSession` message (section § 8.4.1 Establishing a New Session) Normal Ad Initialization Sequence. SIMID creative code must be ready to process the `Player:init` message immediately.

After the player gets a resolve message Normal Ad Initialization Sequence, it initializes media playback at its discretion. Once media rendering begins, the player reports impression and posts § 4.3.10 SIMID:Player:startCreative.

**Normal Ad Initialization Sequence**

[Figure: A UML sequence diagram showing the interaction between three participants: "player", "creative", and "media". The sequence is as follows: (1) "createSession" «message» is sent from creative to player, with {immediate} timing from media. (2) "Player:init" «message» is sent from player to creative. (3) creative performs "process data()" internally with {latency}. (4) "resolve" «message» is sent from creative to player, with {infinity} timing from media. (5) player calls "play()" with a clock symbol indicating a timed action. (6) "playing" «event» is sent from media to player, with {latency} timing. (7) "impression" «tracker» is sent from player to a "metrics server" box, with {immediate} timing. (8) "Player:startCreative" «message» is sent from player to creative.]

1. Creative initializes the session.
2. Player posts `Player:init` message immediately upon session creation.
3. Creative proccesses initialization data and finalizes assets loading.
4. Creative responds with § 4.3.7.1 resolve.
5. Player starts media playback at its discretion.
6. Media renders.
7. Player reports impression.
8. Player posts § 4.3.10 SIMID:Player:startCreative immediately.