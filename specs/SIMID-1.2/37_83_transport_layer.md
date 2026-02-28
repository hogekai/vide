## 8.3. Transport Layer

Transport is a communication mechanism that can send serialized messages between two parties.

### 8.3.1. postMessage Transport

In HTML environments, where the player loads creative overlay in a cross-origin iframe, the parties utilize the standard `Window.postMessage()` API as the message transport mechanism.

### 8.3.2. Message Serialization

The message sender serializes data into a `JSON` string. The deserialized `JSON` must result in a clone of the original Message data object.

In JavaScript, `JSON.stringify()` performs serialization; `JSON.parse()` - deserialization.