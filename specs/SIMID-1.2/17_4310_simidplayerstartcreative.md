## 4.3.10. SIMID:Player:startCreative

See § 6.3 Typical Start Creative WorkFlow

The player posts `SIMID:Player:startCreative` message when it is ready to make the iframe visible. The player must transmit `Player:startCreative` as close to the first media frame rendering as possible. The player waits for a § 4.3.10.1 resolve response to display the SIMID iframe. The interactive creative should be ready to reply to `Player:startCreative` immediately.

§ 4.3.7 SIMID:Player:init section describes the flow that precedes the instant the player emits a `Player:startCreative` message.

### 4.3.10.1. resolve

By posting `resolve`, the interactive creative acknowledges that it is ready for display. The creative should be ready to respond immediately. The player makes the iframe visible upon a resolve receipt.

Refer to § 6.3 Typical Start Creative WorkFlow.

If the creative fails to reply with a `resolve` by the time ad media playback completes, the player reports VAST error tracker with the errorCode 1213. See § 9 Error Codes.

### 4.3.10.2. reject

When the creative responds with a reject, the player may unload the iframe. The player reports VAST error tracker with the `errorCode` the creative supplied.

```webidl
dictionary MessageArgs {
  required unsigned short errorCode;
  DOMString reason;
};
```

**errorCode,**

See § 9 Error Codes.

**reason,**

Additional information.