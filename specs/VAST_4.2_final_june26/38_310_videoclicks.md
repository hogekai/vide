## 3.10 VideoClicks

TOC Schema

The `<VideoClicks>` element provides URIs for `clickthrough`, `clicktracking`, and `custom` clicks and is available for Linear Ads in both the InLine and Wrapper formats. Both InLine and Wrapper formats offer the ClickThrough, ClickTracking and CustomClick elements. These elements are defined in the following sections.

| Player Support | Required |
|---|---|
| Required in Response | No |
| Parent | Linear in both the InLine and Wrapper format |
| Bounded | 0-1 |
| Sub-elements | ClickThrough ClickTracking CustomClick |

### 3.10.1 ClickThrough

TOC Schema

The `<ClickThrough>` is a URI to the advertiser's site that the media player opens when a viewer clicks the ad. The clickthrough is available in the InLine and Wrapper formats and is used when the Linear ad unit cannot handle a clickthrough.

| Player Support | Required |
|---|---|
| Required in Response | One ClickThrough element is required if `<VideoClicks>` in the InLine format is used. |
| Parent | Linear in both the InLine and Wrapper format |
| Bounded | 0-1 (if `<VideoClicks>` is used) |
| Content | a URI to the advertiser's site that the media player opens when a viewer clicks the ad. |
| **Attributes** | **Description** |
| id | A unique ID for the clickthrough. |

### 3.10.2 ClickTracking

TOC Schema

Multiple `<ClickTracking>` elements can be used in the case where multiple parties would like to track the Linear ad clickthrough.

| Player Support | Required |
|---|---|
| Required in Response | No |
| Parent | Linear in both InLine and Wrapper formats. |
| Bounded | 0+ |
| Content | A URI for tracking when the ClickThrough is triggered. |
| **Attributes** | **Description** |
| id | A unique ID for the click to be tracked. |

### 3.10.3 CustomClick

TOC Schema

The `<CustomClick>` is used to track any interactions with the linear ad that do not include the clickthrough click and do not take the viewer away from the media player. For example, if an ad vendor wants to track that a viewer clicked a button to change the ad's background color, the `<CustomClick>` element holds the URI to notify the ad vendor that this click happened. An API may be needed to inform the player that a click occurred and that the corresponding URI should be activated.

| Player Support | Required |
|---|---|
| Required in Response | No |
| Parent | Linear in both Wrapper and InLine formats. |
| Bounded | 0+ |
| Content | A URI for tracking custom interactions. |
| **Attributes** | **Description** |
| id | A unique ID for the custom click to be tracked. |