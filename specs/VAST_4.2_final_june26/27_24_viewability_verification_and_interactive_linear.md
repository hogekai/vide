## 2.4 Viewability Verification and Interactive Linear Creative

VAST 4 adds new sections in the Linear file for viewability, ad verification, and interactive creative files. These new sections offer performance and measurement benefits but also add a level of complexity.

Player compliance with VAST 4 requires appropriate execution of these files.

The player should execute the ad in the following order:

1. Start loading verification resources.
2. Start loading video assets and interactive resources.
3. Initialize interactive resources.
4. Start ad playback.

Player expectations on these added features are summarized here and further defined in their corresponding sections.

### 2.4.1 Publisher Viewability

Publishers have the option to offer viewable impression tracking on the ad using the `<ViewableImpression>` feature added in VAST 4. Three URIs may be provided to track whether the ad was `<Viewable>`, `<NotViewable>`, or `<ViewUndetermined>` (see section 3.5).

Note that this feature is specific to (the likely uncommon) situation where the publisher is the party monitoring ad geometry and making the viewability determination. As such, it will very likely be limited to situations where the buyer and seller have some prior relationship and agreement around measurement mechanics and the viewability standard used. It is not a general replacement for, nor should it be confused with, measurement and reporting of viewability by third-party verification services (as in section 2.4.2). These URIs are not intended for reporting viewability determinations from such parties.

This feature is not applicable to audio ads.

### 2.4.2 Viewability with Ad Verification Services

Ad Verification services can be requested for measurement by adding a `<Verification>` element under `<AdVerifications>` including their executable resources and associated per-impression metadata. Multiple vendors may use this feature to measure the same ad session. All verification resources listed in the VAST should be executed, including those from any intermediary «Wrapper» VASTs, barring exceptions based on a whitelist or other pre-defined rules as outlined below.

A VAST 4 player must check for these elements, however, players may optionally either refuse to execute unknown resources or declare it as not supported. The recommended process is to consult an IAB TechLab-provided/certified list of known verification vendors and domains, although the exact mechanism is left to the publisher/player. The player must request each associated verificationNotExecuted tracking event URI (with the [REASON] macro filled with reason code 1) in the case that it refuses to execute one or more verification script (see section 3.17.4 for details).

Verification resources should be executed as required by the OMID specification. If the code cannot be executed as provided, any included verificationNotExecuted tracking events URIs must be sent with the appropriate reason code (e.g. not supported, error, etc.).

### 2.4.3 Interactive Linear Creative Files

In VAST 4, the `<MediaFile>` should only be used to include video or audio files. For Linear files that require an API framework to be executed, the new `<InteractiveCreativeFile>` should be used to include these files. Once the `<AdVerifications>` element has been checked for verification code, the `<InteractiveCreativeFile>` element should be checked for code in order to execute the ad. When the `<InteractiveCreativeFile>` cannot be executed, the `<Error>` should be sent and the player may check the `<MediaFiles>` element for any media files that are available to be played.

This script asset should only be used to enable interactive, dynamic or other creative capabilities and not used for viewability, client-side arbitration, or other non-creative uses.