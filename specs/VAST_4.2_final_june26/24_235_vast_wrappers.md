## 2.3.5 VAST Wrappers

Wrappers provide a way for one ad server to redirect a media player to another, secondary ad server to retrieve an ad, multiple ads, or yet another VAST Wrapper.

One ad server may redirect to another for a variety of reasons:

- The first ad server has selected a specific advertiser campaign to fill the inventory. In this case the redirect instructs the secondary ad server to return specific ads from a particular ad campaign.
- The first ad server is delegating a specific piece of inventory for either a single ad or an entire Pod of ads to the secondary ad server to fill with any ads that are within an established agreement between the two parties.
- An ad server may wish to delegate delivery of the specific ad creative file(s) to a separate asset repository/host (ad cloud).
- An ad server may have no ad to return and may return a redirect to a backfill provider.

### 2.3.5.1 Infinite Loops and Dead Ends

When serving an ad involves a chain of Wrappers, an infinite loop is possible where a chain of Wrappers never results in a final InLine VAST response. Another case involves a finite number of VAST Wrappers in which the resulting InLine response is used as a decisioning mechanism to find an ad instead of delivering the ad as required. In these cases, the decisioning mechanism may never return an ad or may take too long to return the ad.

In general, VAST Wrappers should be limited to five before resulting in an InLine response. If the player detects more than five Wrappers, the player may reject any subsequent responses in the chain, replace the [ERRORCODE] macro in the VAST/Ad/Wrapper/Error URI if provided to indicate that the Wrapper limit was reached, and move on to the next option for an ad. Error codes should be sent for all wrappers in the chain where provided.

When an InLine response fails to produce an ad within the timeframe identified in VPAID or other ad framework, the player may reject the ad, send error code 304 to indicate that no ad was produced in the given timeframe, and move on to the next option for an ad. Error codes should also be sent to any wrappers preceding the InLine response.

### 2.3.5.2 Wrapper Conflict Management and Precedence

When creative elements, such as Companion creative or click-throughs, are included directly in the Wrapper response, conflict may occur. In a VAST ad, whether served with multiple Wrappers or in one Inline response, all creative offered is intended to be part of the same creative concept, and the media player should attempt to display all creative presented in the response (or in a chain of responses). However, when a conflict occurs, the media player should favor creative elements offered closest to the InLine response.

For example, if a wrapper contains companion creative and the InLine response also contains companion creative, the companion creative in the Inline response should be selected (unless both creative can be displayed without conflict).

In another example, if the InLine response is absent of any companion creative but two or more Wrappers contain companion creative, then creative for the Wrapper served closest to the InLine response should be favored. However, if multiple creative can be served without conflict, the media player should attempt to display whatever creative it can.

With respect to ClickThrough handling, if the InLine response doesn't include a ClickThrough element and one or more of the calling Wrappers includes a ClickThrough element, then the ClickThrough element closest to the InLine response must be favored. Similarly, if the inLine response includes a ClickThrough element then this must be favored over ClickThrough element(s) specified in calling Wrappers.