## 3.12 NonLinearAds

TOC Schema

NonLinear ads are the overlay ads that display as an image or rich media on top of video content during playback. Within an InLine ad, at least one of `<Linear>` or `<NonLinearAds>` needs to be provided within the `<Creative>` element.

NonLinearAds are not applicable to Audio use cases.

The `<NonLinearAds>` element is a container for the `<NonLinear>` creative files and tracking resources. If used in a wrapper, only the tracking elements are available. NonLinear creative cannot be provided in a wrapper ad. NonLinear ad creative use non-video creative files that are described in section 3.7. Tracking event elements are described in section 3.13. Ad parameters are used to provide contextual information to the ad and are described in section 3.6.5.

| Player Support | Optional (either `<Linear>` or `<NonLinearAds>` must be supported) |
|---|---|
| Required in Response | At least one of Linear or NonLinearAds is required. |
| Parent | Creative for both InLine and Wrapper formats |
| Bounded | 0-1 |
| Sub-elements | NonLinear |
| | TrackingEvents |

### 3.12.1 NonLinear

TOC Schema

Each `<NonLinear>` element may provide different versions of the same creative using the `<StaticResource>`, `<IFrameResource>`, and `<HTMLResource>` elements in the InLine VAST response. In a Wrapper response, only tracking elements may be provided.

| Player Support | Required if `<NonLinearAds>` is supported |
|---|---|
| Required in Response | Yes if `<NonLinearAds>` is provided |
| Parent | NonLinearAds for both InLine and Wrapper formats |
| Bounded | 1+ (if `<NonLinearAds>` is used) |
| Sub-elements | StaticResource (InLine only) |
| | IFrameResource (InLine only) |
| | HTMLResource (InLine only) |
| | AdParameters (InLine only) |
| | NonLinearClickThrough (InLine only) |
| | NonLinearClickTracking (InLine and Wrapper) |

| Attributes | Description |
|---|---|
| id | An optional identifier for the creative. |
| width* | The pixel width of the placement slot for which the creative is intended. |
| height* | The pixel height of the placement slot for which the creative is intended. |
| expandedWidth | The maximum pixel width of the creative in its expanded state. |
| expandedHeight | The maximum pixel height of the creative in its expanded state. |
| scalable | Identifies whether the creative can scale to new dimensions relative to the video player when the video player is resized. |
| maintainAspectRatio | Identifies whether the aspect ratio of the creative should be maintained when it is scaled to new dimensions as the video player is resized. |
| apiFramework | The API necessary to communicate with the creative if available. |
| minSuggestedDuration | The minimum suggested duration that the creative should be displayed; duration is in the format HH:MM:SS.mmm (where .mmm is in milliseconds and is optional). |

### 3.12.2 NonLinearClickThrough

TOC Schema

Most NonLinear creative can provide a clickthrough of their own, but in the case where the creative cannot provide a clickthrough, such as with a simple static image, the `<NonLinearClickThrough>` element can be used to provide the clickthrough.

A clickthrough may need to be provided for an InLine ad in the following situations:

- Static image file
- Any static resource file where the media player handles the click, such as when "playerHandles=true" in a VPAID AdClickThru event.

`NonLinearClickThrough` is only available for InLine ads.

| Player Support | Required if `<NonLinearAds>` is supported |
|---|---|
| Required in Response | No |
| Parent | NonLinear only in InLine format |
| Bounded | 0-1 |
| Content | A URI to the advertiser's page that the media player opens when the viewer clicks the NonLinear ad. |

### 3.12.3 NonLinearClickTracking

TOC Schema

When the NonLinear ad creative handles the clickthrough in an InLine ad, the `<NonLinearClickTracking>` element is used to track the click, provided the ad has a way to notify the player that the ad was clicked, such as when using a VPAID ad unit. The NonLinearClickTracking element is also used to track clicks in Wrappers.

NonLinearClickTracking might be used for an InLine ad when:

- Any static resource file where the media player handles the click, such as when "playerHandles=true" in a VPAID AdClickThru event.

NonLinearClickTracking is used in a Wrapper Ad in the following situations:

- Static image file
- Flash file with no API framework (deprecated)
- Flash file in which apiFramework=clickTAG (deprecated)
- Any static resource file where the media player handles the click, such as when "playerHandles=true" in a VPAID AdClickThru event

| Player Support | Required if `<NonLinearAds>` is supported |
|---|---|
| Required in Response | No |
| Parent | NonLinear for both InLine and Wrapper formats |
| Bounded | 0+ |
| Content | A URI to a tracking resource file used to track a NonLinear clickthrough |

| Attributes | Description |
|---|---|
| id | An id provided by the ad server to track the click in reports. |