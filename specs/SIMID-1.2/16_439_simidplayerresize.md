## 4.3.9. SIMID:Player:resize

When the player changes any of ad components' size, it posts the `SIMID:Player:resize` message. The message describes the media and creative sizes, independently, even if the dimensions are identical.

```webidl
dictionary MessageArgs {
  required Dimensions videoDimensions;
  required Dimensions creativeDimensions;
  required boolean fullscreen;
};
```

```webidl
dictionary Dimensions {
  required long x;
  required long y;
  required long width;
  required long height;
};
```

**`mediaDimensions,`**

Media element size and coordinates.

**`creativeDimensions,`**

SIMID iframe size and coordinates.\*

**`fullscreen,`**

Value is `true` when the ad is in fullscreen mode.

If the iframe is invisible at the time the player posts `resize` message, the parameter `creativeDimensions` communicates forthcoming values: iframe's size, and coordinates once it is displayed.