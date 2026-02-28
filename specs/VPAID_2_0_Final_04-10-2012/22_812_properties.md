## 8.1.2 Properties

The ad maintains properties described as part of the section 3.2. For the JavaScript implementation, the ad provides a getter, and if the property is settable, a setter function for each of the properties. Player uses property specific getter and setter functions to access the ad properties. For example, player gets/sets adVolume using the following functions implemented by the ad:

- getAdVolume() : Number
- setAdVolume( val : Number ) : void

If the property can only be read by the player but cannot be set by it, ad only provides a getter function. For example for adExpanded property, ad only provides following getter function:

- getAdExpanded() : Number

Same scheme is used for all of the other properties described in section 3.2.