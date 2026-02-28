## 5 Human Readable VAST XML Schema

The following schema models the structure for VAST along with available attributes. Click the section number for more detail.

| Element | Attributes | Required | Section |
|---|---|---|---|
| **VAST** | version | Yes | 3.1 |
| /Error | | No | 3.3.1 |
| VAST/Ad | id, sequence, conditionalAd, adType | Yes | 3.4 |
| VAST/Ad/InLine | | Yes* | 3.4 |
| /AdSystem | version | Yes | 3.4.1 |
| /AdTitle | | Yes | 3.4.1 |
| /Impression | id | Yes | 3.4.3 |
| /AdServingId | | Yes | 3.4.3 |
| /Category | authority | No | 3.4.4 |
| /Description | | No | 3.4.5 |
| /Advertiser | id | No | 3.4.6 |
| /Pricing | model, currency | No | 3.4.7 |
| /Survey | type | No | 3.4.8 |
| /Error | | No | 3.4.11 |
| /Expires | | No | 3.4.10 |
| /ViewableImpression | id | No | 3.4.9 |
| /Viewable | | | |
| /NotViewable | | | |
| /ViewUndetermined | | | |
| /AdVerifications | | | |
| /Verification | vendor | No | 3.17.1 |
| /JavaScriptResource | apiFramework, browserOptional | | 3.17.2 |
| /ExecutableResource | apiFramework, language | No | 3.17.2 |
| /TrackingEvents | | | 3.17.3 |
| /Tracking | event | | |
| /VerificationParameters | | | |
| /Extensions | | No | 3.10 |
| /Extension | type | No | |
| /Creatives | | Yes | 3.5 |
| /Creative | id, sequence, adId, apiFramework | Yes | 3.7 |
| /UniversalAdId | idRegistry | | 3.7.1 |
| /CreativeExtensions | | | 3.7.4 |
| /CreativeExtension | type | | |
| /Linear | skipoffset | Yes (linear) | 3.7 |
| /Duration | | Yes | 3.7.1 |
| /AdParameters | xmlEncoded | No | 3.8 |
| /MediaFiles | | No | |
| /Mezzanine | delivery, type, width, height, codec, id, fileSize, mediaType | Yes (ad-stitching) | |
| /MediaFile | id, delivery, type, bitrate, minBitrate, maxBitrate, width, height, scalable, maintainAspectRatio, codec, apiFramework, fileSize, mediaType | Yes | 3.8.1 |
| /InteractiveCreativeFile | type, apiFramework, variableDuration | No | 3.9.2 |
| /ClosedCaptionFiles | | | |
| /ClosedCaptionFile | type, language | | |
| /VideoClicks | | No | 3.10 |
| /ClickThrough | id | No | |
| /ClickTracking | id | No | |
| /CustomClick | id | No | |
| /TrackingEvents | | No | |
| /Tracking | event, offset | | |
| /Icons | | Yes | 3.11 |
| /Icon | program, width, height, xPosition, yPosition, duration, offset, apiFramework, pxratio | | 3.11.1 |
| /StaticResource | creativeType (StaticResource only) | Yes | 3.11.1 |
| /IFrameResource | | | 3.11.1 |
| /HTMLResource | | | 3.11.1 |
| /IconClicks | | | |
| /IconClickThrough | | | 3.11.1 |
| /IconClickTracking | id | | 3.11.3 |
| /IconClickFallbackImages | | | |
| /IconClickFallbackImage | AltText, StaticResource | | |
| /IconViewTracking | | No | 3.11.3 |
| /NonLinearAds | | Yes (NonLinear ads) | |
| /NonLinear | id, width, height, expandedWidth, expandedHeight, scalable, maintainAspectRatio, minSuggestedDuration, apiFramework | No | 3.12.1 |
| /NonLinearClickThrough | | | |
| /NonLinearClickTracking | | | |
| /TrackingEvents | | | 3.12.2 |
| /Tracking | event | No | |
| /CompanionAds | required | No | 3.13 |
| /Companion | id, width, height, assetWidth, assetHeight, expandedWidth, expandedHeight, apiFramework, adSlotId, pxratio, renderingMode | No | |
| /StaticResource | creativeType (StaticResource only) | Yes | 3.15.1 |
| /IFrameResource | | | |
| /HTMLResource | | | |
| /AdParameters | xmlEncoded | No | 3.8 |
| /AltText | | No | 3.13.3 |
| /CompanionClickThrough | | No | |
| /CompanionClickTracking | id | No | |
| /TrackingEvents | | No | 3.14.5 |
| /Tracking | event | No | |

| Element | Attributes | Required | Section |
|---|---|---|---|
| **VAST/Ad/Wrapper** | followAdditionalWrappers, allowMultipleAds, fallbackOnNoAd | No* | 3.19 |
| /Impression | id | Yes | |
| /VASTAdTagURI | | Yes | 3.14.1 |
| /AdSystem | version | Yes | |
| /Pricing | model, currency | | |
| /Error | | No | |
| /ViewableImpression | id | No | |
| /Viewable | | | |
| /NotViewable | | | |
| /ViewUndetermined | | | |
| /AdVerifications | | | |
| /Verification | vendor | No | 3.17.1 |
| /JavaScriptResource | apiFramework, browserOptional | | |
| /ExecutableResource | apiFramework, language | No | |
| /TrackingEvents | | | |
| /Tracking | event | | |
| /VerificationParameters | | | |
| /BlockedAdCategories | authority | | |
| /Extensions | | No | |
| /Extension | type | No | |
| /Creatives | | No | |
| /Creative | id, sequence, adId | No | |
| /Linear | | Yes | |
| /TrackingEvents | | Yes | |
| /Tracking | event, offset | | |
| /VideoClicks | | | |
| /ClickTracking | id | No | |
| /CustomClick | id | No | |
| /ClickThrough | id | No | |
| /Icons | | | 3.11 |
| /Icon | program, width, height, xPosition, yPosition, duration, offset, apiFramework, pxratio | Yes | 3.11.5 |
| /StaticResource | creativeType (StaticResource only) | No | 3.11.2 |
| /IFrameResource | | | |
| /HTMLResource | | | |
| /IconClicks | | No | 3.11.6 |
| /IconClickThrough | | No | 3.11.7 |
| /IconClickTracking | id | No | 3.11.8 |
| /IconClickFallbackImages | | | 3.11.9 |
| /AltText | | | 3.11.9 |
| /StaticResource | | | |
| /IconViewTracking | | | 3.11.7 |
| /InteractiveCreativeFile | type, apiFramework, variableDuration | Yes | 3.10.3 |
| /NonLinearAds | | Yes | |
| /NonLinear | | | 3.12.1 |
| /NotLinearClickTracking | | No | 3.12.7 |
| /TrackingEvents | | No | |
| /Tracking | event | No | |
| /CompanionAds | required | No | |
| /Companion | id, width, height, assetWidth, assetHeight, expandedWidth, expandedHeight, apiFramework, adSlotId, pxratio, renderingMode | No | 3.13.1 |
| /StaticResource | creativeType (StaticResource only) | No | 3.11.2 |
| /IFrameResource | | | |
| /HTMLResource | | | |
| /AdParameters | xmlEncoded | No | |
| /AltText | | No | |
| /CompanionClickThrough | | No | |
| /CompanionClickTracking | id | No | |
| /TrackingEvents | | No | |
| /Tracking | event | No | |

\*Either the InLine element or the Wrapper element is required and only one is allowed.