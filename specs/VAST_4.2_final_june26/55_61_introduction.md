## 6.1 Introduction

Ad servers and other entities need access to additional data from the publisher to meet client needs for a clearer view into the details of how and where their video is being shown.

The following macros enable the media player to provide these additional data points. Some may need to be relayed from the publisher ad server to the player in turn before the player can pass them on.

The following overview outlines the various macros, in which contexts they are applicable and their meaning.

### Macro Formatting and Replacement

All macro names are surrounded by square brackets, for example: `[EXAMPLE]`. When replacing the macro with a value, the whole name - including brackets - needs to be replaced with the value.

For example, if you'd want to replace the `[EXAMPLE]` macro in the URL `https://mydomain.com/something?test=[EXAMPLE]` with the value `somevalue`, you would get `https://mydomain.com/something?test=somevalue`

### Macro Replacement Responsibility

The responsibility to properly replace macros with their proper values lies with the party that will perform the HTTP request.

In the most common scenario, both for VAST URLs and tracking pixel URLs, this would be the video player that's executing the ad.

In some cases a server might perform the macro replacement on behalf of the video player, for example in the case of server-side ad insertion where the server is performing tracking pixel requests on behalf of the client.

### Marking Macro Values as Unknown or Unavailable

For any macros that are marked as optional or deprecated and where the actual macro is not provided, the following special values must be inserted into the macro to indicate the reason for not providing the information:

| If the macro value is... | Then replace macro with... |
|---|---|
| Value is unknown, but would be shared if it was known | `-1` |
| Value is known, but information can't be shared because of policy (unwilling to share) | `-2` |

**Implementation Note:** do not replace all unknown macros with `-1`, only do this for macros specifically mentioned in this section that you decide not to implement.

### Macro Value URI Encoding

Some macros must be populated as a series of values rather than a single value. These macros use the `Array<T>` data type. This is a list of `T` values where `T` is another data type like `string` or `integer`. When replacing a macro with such a list, the value should be rendered as a set of values separated by a comma (","), and no spacing. For example: the values `stringA` and `stringB` would be encoded as `stringA,stringB`.

When replacing macros, make sure to apply `encodeURIComponent` to any value, to avoid creating invalid URLs. However, note that encoding should be applied to individual values only, not the entire macro replacement string (i.e. unencoded commas should separate distinct values).

For example, to encode the values `abc/def` and `y=z`, you'd replace the macro with `abc%2Fdef,y%3Dz`

Note that each individual value is properly encoded, but the comma between values is not.

In the examples given below, if the URI-encoded version differs from the unencoded original, both are given for the sake of clarity. However, **the encoded version must always be used as a macro substitution**.

**Note:** In order to ensure that new macros can be added without requiring a new VAST version at every change, we are maintaining the latest list on the IAB Tech Lab's VAST github repository. Please visit http://interactiveadvertisingbureau.github.io/vast/vast4macros/vast4-macros-latest.html for the latest list and for more details on the process of adding new macros.