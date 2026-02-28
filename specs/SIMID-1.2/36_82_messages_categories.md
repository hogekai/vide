## 8.2. Messages Categories

The protocol defines two message classes:

- **Primary** messages - the signals triggered by the sender's internal logic.
- **Response** messages - the signals the receiver transmits as acknowledgments of the primary message receipt and processing. There are two response Message types: § 8.2.1 resolve Messages and § 8.2.2 reject Messages.

Both primary and response messages implement the same data structure (see § 8.1.1 Data Structure).

### 8.2.1. resolve Messages

The receiver confirms successful message processing by replying with a resolution message.

Message.type **must be** `resolve`.

Message.args **must be a** `ResolveMessageArgs` **object**:

```webidl
dictionary ResolveMessageArgs {
    required unsigned long messageId;
    any value;
};
```

**messageId,**

The value of the messageId attribute of the message to which the receiver responds.

**value,**

Additional data associated with this `resolve` message.

**Example of `resolve` message:**

```json
{
    sessionId: "173378a4-b2e1-11e9-a2a3-2a2ae2dbcce4",
    messageId: 14,
    timestamp: 1564501643047,
    type: "resolve",
    args: {
        messageId: 5,
        value: {
            id: 45
        }
    }
}
```

### 8.2.2. reject Messages

When the receiver is unable to process the message, it responds with rejection.

Message.type **must be** `reject`.

Message.args.value **must be a** `RejectMessageArgsValue` **object**:

```webidl
dictionary RejectMessageArgsValue {
    unsigned long errorCode;
    DOMString message;
};
```

**errorCode,**

The error code associated with the reason the receiver `rejects` the message.

**message,**

Additional information.

**Example of `reject` message:**

```json
{
    sessionId: "173378a4-b2e1-11e9-a2a3-2a2ae2dbcce4",
    messageId: 10,
    timestamp: 1564501643047,
    type: "resolve",
    args: {
        messageId: 5,
        value: {
            errorCode: 902,
            message: "The feature is not available."
        }
    }
}
```