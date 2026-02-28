## 3.8 Linear

Linear Ads are the video or audio formatted ads that play linearly within the streaming content, meaning before the streaming content, during a break, or after the streaming content. A Linear creative contains a `<Duration>` element to communicate the intended runtime and a `<MediaFiles>` element used to provide the needed video or audio files for ad execution.

| | |
|---|---|
| Player Support | Required |
| Required in Response | Yes |
| Parent | Creative for both InLine and Wrapper formats |
| Bounded | 0-1 |
| Sub-elements | Duration\* |
| | MediaFiles\* |
| | AdParameters |
| | TrackingEvents |
| | VideoClicks |
| | Icons |
| Attributes | Description |
| **skipoffset** | Time value that identifies when skip controls are made available to the end user; publisher may define a minimum `skipoffset` value in its policies and disregard Skippable creative when `skipoffset` values are lower than publisher's minimum. |

\*required

### 3.8.1 Duration

The ad server uses the `<Duration>` element to denote the intended playback duration for the video or audio component of the ad. Time value may be in the format HH:MM:SS.mmm where .mmm indicates milliseconds. Providing milliseconds is optional.

| | |
|---|---|
| Player Support | Required |
| Required in Response | Yes |
| Parent | Linear only in the InLine format |
| Bounded | 1 |
| Content | A time value for the duration of the Linear ad in the format HH:MM:SS.mmm (.mmm is optional and indicates milliseconds). |

### 3.8.2 AdParameters

Some ad serving systems may want to send data to the media file when first initialized. For example, the media file may use ad server data to identify the context used to display the creative, what server to talk to, or even which creative to display. The optional `<AdParameters>` element for the Linear creative enables this data exchange.

The optional attribute `xmlEncoded` is available for the `<AdParameters>` element to identify whether the ad parameters are xml-encoded. If true, the media player can only decode the data using XML. Media players operating on earlier versions of VAST may not be able to XML-decode data, so data should only be xml-encoded when being served to media players capable of XML-decoding the data.

When a VAST response is used to serve a VPAID ad unit, the `<AdParameters>` element is currently the only way to pass information from the VAST response into the VPAID object; no other mechanism is provided.

| | |
|---|---|
| Player Support | Required |
| Required in Response | No |
| Parent | Linear only in the InLine format |
| | Companion for both InLine and Wrapper formats |
| Bounded | 0-1 |
| Content | Metadata for the ad. |
| Attributes | |
| **xmlEncoded** | Identifies whether the ad parameters are xml-encoded. |