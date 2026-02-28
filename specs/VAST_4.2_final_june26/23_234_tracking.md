VAST tracking is implemented using a number of individual tracking elements that map to video events, such as video start or video completion. Each of these elements contains a reference to a server-side resource, which historically has been an 1x1 pixel image, but may also be a script or document reference. Calls to these resources are counted by the ad server or other measurement vendor to tally up the total for a specific video event.

> **Publisher Implementation Note**
>
> The publisher is responsible for making the server-side request associated with a specific video event when that event occurs during video playback. These events may originate from a client-side player, or (in some SSAI cases) from the publisher server. In the event the request comes from the publisher server extra care must be taken to make sure that the calls are made concurrently with the corresponding playback events, and any missing client-side information (user agent, etc) should be passed along via headers or other mechanism.

The media player is required to request the resource file for any included tracking elements from the URI provided at the appropriate times, or "fire" the tracking element. Advertisers and publishers depend on accurate tracking records for billing, campaign effectiveness, market analysis, and other important business intelligence and accounting. Good tracking practices throughout the industry are important to the success and growth of digital video and audio advertising.

> **General Implementation Note**
>
> The publisher must send requests to the URIs provided in tracking elements; however, the publisher is not required to do anything with the response that is returned. The response is only to acknowledge an event and to comply with the HTTP protocol. This response is typically a 200 with a 1x1 pixel image in the response body (although the response could be of any other type).

The use of multiple impression URIs enables the ad server to share impression-tracking information with other ad serving systems, such as a vendor or partner ad server employed by the advertiser. When multiple impression elements are included in a VAST response, the media player is required to request all impressions at the same time or as close as possible to the same time. Any significant delay between impression requests may result in count discrepancies between ad serving systems.

> **Publisher Implementation Note**
>
> If multiple `<Impression>` elements are provided, they must be requested at the same moment in time or as close in time as possible. In particular for a VAST response containing a `<Linear>` element, compliance with the IAB Digital Video Measurement Guidelines. If any of the requests are delayed significantly, discrepancies may result in the counts of participating ad serving system.