## 4.4.2. SIMID:Creative:collapseNonlinear

When the creative is ready to collapse, it posts a `Creative:collapseNonlinear` message. In response to `collapseNonlinear`, the player resizes the ad to its original state and resumes the content media playback.

*Creative:collapseNonlinear Handling*

[Figure: A sequence diagram showing the interaction between user, player, iframe, and media. 1) User calls click() on player. 2) A "collapse button event" is sent from iframe. 3) The player sends Creative:collapseNonlinear «message» to iframe, with an X mark on media. 4) Player calls resize(): collapse on iframe. 5) Player calls resume() on media. 6) Player sends resolve «message» back to iframe.]

1. User clicks on collapse button.
2. Creative posts § 4.4.2 SIMID:Creative:collapseNonlinear message.
3. Player resizes the creative to its original (default) dimensions.
4. Player resumes media playback.
5. Player posts § 4.4.2.1 resolve message.

### 4.4.2.1. resolve

When the player resizes the ad, it posts a resolve message.