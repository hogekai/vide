# 8 JavaScript Implementation

This section outlines JavaScript-based VPAID APIs that can be used by video player and in-stream video ads to interact in a standard way, enabling interoperability between various video player and ad unit implementations for HTML5 capable devices. The Javascript APIs follow the same basic video player and ad unit interaction approach as of Flash™ and Silverlight™ APIs. For example:

1. The video player is responsible for making the ad call and parsing of the ad xml response from the ad server
2. The video player invokes a set of functions provided by the ad VPAID object
3. The ad unit fires events/callbacks for the major events in the ad unit and the video player acts on them
4. The video player provides the ad unit with the location where it is supposed to render itself in

All effort is made to keep the APIs, property, and event definitions consistent with the Flash and Silverlight specification, but there are few differences as mandated by the JavaScript language and environment. These differences are described in the following section.