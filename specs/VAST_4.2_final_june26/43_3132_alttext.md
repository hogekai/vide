## 3.13.2 AltText

TOC Schema

The AltText element is used to provide a description of the companion creative when an ad viewer mouses over the ad.

| Player Support | Required if `<CompanionAds>` is supported |
|---|---|
| Required in Response | No |
| Parent | Companion for both InLine and Wrapper formats |
| Bounded | 0-1 |
| Content | A `string` to describe the creative when an ad viewer mouses over the ad. |

### 3.13.3 CompanionClickThrough

TOC Schema

Most companion creative can provide a clickthrough of their own, but in the case where the creative cannot provide a clickthrough, such as with a simple static image, the CompanionClickThrough element can be used to provide the clickthrough.

A clickthrough may need to be provided for an InLine ad in the following situations:

- Static image file
- Any static resource file where the media player handles the click, such as when "playerHandles=true" in a VPAID AdClickThru event.

| Player Support | Required if `<CompanionAds>` is supported |
|---|---|
| Required in Response | No |
| Parent | Companion for both InLine and Wrapper formats |
| Bounded | 0-1 |
| Content | A URI to the advertiser's page that the media player opens when the viewer clicks the companion ad. |

### 3.13.4 CompanionClickTracking

TOC Schema

When the companion ad creative handles the clickthrough in an InLine ad, the CompanionClickTracking element is used to track the click, provided the ad has a way to notify the player that that ad was clicked, such as when using a VPAID ad unit. The CompanionClickTracking element is also used in Wrappers to track clicks that occur for the Companion creative in the InLine ad that is returned after one or more wrappers.

CompanionClickTracking might be used for an InLine ad when:

- Any static resource file where the media player handles the click, such as when "playerHandles=true" in a VPAID AdClickThru event

CompanionClickTracking is used in a Wrapper in the following situations:

- Static image file. Any static resource file where the media player handles the click, such as when "playerHandlesClick=true" in VPAID
- Any static resource file where the media player handles the click, such as when "playerHandlesClick=true" in VPAID

| Player Support | Required if `<CompanionAds>` is supported |
|---|---|
| Required in Response | No |
| Parent | Companion for both InLine and Wrapper formats |
| Bounded | 0+ |
| Content | A URI to a tracking resource file used to track a companion clickthrough |
| Attributes | Description |

| id | An id provided by the ad server to track the click in reports. |
|---|---|