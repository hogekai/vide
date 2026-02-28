## 6.6 Capabilities Info

| | |
|---|---|
| **Name** | `[VASTVERSIONS]` |
| **Type** | `Array<Integer>` |
| **Introduced In** | VAST 4.1 |
| **Support Status** | Optional |
| **Contexts** | VAST request URIs |
| **Description** | List of VAST versions supported by the player. Values are defined in the AdCOM 1.0 "Creative Subtypes" list. The relevant IDs have been copied here for convenience. - 11 for VAST 4.1 - 12 for VAST 4.1 Wrapper |
| **Example** | `3,3,5,6,7,8,11` |

| | |
|---|---|
| **Name** | `[APIFRAMEWORKS]` |
| **Type** | `Array<Integer>` |
| **Introduced In** | VAST 4.1 |
| **Support Status** | Optional |
| **Contexts** | VAST request URIs |
| **Description** | List of frameworks supported by the player. Values are defined in the AdCOM 1.0 "API Frameworks" list. |
| **Example** | `2,7` |

| | |
|---|---|
| **Name** | `[EXTENSIONS]` |
| **Type** | Array\<string\> |
| **Introduced In** | VAST 4.1 |
| **Support Status** | Optional |
| **Contexts** | VAST request URIs |
| **Description** | List of VAST Extensions type attribute values that the player / client supports. Can be used to indicate support for the OMID AdVerifications extension, proprietary extensions, or future standardized extensions. |
| **Example** | `AdVerifications,extensionA,extensionB` |

| | |
|---|---|
| **Name** | `[VERIFICATIONVENDORS]` |
| **Type** | Array\<string\> |
| **Introduced In** | VAST 4.1 |
| **Support Status** | Optional |
| **Contexts** | VAST request URIs |
| **Description** | List of VAST Verification vendor attribute values that the player / client supports. |
| **Example** | `moat.com-omid,ias.com-omid,doubleverify.com-omid` |

| | |
|---|---|
| **Name** | `[OMIDPARTNER]` |
| **Type** | string |
| **Introduced In** | VAST 4.1 |
| **Support Status** | Required (if OM is supported) |
| **Contexts** | All tracking pixels VAST request URIs |
| **Description** | An identifier of the OM SDK integration. This is the same as the "name" and "versionString" parameters of the OMID Partner object. This will allow creative providers to determine if the OM partner integration is acceptable. Note - This value is essential for communicating the certification status of the OMID integration. If partner ID is not shared, verification vendors will not be able to properly measure and report on this inventory. If partner name is not available, use "unknown". Required format: `{partner name}/{partner version}` |
| **Example** | Unencoded: `MyIntegrationPartner/7.1` Encoded: `MyIntegrationPartner%2F7.1` |

| | |
|---|---|
| **Name** | `[MEDIAMIME]` |
| **Type** | Array\<string\> |
| **Introduced In** | VAST 4.1 |
| **Support Status** | Optional |
| **Contexts** | VAST request URIs |
| **Description** | List of media MIME types supported by the player. |
| **Example** | Unencoded: `video/mp4,application/x-mpegURL` Encoded: `video%2Fmp4,application%2Fx-mpegURL` |

| | |
|---|---|
| **Name** | `[PLAYERCAPABILITIES]` |
| **Type** | Array\<string\> |
| **Introduced In** | VAST 4.1 |
| **Support Status** | Optional |
| **Contexts** | All tracking pixels VAST request URIs |
| **Description** | List of capabilities supported by the player. - `skip` to indicate the user's ability to skip the ad - `mute` to indicate the user's ability to mute/unmute audio - `autoplay` to indicate the player's ability to autoplay media with audio, also implies `mautoplay` - `mautoplay` to indicate the player's ability to autoplay media when muted - `fullscreen` to indicate the user's ability to enter fullscreen - `icon` to indicate the player's ability to render NAI icons from VAST |
| **Example** | `mautoplay,fullscreen,icon` |

| | |
|---|---|
| **Name** | `[CLICKTYPE]` |
| **Type** | integer |
| **Introduced In** | VAST 4.1 |
| **Support Status** | Optional |
| **Contexts** | All tracking pixels VAST request URIs |
| **Description** | Indicates the type of clickthrough supported by the player. 0: not clickable 1: clickable on full area of video 2: clickable only on associated button or link 3: clickable with confirmation dialog (3 supersedes 2 in the case that there is both a link and a confirmation dialog) |
| **Example** | `2` |