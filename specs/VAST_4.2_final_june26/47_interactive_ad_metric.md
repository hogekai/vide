# Interactive Ad Metric

- **interactiveStart:** With VAST 4, video playback and interactive creative playback now happens in parallel. Video playback and interactive creative start may not happen at the same time. A separate way of tracking the interactive creative start is needed. The interactive creative specification (SIMID, etc.) will define when this event should be fired.

## TrackingEvents

TOC Schema

The `<TrackingEvents>` element is available for `Linear`, `NonLinear`, and `Companion` elements in both InLine and Wrapper formats. When the media player detects that a specified event occurs, the media player is required to trigger the tracking resource URI provided in the nested `<Tracking>` element. When the server receives this request, it records the event and the time it occurred.

| Player Support | Required under supported ad types |
|---|---|
| Required in Response | No |
| Parent | Linear |
| | NonLinear |
| | Companion |
| Bounded | 0-1 |
| Sub-elements | Tracking |

## Tracking

TOC Schema

Each `<Tracking>` element is used to define a single event to be tracked. Multiple tracking elements may be used to define multiple events to be tracked, but may also be used to track events of the same type for multiple parties.

When using the progress event, an `offset` attribute for linear ads can be used to notify the ad server when the ad's progress has reached the identified percentage or time value indicated. When percentages are used, the progress event can offer tracking that represent the quartile events (`firstQuartile`, `midpoint`, `thirdQuartile`, and `complete`).

When skippable ads are supported, the progress event is used to identify when the ad counts as a view even if the ad is skipped. For example, if the tracking `offset` is set to 00:00:15 (15 seconds) but the ad is skipped after 20 seconds, then a `creativeView` event may be recorded for the Linear creative.

If adType is "audio" or "hybrid", progress events should be fired even if the media playback is in the background.

The `offset` attribute is only available for the `<Tracking>` element under `<Linear>`.

| Player Support | Required under supported ad types |
|---|---|
| Required in Response | No |
| Parent | TrackingEvents for both InLine and Wrapper formats |
| Bounded | 0+ |
| Content | A URI to the tracking resource for the event specified using the `event` attribute. |
| Attributes | |
| **event** | A string that defines the event being tracked. Accepted values are listed in section 3.14.1 and differ for `<Linear>`, `<NonLinear>`, and `<Companion>`. |
| **offset** | Only available when `<Linear>` is the parent. Accepts values of time in the format `HH:MM:SS.mmm` or as a percentage in the format `n%`. When the progress of the Linear creative has matched the value specified, the included URI is triggered. If the duration is not known when the offset is set to a percentage value, the progress event may be ignored. |