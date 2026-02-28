## 6.7. Nonlinear Initialization and Start WorkFlow

1. The player creates a hidden iframe and loads the creative. This can happen before the ad display time to preload the ad.
2. The creative will initialize a session.
3. If the creative doesn't initialize a session within a reasonable time, the player drops the creative and reports an error.
4. The player sends a § 4.3.7 SIMID:Player:init message with relevant parameters.
5. If the player can initialize, the creative responds with resolve.
6. If the creative responds with reject, or doesn't respond in time, the player drops the creative's iframe and reports an error.
7. When the player is ready to show the iframe, the player sends a § 4.3.10 SIMID:Player:startCreative message.
8. If the creative responds with reject, or doesn't respond in time, the player drops the creatives iframe and reports an error.
9. When the creative responds with resolve, the player makes the iframe visible.