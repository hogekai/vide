# 7 VAST Terminology

As the video and audio advertising industry has evolved, certain terminology has gained widespread adoption. The following definitions represent some of that terminology as it relates to video and audio ad serving discussed in this document.

**Ad Pod:** An Ad Pod is sequence of Linear ads played back-to-back, like a commercial break with multiple ad spots on TV.

**Companion Ad:** Commonly a display banner or rich media ad that appears on the page outside of the media player. Companion Ads may remain on the page after the related in-stream ad ends. A Companion Ad can also be a skin that wraps the video or audio experience.

**Clickthrough:** A URL for page that opens when a user clicks the ad creative.

**InLine Ad:** A VAST ad response that contains all the information needed to play the video or audio ad. No additional calls to other ad servers are needed after a VAST InLine ad response is received.

**In-Stream Ad:** Any ad that appears inside a streaming media player, whether it's an image overlay or a Linear video or audio ad, such as an ad that plays in a 30 second ad spot.

**Linear Ad:** Linear Ads are like TV or Radio commercials and can appear before the content video/audio plays (pre-roll), during a break in the content video/audio (mid-roll), or after the content video/audio ends(post-roll). Linear ads may be video/audio, rich media or still image ads. Using an API or other technology, Linear ads can be interactive and ad duration can be extended when a user interacts.

**Master Ad:** For video or audio ad campaigns that include an in-stream ad plus one or more Companion ads, the in-stream portion of the ad unit is referred to as the master ad. In this master-companion relationship, the master ad must always be shown.

**NonLinear Ad:** An in-stream ad that appears concurrently with the video or audio content playback. NonLinear ads usually cover the bottom or top fifth of the media player and can be text, image or interactive ads. Using an API or other technology, the media player may allow user-initiated interaction in a NonLinear ad to stop content video/audio playback. NonLinear ads can only appear at some point between content video/audio start and end (mid-roll positions) and generally disappear after 10-20 seconds if there is no interaction. (Note: *NonLinear ads have failed to achieve scale in the market.*)

**Overlay Ad:** A NonLinear ad format in which an image or text displays on top of video content. Overlay ads are commonly referred to as simply "NonLinear Ads," however NonLinear Ads may also include non-overlay formats that are served within the media player but without covering any video content.

**Primary Ad Server:** The first ad server that the media player calls to for ad content. The primary ad server is usually the ad server used by the publisher.

**Secondary Ad Server:** The ad server that the media player calls after receiving a VAST redirect (Wrapper) from the primary ad server. Secondary ad servers may include agency or ad network ad servers. Also, secondary ad servers may redirect the media player to a third ad server and the third ad server may redirect to a fourth, and so on. Eventually, an ad server must provide a VAST response that includes all the creative elements needed to display the ad.

**VAMG:** Video Ad Measurement Guidelines is an IAB guideline that defines the set of events that should be tracked when a video ad is played.

**VAST:** The Video Ad Serving Template is an IAB guideline and XML schema that describes the XML structure for a video or audio ad response. VAST enables ad responses to come from any ad server.

**VAST Redirect:** A VAST ad response that points to another VAST response (sometimes referred to as the downstream VAST response).

**VAST Tag:** A URI that returns a VAST response when called.

**Video Ad:** Any ad displayed in the context of a video experience. A video experience may include in-banner video, in-text video, in-stream video and other formats. VAST applies only to in-stream video where a media player is used to manage the video experience independent of any other content. For example, video served within an ad banner is considered rich media and is NOT addressed in the VAST guideline.

**Media Player:** A media playback environment used to manage a video or audio experience. Media players are provided by an Online Video Platform (OVP) vendor or can be custom-built by the publisher.

**VMAP:** Video Multi Ads Playlist is an IAB guideline that describes the XML structure for a playlist of video ads sent from an ad server to a media player.

**VPAID:** Video Player Ad Interface Definition is an IAB guideline that defines the communication protocols between an interactive ad and the media player that is rendering it.

**Wrapper:** in the context of VAST, a Wrapper is a response that provides a URI that the media player uses to call a secondary VAST response. The secondary response may be either another Wrapper or a VAST InLine response.