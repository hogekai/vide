## 3.14 Tracking Event Elements

TOC Schema

The `<TrackingEvents>` element is a container for `<Tracking>` elements used to define specific tracking events described in section 3.14.1. Multiple tracking events can be used to help all the relevant parties track the ad's performance. Each tracking event URI should be included one `<Tracking>` element, using the `event` attribute to identify which event is to be tracked.

The following example shows the section of a VAST response that represents 3 tracking events: two start events, each for a different server, and a complete event.

```xml
<TrackingEvents>
  <Tracking event="start">
    <![CDATA[http://server1.com/start.jpg]]>
  </Tracking>
  <Tracking event="start">
    <![CDATA[http://server2.com/start2.jpg]]>
  </Tracking>
  <Tracking event="progress" offset="5">
    <![CDATA[http://server1.com/progress.jpg]]>
  </Tracking>

  <Tracking event="complete">
    <![CDATA[http://server1.com/complete.jpg]]>
  </Tracking>
</TrackingEvents>
```

### 3.14.1 Tracking Event Descriptions

TOC Schema

VAST is used to track a number of ad events using the `<TrackingEvents>` and `<Tracking>` elements. Tracking for impressions is covered in section 3.4 and clickthroughs are covered in their relevant sections. Review the schema in section 6 to find more details about tracking the different ad types in VAST. Each `<Tracking>` element contains a URI for the tracking resource of one event. The media player uses these URIs to notify the ad server when the identified event occurs.

In some cases the media player cannot detect that an event has occurred unless a third party, such as the ad creative or a verification script, communicates the event through a framework such as OMID or VPAID. For example, the `adExpand` event for NonLinear ads requires the ad to notify the media player that it has expanded. In such cases, the player must support these tracking events to the extent that they support the individual frameworks.

The following list of metrics is derived from the *IAB Digital Video In-Stream Ad Metric Definitions* where more detailed metric definitions can be found.

The values accepted for tracking events are described in the following list:

**Player Operation Metrics (for use in Linear and NonLinear Ads)**

- **mute:** the user activated the mute control and muted the creative.
- **unmute:** the user activated the mute control and unmuted the creative.
- **pause:** the user clicked the pause control and stopped the creative.
- **resume:** the user activated the resume control after the creative had been stopped or paused.
- **rewind:** the user activated the rewind control to access a previous point in the creative timeline.
- **skip:** the user activated a skip control to skip the creative.
- **playerExpand:** the user activated a control to extend the player to a larger size. This event replaces the fullscreen event per the 2014 Digital Video In-Stream Ad Metric Definitions.
- **playerCollapse:** the user activated a control to reduce player to a smaller size. This event replaces the exitFullscreen event per the 2014 Digital Video In-Stream Ad Metric Definitions.
- **notUsed:** This ad was not and will not be played (e.g. it was prefetched for a particular ad break but was not chosen for playback). This allows ad servers to reuse an ad earlier than otherwise would be possible due to budget/frequency capping. This is a terminal event; no other tracking events should be sent when this is used. Player support is **optional** and if implemented is provided on a best effort basis as it is not technically possible to fire this event for every unused ad (e.g. when the player itself is terminated before playback).

**Linear Ad Metrics**

- **loaded:** This event should be used to indicate when the player considers that it has loaded and buffered the creative's media and assets either fully or to the extent that it is ready to play the media.
- **start:** This event is used to indicate that an individual creative within the ad was loaded and playback began. As with creativeView, this event is another way of tracking creative playback. Macros defined to describe auto-play and muted states.
- **firstQuartile:** The creative played continuously for at least 25% of the total duration at normal speed.
- **midpoint:** The creative played continuously for at least 50% of the total duration at normal speed.
- **thirdQuartile:** The creative played continuously for at least 75% of the duration at normal speed.
- **complete:** The creative was played to the end at normal speed so that 100% of the creative was played.
- **otherAdInteraction:** An optional metric that can capture all other user interactions under one metric such as hover-overs, or custom clicks. It should NOT replace clickthrough events or other existing events like mute, unmute, pause, etc.
- **progress:** The creative played for a duration at normal speed that is equal to or greater than the value provided in an additional `offset` attribute for the `<Tracking>` element under Linear ads. Values can be time in the format `HH:MM:SS.mmm` or a percentage value in the format `n%`. Multiple progress events with different values can be used to track multiple progress points in the linear creative timeline. This event can be used in addition to, or instead of, the "quartile" events (`firstQuartile`, `midpoint`, `thirdQuartile`, `complete`). The additional `<Tracking>` `offset` value can be used to help track a view when an agreed upon duration or percentage of the ad has played.
- **closeLinear:** The viewer has chosen to close the linear ad unit. This is currently in-use by some of the largest mobile SDKs to mark the dismissal of the end card companion that follows the video, as well as a close of the video itself, if applicable.