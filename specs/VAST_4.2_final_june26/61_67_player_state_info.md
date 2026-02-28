## 6.7 Player State Info

| | |
|---|---|
| **Name** | `[PLAYERSTATE]` |
| **Type** | Array\<string\> |
| **Introduced In** | VAST 4.1 |
| **Support Status** | Optional |
| **Contexts** | All tracking pixels |
| **Description** | List of options indicating the current state of the player. Possible values: |
| | - `muted` to indicate the player is currently muted |
| | - `fullscreen` to indicate the player is currently fullscreen |
| **Example** | `muted,fullscreen` |

| | |
|---|---|
| **Name** | `[INVENTORYSTATE]` |
| **Type** | Array\<string\> |
| **Introduced In** | VAST 4.1 |
| **Support Status** | Optional |
| **Contexts** | All tracking pixels<br>VAST request URIs |
| **Description** | List of options indicating attributes of the inventory. Possible values: |
| | - `skippable` to indicate the ad can be skipped |
| | - `autoplayed` to indicate the ad is autoplayed with audio unmuted |
| | - `mautoplayed` to indicate the ad is autoplayed with audio muted |
| | - `optin` to indicate the user takes an explicit action to knowingly start playback of the ad |
| **Example** | `autoplayed,fullscreen` |

| | |
|---|---|
| **Name** | `[PLAYERSIZE]` |
| **Type** | integer,integer |
| **Introduced In** | VAST 4.1 |
| **Support Status** | Optional |
| **Contexts** | All tracking pixels<br>VAST request URIs |
| **Description** | Integer width and height of the player, separated by a ",", measured in css pixels (device-independent) |
| **Example** | `640,360` |

| | |
|---|---|
| **Name** | `[ADPLAYHEAD]` |
| **Type** | timecode |
| **Introduced In** | VAST 4.1 |
| **Support Status** | Optional |
| **Contexts** | All tracking pixels |
| **Description** | Playhead for ad video or audio. Replaced with the current time offset "HH:MM:SS.mmm". |
| **Example** | Unencoded: `00:00:11.355`<br>Encoded: `00%3A00%3A11.355` |

| | |
|---|---|
| **Name** | `[ASSETURI]` |
| **Type** | string |
| **Introduced In** | VAST 3.0 |
| **Support Status** | Optional |
| **Contexts** | All tracking pixels |
| **Description** | The URI of the ad asset currently being played |
| **Example** | Unencoded:<br>`https://myadserver.com/video.mp4`<br>Encoded:<br>`https%3A%2F%2Fmyadserver.com%2Fvideo.mp4` |

| | |
|---|---|
| **Name** | `[CONTENTID]` |
| **Type** | string |
| **Introduced In** | VAST 4.1 |
| **Support Status** | Optional |
| **Contexts** | All tracking pixels<br>VAST request URIs |
| **Description** | The publisher-specific content identifier for the content asset into which the ad is being loaded or inserted. Only applicable to in-stream ads.<br><br>The format of this field is similar to the `[UNIVERSALADID]` macro, consisting of a registry identifier and a registry-specific content identifier. If you are not using a public registry, you can use your own domain name as the registry identifier.<br><br>If this macro is provided, the provided content identifier should uniquely define a specific content asset.<br><br>Format: `registry_id id_value` - with a space separating `registry_id` and `id_value`. |
| **Example** | Unencoded:<br>`my-domain.com my-video-123`<br><br>Encoded:<br>`my-domain.com%20my-video-123` |

| | |
|---|---|
| **Name** | `[CONTENTURI]` |
| **Type** | string |
| **Introduced In** | VAST 4.1 |
| **Support Status** | Optional |
| **Contexts** | All tracking pixels<br>VAST request URIs |
| **Description** | The URI of the main media content asset into which the ad is being loaded or inserted. Only applicable to in-stream ads. |
| **Example** | Unencoded:<br>`https://mycontentserver.com/video.mp4`<br><br>Encoded:<br>`https%3A%2F%2Fmycontentserver.com%2Fvideo.mp4` |

| | |
|---|---|
| **Name** | `[PODSEQUENCE]` |
| **Type** | `integer` |
| **Introduced In** | VAST 4.1 |
| **Support Status** | Optional |
| **Contexts** | All tracking pixels |
| **Description** | The value of the sequence attribute on the `<Ad>` that is currently playing, if one is provided |
| **Example** | `1` |

| | |
|---|---|
| **Name** | `[ADSERVINGID]` |
| **Type** | `string` |
| **Introduced In** | VAST 4.1 |
| **Support Status** | Optional |
| **Contexts** | All tracking pixels |
| **Description** | The value of the `<AdServingId>` for the currently playing ad, as passed from the ad server. |
| **Example** | `ServerName-47ed3bac-1768-4b9a-9d0e-0b92422ab066` |