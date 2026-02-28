## 4.4.4. SIMID:Creative:fatalError

The creative posts `SIMID:Creative:fatalError` in cases when its internal exceptions prevent the interactive component from further execution. In response to the `Creative:fatalError` message, the player unloads the SIMID iframe and reports VAST error tracker with the `errorCode` specified by the creative. The ad media playback must stop, if possible.

```webidl
dictionary MessageArgs{
  required unsigned short errorCode;
  DOMString errorMessage;
};
```

**errorCode,**

See §9 Error Codes.

**errorMessage,**

Additional information.