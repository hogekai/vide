## 9. Error Codes

The table below is the list of error codes the player and the creative use with `reject` messages. SIMID allocates the range `1100–1199` to the errors that the creative reports; the range `1200–1299` to the errors the player reports.

**Error Codes.**

| Error Code | Error Type | Description |
|---|---|---|
| 1100 | Unspecified error. | Catchall error if the creative could not find a matching error code. The creative should be more specific in the error message. |
| 1101 | Resources could not be loaded. | The SIMID creative tried to load resources but failed. |
| 1102 | Playback area not usable by creative. | The dimensions the creative needed were not what it received. |
| 1103 | Wrong SIMID version. | The creative could not support the players version. |
| 1104 | Creative not playable for a technical reason on this site. | |
| 1105 | Request for expand not honored. | The creative requested to expand the media player but the player did not allow it. |
| 1106 | Request for pause not honored. | The creative posted § 4.4.13 SIMID.Creative.requestPause but the player did not pause. |
| 1107 | Play mode not adequate for creative. | The creative requires playback control but the player is not giving control. This error should only fire if the VAST for the ad specified that it needs playback control. |
| 1108 | Ad internal error. | The creative had an error not related to any external dependencies. |
| 1109 | Device not supported. | The creative could not play or render on the device. |
| 1110 | The player is not following the spec in the way it sends messages. | |
| 1111 | The player is not responding adequately to messages. | |
| 1200 | Unspecified error. | Catchall error if the player could not find a matching error code. The player should be more specific in the error message. |
| 1201 | Wrong SIMID version. | The player could not support the creatives version. |
| 1202 | The creative is requesting more time than the player is willing to support. | |
| 1203 | The creative is requesting more functionality than the player is willing to support. | |
| 1204 | The creative is doing actions not supported on this site. | |
| 1205 | The creative is overloading the postmessage channel. | |
| 1206 | The SIMID media could not be loaded. | |
| 1207 | Media Timeout. | The ad media creative buffered for too long and timed out. |
| 1208 | The creative is taking too long to resolve or reject messages. | |
| 1209 | The SIMID media from the VAST response is not supported on this device. | |
| 1210 | The creative is not following the spec when initializing. | |
| 1211 | The creative is not following the spec in the way it sends messages. | |
| 1212 | The creative did not reply to the § 4.3.7 SIMID.Player.init message. | |
| 1213 | The creative did not reply to the § 4.3.10 SIMID.Player.startCreative message. | |
| 1214 | Environment does not support navigation. | The creative posted § 4.4.12 SIMID.Creative.requestNavigation, but the environment doesn't support it. The creative should be opening the navigation window. |
| 1215 | Navigation not possible at all on this device. | The creative posted § 4.4.12 SIMID.Creative.requestNavigation. However, navigation window opening is not possible at all on this device. |
| 1216 | Too many calls to § 4.4.12 SIMID.Creative.requestNavigation. | The creative asked for request navigation too many times and call will be blocked. |
| 1217 | Invalid navigation request URL. | The posted § 4.4.12 SIMID.Creative.requestNavigation with invalid url. |
| 1218 | Invalid navigation request app. | The creative requested a play store/app store url but that is not valid on this device. |
| 1219 | Extra clickthrough blocked. | Clickthrough has been reported once, but the creative has requested clickthrough again. No click through will be reported. |
| 1220 | Nonlinear expansion not possible due to problem pausing the media. | Player is rejecting § 4.4.3 SIMID.Creative.expandNonlinear because it cannot pause media. The player should have informed creative it cannot pause the media on § 4.3.7 SIMID.Player.init. |
| 1221 | Nonlinear expansion rejected by user. | The user has indicated that the ad should be collapsed so the player will not allow a nonlinear expansion. |
| 1222 | Player received excessive number of § 4.4.3 SIMID.Creative.expandNonlinear messages. | The player limits a number of nonlinear ad expands and that limit has been exceeded. |
| 1223 | Session not created. | The creative did not create a session. This error could be triggered after a timeout or upon the end of the media playback. |