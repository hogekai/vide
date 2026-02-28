## 1.5 VAST Ad Requests

VAST is a response protocol. Historically, the request mechanism was not discussed in the VAST specs, even though the request is important since it contains the information needed by the ad server to respond with a VAST response. The protocols used for ad requests vary based on the type of inventory being served.

- For programmatic ad slots, OpenRTB is the standard typically used for ad requests, and the OpenRTB response could include a VAST response.
- For non-programmatic scenarios, the ad requests are currently not based on any standard and are proprietary agreements between the publishers and ad servers. Typically this would consist of an HTTP GET request, with additional data passed in the URL in the path or in query parameters in a key=value format. This is generally a mix of platform-specific parameters, as well as information that is commonly required across the industry, such as device IDs, contextual information such as domain or app ID, or details of the position of the video in video content.

In spite of many ad servers sharing requirements for this common data, passing this information is extremely difficult, as ad servers often accept these values in different formats. Additionally they are generally passed along VAST Wrapper chains using ad server macros which populate at the time a VAST Wrapper document is generated. This means if data must be passed from ad server A to ad server B to ad server C along a wrapper chain, traffickers in both A and B must traffic proprietary tags properly and have values align, otherwise data will be dropped.

Often necessary common data is missing by the time a final ad server is reached, causing either loss of the opportunity or selection of a suboptimal ad. To mitigate this, some standardization of request values, settable by the VAST client, is needed.

With VAST 4.1, a first step will be made towards a request protocol in VAST. To ensure ease of adoption given the current industry setting of proprietary ad tag parameters on HTTP GET requests, the request protocol will focus entirely on ensuring an agreed-upon set of values that VAST clients can set, and which all ad servers should accept. Future versions of VAST will go further, to define a full request protocol based on AdCOM (reference OpenRTB 3.0) which will define request structure as well as values.

As a further note, this standard will also hold when requests are made for VMAP, as requests for VMAP often result in VAST documents populated in the VMAP response. As such, these values are equally needed at VMAP request time.

To allow VAST clients to set values in ad tags, the VAST macro concept will be expanded to apply not just to tracking URIs, but to AdTagURIs in Wrapper creatives, as well as to initial ad tags URIs passed to a VAST client for the ad initial request.

The list of macros (for both VAST Ad Requests as well as for tracking) has been consolidated in Section 6.