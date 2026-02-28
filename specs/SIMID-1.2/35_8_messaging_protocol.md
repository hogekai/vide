## 8. Messaging Protocol

In SIMID, the media player and the creative overlay communicate by exchanging asynchronous signals that maintain a custom messaging protocol. This protocol governs § 8.1 Data Layer, § 8.3 Transport Layer, and § 8.4 Session Layer.

### 8.1. Data Layer

SIMID messages transport data. In HTML environments, the data is the `message` argument of the `Window.postMessage()` function.

#### 8.1.1. Data Structure

The `message` data implements the following data structure:

```webidl
dictionary Message {
  required DOMString sessionId;
  required unsigned long messageId;
  required unsigned long timestamp;
  required DOMString type;
  any args;
};
```

**sessionId,**

A string that uniquely identifies the session to which Message belongs. See § 8.4 Session Layer.

**messageId,**

A message sequence number in the sender's system. Each participant establishes its own independent sequence counter for the session. The first message `messageId` value is `0`. The sender increments each subsequent messageId value by `1`. In practice, this means that the creative and the player `messageId` values will be different based on the number of sent messages.

**timestamp,**

A number of milliseconds since January 1, 1970, 00:00:00 UTC (Epoch time). The message sender must set `timestamp` value as close as possible to the moment the underlying process occurs. However, the receiver should not assume that the `timestamp` value reflects the exact instant the message-triggering event occurred.

**type,**

A string that describes the message-underlying event and informs the receiver how to interpret the `args` parameter.

**args,**

Additional information associated with the message `type`.

Example of message data:

```json
{
    sessionId: "173378a4-b2e1-11e9-a2a3-2a2ae2dbcce4",
    messageId: 16,
    timestamp: 1564501643047,
    type: "SIMID:Player:adStopped",
    args: {
        code: 0
    }
}
```