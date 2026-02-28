## 3.5 ViewableImpression

TOC Schema

The ad server may provide URIs for tracking publisher-determined viewability, for both the InLine ad and any Wrappers, using the `<ViewableImpression>` element. Tracking URIs may be provided in three containers: `<Viewable>`, `<NotViewable>`, and `<ViewUndetermined>`.

The point at which these tracking resource files are pinged depends on the viewability standard the player has implemented, in agreement with or with the understanding of the buyer.

Player support for the `<ViewableImpression>` element is optional. When used, URIs for the Inline ad as well as any wrappers used to serve the ad should all be triggered at the same time, or as close in time as possible to when the criteria for the individual event is met.

Note – ViewableImpression is not applicable for Audio use cases.

| Player Support | Optional |
|---|---|
| Required in Response | No |
| Parent | InLine or Wrapper |
| Bounded | 0-1 |
| Sub-elements | Viewable |
| | NotViewable |
| | ViewUndetermined |
| **Attributes** | **Description** |
| id | An ad server id for the impression. Viewable impression resources of the same id should be requested at the same time, or as close in time as possible, to help prevent discrepancies. |

### 3.5.1 Viewable

TOC Schema

The `<Viewable>` element is used to place a URI that the player triggers if and when the ad meets criteria for a viewable video ad impression.

| Player Support | Optional |
|---|---|
| Required in Response | No |
| Parent | ViewableImpression |
| Bounded | 0+ |
| Content | A URI that directs the media player to a tracking resource file that the media player should request at the time that criteria is met for a viewable impression. |

### 3.5.2 NotViewable

TOC Schema

The `<NotViewable>` element is a container for placing a URI that the player triggers if the ad is executed but never meets criteria for a viewable video ad impression.

| Player Support | Optional |
|---|---|
| Required in Response | No |
| Parent | ViewableImpression |
| Bounded | 0+ |
| Content | A URI that directs the media player to a tracking resource file that the media player should request if the ad is executed and never meets criteria for a viewable impression. |

### 3.5.3 ViewUndetermined

TOC Schema

The `<ViewUndetermined>` element is a container for placing a URI that the player triggers if it cannot determine whether the ad has met criteria for a viewable video ad impression.

| Player Support | Optional |
|---|---|
| Required in Response | No |
| Parent | ViewableImpression |
| Bounded | 0+ |
| Content | A URI that directs the media player to a tracking resource file that the media player should request if the player cannot determine whether criteria is met for a viewable impression. |