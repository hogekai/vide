## 1.1 VAST Ad Serving and Tracking

Display advertising uses standardized browser technology to request and execute ads. However, digital in-stream video and audio advertising operates on players, sometimes built with proprietary code. As a template for ads served to a media player, VAST offers a set of instructions for developers on how to program their players to process VAST-formatted ads. Using VAST, ad servers can serve ads to any VAST-compliant player regardless of what code the player uses.

### 1.1.1 Client-Side Ad Serving

VAST is a unidirectional means of sending ad details to a media player. Built as a layer on top of browser technology, the VAST process that uses client-side execution looks something like this:

[Figure: A diagram showing the client-side ad serving process. A computer monitor with a play button represents the media player. Numbered steps show the flow: (1) A "VAST Request" arrow goes from the "Video Content Publisher" to a "VAST" component with an "InLine" label. (2) A "Wrapper Response" arrow returns from VAST to the right, reaching an "Ad Server". (3) A "Secondary VAST Request" arrow goes from VAST back to another "Ad Server" on the right. (4) An "InLine Response" arrow returns from the second Ad Server back to VAST. (5) An "InLine Ad Execution" arrow goes from VAST to the media player at the bottom. (6) A "Tracking" arrow goes from the media player to the left, reaching an "AD" label. The "AD" label also connects back with a "Tracking" arrow going upward.]

1. **VAST Request:** At some point during content playback, either before (pre-roll), in the middle of (mid-roll), or after (post-roll), the player reaches a cue to insert an ad and uses HTTP to send the request for an ad. See section ∎∎∎∎ on sending an ad request. The request is sent to the primary ad server, which may be the publisher's ad server or a supply-side platform (SSP).
2. **Wrapper Response:** The primary server responds with VAST. This response is either an InLine response or a Wrapper response. If the server can fill the ad request, it sends an InLine response (step 4). In many cases, the ad server redirects the player to a secondary server using a Wrapper response.
3. **Secondary VAST Request:** If a Wrapper response is received, the player makes a secondary request to another server. The secondary response may be an InLine response or another VAST Wrapper.
4. **InLine Response:** Eventually, after a series of requests and responses, an ad server provides an InLine response.
5. **InLine Execution:** The media player executes the VAST response.
6. **Tracking:** At key points during ad playback, tracking information is sent for both the InLine and Wrapper responses that the player received. In traditional client-side ad serving, cookies are used to track ads and the computers on which they play.

### 1.1.2 Server-Side Ad Stitching

The example just described the general process for serving an ad directly to a media player, the client, and uses client-side tracking. With client-side tracking, the player sends tracking information. However, in today's wide array of streaming media players the player may not be capable of executing dynamic ad responses or tracking impressions and interactions. In these cases, an intermediary server is needed to insert ads dynamically into the video or audio stream.

Called ad stitching (or stream stitching, ad insertion, etc.), the process looks something like this:

[Figure: A diagram showing the server-side ad stitching process. On the left, a computer monitor with a play button represents the media player. A "Video Content Publisher" box sits above it. On the right side, an "Ad-Stitching Service" box is at the top. The numbered steps show the flow: (1) "Publisher requests ad" — an arrow goes from the Video Content Publisher to the Ad-Stitching Service. (2) "Request VAST" — an arrow goes from the Ad-Stitching Service down to an "Ad Server" box. (3) "Send VAST" — an arrow returns from the Ad Server up to a "VAST" component. (4) To the right, "Select" and (5) "transcode" labels appear with arrows pointing to an "AD" element and then to a "Mezzanine" element. (6) "AD" and "Stitch ad into content stream" — an arrow goes from the AD element on the left back toward the media player. At the bottom, an "Extract metadata and transcode" label connects from Mezzanine. A "Content" arrow flows from the top right into the Ad-Stitching Service. An "AD" label also appears near the Content flow.]

1. **VAST Request:** The publisher sends an ad request to the ad-stitching service.
2. **Request VAST:** The ad-stitching service makes a request to the ad server for a VAST tag.
3. **Send VAST:** The ad server sends a VAST tag with a mezzanine file and ready-to-serve files. If the ad stitching service has already received the creative for a previous request and has transcoded the mezzanine file, or the ready-to-serve files are already in the format required to be stitched into the content stream, then it moves on to step 5. If the VAST tag response is a Wrapper tag then the ad-stitching service should extract the inner InLine response using the same precedence logic as a client-side media player.
4. **\*Extract Mezzanine and Transcode:** The ad-stitching service pulls the unique creative identifier from the VAST tag. If the creative has never been used in the system, the mezzanine file is extracted and transcoded. In this scenario, the ad is skipped and the next available ad is played instead. VAST error code 407 is sent.
5. **Select Transcoded:** If the creative in the VAST tag from step 3 matches the unique creative identifier for an ad that has already been transcoded, the ad-stitching service selects the pre-transcoded file already in the system.
6. **Stitch Ad into Content Stream:** The ad-stitching service stitches the ad into the content stream and serves the content and ad to the player in one continuous stream.

Ad-stitching vendors rely on a unique creative identifier for managing the mezzanine source file and its cache of transcoded files for stitching into a video or audio stream. If the ad creative is changed in any way, it should be served with a new creative identifier. In VAST 4.x, the unique creative identifier is provided in the `<UniversalAdId>` element under `<Creative>`. See section 3.7 for details.

### 1.1.3 Headers in Server-to-Server Ad Requests and Ad Tracking

With client-side ad tracking described in section 1.1.5, the player (client) sends tracking included in the VAST tag and uses cookies to determine which computers executed the ad. However, in server-to-server and server-side ad-stitching, the player may not be able to process ad tracking, and the ad-stitching service cannot access cookies used in traditional client-side tracking. Instead, the ad-stitching service must identify devices where ads play by a combination of other methods.

When an ad-stitching service is involved, the ad-stitching server may send tracking on the player's behalf. This server-to-server tracking process is problematic because all the tracking is coming from one IP address. To an ad server that is receiving tracking information, the reports look similar to invalid traffic. In addition, the server is initiating the request on behalf of the client, so it is important to separate information describing the server itself from information describing the client.

**Note** - For server-side VAST requests prior to version 4.1, namely VAST 2.0, 3.0 and 4.0, the immediate goal is to standardize the ad requests and impression calls from the publisher server (including SSAI platforms) which make the ad request to SSPs, ad exchanges and DSPs. To this end, the publisher server or the SSAI platform may use existing HTTP GET tag requests, on condition that they send the following additional HTTP headers. The goal here is to provide SSAI technology providers the runway to make the transition to the recommended macros-based request model (Section 1.5) which has comprehensive support for this use case, while still allowing for adjustments for the immediate term.

In the future, ad requests will move to a POST based model, which has performance and scaling implications, so the working group recommends that platforms start working on understanding architectural changes required to support POST messages at scale.

To avoid being mistaken as fraudulent traffic, ad stitching providers must include with their ad tracking requests the following HTTP headers:

- `X-Device-IP` set to the IP address of the device on whose behalf this request is being made.
- `X-Device-User-Agent` set to the `User-Agent` of the client on whose behalf the request is being made.

The requester should also include the following headers, if available:

- `X-Device-Referer` set to the `Referer` header value that the client would have used when making a request itself.
- `X-Device-Accept-Language` set to the `Accept-Language` header value that the client would have used when making a request itself.
- `X-Device-Requested-With` set to the `X-Requested-With` header value that the client would have used when making a request itself.

The requester may also include the following headers:

- `X-Forwarded-For` for backwards compatibility, although this is now deprecated.
- `X-Device-*` Other HTTP headers that the client would have sent itself may be forwarded as well by the requester using the `X-Device-` prefix.

The information included in these headers must match the information in the original ad request payload, per section 1.1.1.

While these recommendations for tracking support server-side tracking, IAB Impression Measurement Guidelines developed with the Media Rating Council (MRC) favor client-side tracking. "The Measurement Guidelines require ad counting to use a client-initiated approach; server-initiated ad counting methods (the configuration in which impressions are counted at the same time the underlying page content is served) are not acceptable for counting ad impressions because they are the furthest away from the user actually seeing the ad. Measurement counting may happen at the server side as long as it is initiated based on client-side events and measurement assets. However, pass-through methods (where client-initiated measurement is passed to server-side collection) of signaling interactions detected on the client side from server infrastructure are acceptable." Source: MMTF Public Comment Draft v2 Oct 2017.

In general, an ad-stitching service may have little or no control over ad play once the ad is stitched into the content and streamed to the client. Impression reporting may vary by implementation. For the ad stitching service in situations where the client cannot count impressions, an impression could be reported as the ad is sent on the stitched stream and therefore be as close as possible to the opportunity to play. Alternately, a session-oriented ad-stitching service may report impressions from a given session at session completion. However, any impression measurement beyond the ad-stitched stream is out of the ad-stitching services' control and should be counted by the player whenever possible.

Auditing for compliance with IAB Viewable Ad Impression Measurement Guidelines should focus on disclosing the process by which impressions are counted and any limitations with reporting impressions in certain situations and environments.

See section 3.14 for more information on tracking.