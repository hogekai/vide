## 4.3.8. SIMID:Player:log

The purpose of the Player:log message is to convey optional, primarily debugging, information to the creative.

Note: In SIMID prefixing log messages with "WARNING:" has a specific meaning. The player is communicating performance inefficiencies or specification deviations aimed at creative developers. For example, if the creative sends the requestChangeVolume message but does not use the correct parameters, a "WARNING:" message is appropriate.

```webidl
dictionary MessageArgs {
  required DOMString message;
};
```

**`message,`**

Logging information.