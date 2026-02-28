## 4.4.3. SIMID:Creative:expandNonlinear

The creative posts `Creative:expandNonlinear` when a user wants to expand the ad (by clicking expand control/button that the default creative provides). Auto-expand is strongly discouraged and goes against industry guidelines.

Under normal circumstances, the player pauses the media. In cases when the content is video, the player resizes the creative iframe to the dimensions of the video and places the expanded creative at video zero coordinates.

If the player communicates to the creative that it has no capacity to expand the ad with §4.3.7 SIMID:Player:init message, the creative does not provide an expand button or post the `Creative:expandNonlinear` message.

*Creative:expandNonlinear Handling*

[Figure: A sequence diagram with four participants: user, player, iframe, and media. The flow is as follows:
1. User performs click() on player.
2. An "expand button event" occurs on the iframe.
3. iframe sends "Creative:expandNonlinear «message»" to player (labeled 2).
4. Player sends "pause()" to media (labeled 3).
5. Player sends "resize(): expand" to iframe (labeled 4).
6. Player sends "resolve «message»" to iframe (labeled 5).]

1. User clicks on expand button.
2. Creative posts §4.4.3 SIMID:Creative:expandNonlinear message.
3. Player pauses media.
4. Player resizes the creative to its expanded dimensions.
5. Player posts §4.4.3.1 resolve message.

### 4.4.3.1. resolve

Once the player resizes the ad, it posts a `resolve` message. The player provides the expanded size dimensions and position with the resolve message.args

```webidl
dictionary MessageArgs {
  required Dimensions creativeDimensions;
};

dictionary Dimensions {
  required long x;
  required long y;
  required long width;
  required long height;
};
```

**creativeDimensions,**

SIMID iframe size and coordinates.

### 4.4.3.2. reject

If the player declines the expansion request, it posts a `reject` message.