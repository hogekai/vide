# 3.13.1 Companion

Both InLine and Wrapper VAST responses may contain multiple companion items where each one may contain one or more creative resource files using the elements: `StaticResource`, `IFrameResource`, and `HTMLResource`. Each `<Companion>` element may provide different versions of the same creative.

The resource elements for providing creative resources are defined in section 3.11. Tracking elements are also available for each companion element. Ad parameters are used to provide contextual information to the ad and are described in section 3.13.5.

| Player Support | Required if `<CompanionAds>` is supported |
|---|---|
| Required in Response | At least one Companion is required if `CompanionAds` is provided |
| Parent | CompanionAds for both InLine and Wrapper formats |
| Bounded | 1+ if `<CompanionAds>` is used |
| Sub-elements | StaticResource |
| | IFrameResource |
| | HTMLResource |
| | AdParameters |
| | AltText |
| | CompanionClickThrough |
| | CompanionClickTracking |
| | TrackingEvents |

| **Attributes** | |
|---|---|
| **width\*** | The pixel width of the placement slot for which the creative is intended. |
| **height\*** | The pixel height of the placement slot for which the creative is intended. |
| **id** | An optional identifier for the creative. |
| **assetWidth** | The pixel width of the creative. |
| **assetHeight** | The pixel height of the creative. |
| **expandedWidth** | The maximum pixel width of the creative in its expanded state. |
| **expandedHeight** | The maximum pixel height of the creative in its expanded state. |
| **apiFramework** | The API necessary to communicate with the creative if available. |
| **adSlotId** | Used to identify desired placement on a publisher's page. Values to be used should be discussed between publishers and advertisers. |
| **pxratio** | The pixel ratio for which the companion creative is intended. The pixel ratio is the ratio of physical pixels on the device to the device-independent pixels. An ad intended for display on a device with a pixel ratio that is twice that of a standard 1:1 pixel ratio would use the value "2." Default value is 1. |
| **renderingMode** | Used to indicate when and where to use this companion ad. Values can be "default" or "end-card" or "concurrent". If this field is empty or not given, "default" will be used. |

\*required