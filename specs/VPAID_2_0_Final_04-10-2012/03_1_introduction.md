# 1 Introduction

Ads served into a publisher's video content stream render within the video player environment inline with the video content, while traditional banners render on the webpage itself. The video player makes the ad call (instead of the browser) and interprets the ad response from the ad server. The video player is also the runtime environment for the in-stream video ad unit and controls its lifecycle.

This relationship between the video player and the in-stream video ad unit becomes more complex as technology advances. Many ads displayed in-stream with video content are executable: they contain logic which must be executed by the video player in order to provide an interactive user experience and/or to support the collection of a rich set of interaction metrics. If video players are to support these executable ad units, they require an API to support ongoing communication between the players and the ad units.

VPAID offers an API to facilitate increasing complexity in video advertising, enabling video players to accept more ads, and a platform that offers more value to advertisers and publishers alike.

## 1.1 VPAID Enables Ad Interactivity

Relative to standard linear video ads, executable ads provide a far more dynamic advertising experience for consumers, because they enable rich user interaction. For example, an executable in-stream video ad unit may include additional clickable links and buttons that allow the user to view a longer form of the ad, share the ad using social media, or request more information, such as store locations or show times. These rich interactions can be captured in real-time metrics, offering advertisers interaction reports that are just as rich as the advertising experience. The VPAID API allows advertisers to distribute these executable ads across a broad set of compliant video players and publishers, to many compliant publishers.

In the diagram below, both a VPAID ad unit and a VAST ad unit have been served to a video player:

[Figure: A diagram showing the relationship between an Advertiser, VAST Ad, VPAID Ad, and Video Player. The Advertiser box on the left connects to both a "VAST Ad" box (top) and a "VPAID Ad" box (bottom) via a "VAST Response" arrow. The VAST Ad connects to the Video Player (shown on the right with a play button icon) with an arrow labeled "Simple linear video ad experience." Above the VAST Ad, a dashed line labeled "Limited VAST Metrics (start, click, pause, etc.)" points back to the left. The VPAID Ad connects to the Video Player through a "VPAID" connector, with an arrow labeled "Dynamic ad experience with user interactivity." Below the VPAID Ad, an arrow labeled "Rich Interaction Metrics" points back to the Advertiser.]

The VAST ad unit is served as a package: everything needed to serve the ad is included in the VAST XML document for the ad unit. The video player can only report on certain essential events like start, click, pause, play, etc. User interactions can't change the ad playback in any way. The ad plays for a set duration with only basic interactions.

With a VPAID-compliant executable ad unit, the interactive experience engages users and offers a dynamic brand opportunity for the advertiser. Such interactions happen in real time and can be reported to the advertiser.

Because VPAID offers such a dynamic advertising experience and a growing acceptance in the industry, advertisers are increasing their use of VPAID-enabled ad units. Publishers offering video players that are VPAID-enabled can accept more of these ads--often for premium compensation.

## 1.2 Video Ad Flow with VPAID

VPAID opens a line of communication between an executable ad unit and a video player. This open line of communication makes it possible for the two to interact. For example, if an ad is designed to play at a particular moment during a video, the video player can notify the ad unit when the moment is reached so the ad can display as designed. Likewise, if the state of an ad changes because of user interaction, notice of the change from the video player can trigger the ad unit to react.

The diagram below displays a simplified example of how a video ad unit and video player interact using VPAID:

[Figure: A flow diagram showing communication between an Ad Server/Ad Network, a VPAID Ad, and a Video Player. 1. Call: goes from Ad Server/Ad Network to VPAID Ad. 2. Response: goes from VPAID Ad to Video Player. The VPAID Ad contains a "VPAID" label and connects to the Video Player (shown as a red play button icon). 3. Ongoing Communication: bidirectional arrow between VPAID Ad and Video Player. 4. Tracking Impressions & Activities: arrow going down from both VPAID Ad and Video Player.]

1. **Call:** The player makes an ad call to the ad server. The format for this ad call is not specified in these guidelines in order to maintain flexibility for the many variations of ad server formats.
2. **Response:** The ad server responds with a VAST XML containing a VPAID-compliant executable ad unit.
3. **Ongoing Communication:** The video player and the ad unit remain in communication as the ad executes and displays to the user. Using VPAID, the video player can get and set properties for the ad unit, and the ad unit can dispatch events to the video player.
4. **Tracking Impressions & Activities:** The video player and the ad unit can each send impression and activity tracking requests to their respective ad servers (ad server tracking is not specified by VPAID).

## 1.3 Cross-Platform Support

VPAID is designed as a platform-independent API. The API must be defined individually for each platform that the video player and in-line video ad unit run on: AS2, AS3, Silverlight, JavaScript. However, to be clear, it does not help bridge platforms. Nothing in VPAID enables an executable ad unit designed to run on one platform such as Flash™, run in a video player that does not support that platform (i.e. built using JavaScript).

## 1.4 Scope and Limitation

VPAID is designed for video players that are capable of loading and running executable in-stream video ad units using one of the supported platforms. The scope of this guideline is to provide recommendations that enable a common interface between an in-stream video ad unit and video player so that the video player can execute on an ad unit's interactive instructions and record/report the results. Other uses are possible, but certain limitations and specific scope should be noted.

**Note:** VPAID is not limited to an interface specifically between an ad unit and a video player. Other application interface layers may work with VPAID as long as, when combined, the VPAID specification and interface are respected.

The following technical scenarios are out of scope:

**Bridging Video Player and Ad Unit Technologies:** While VPAID establishes a common interface to bridge communication between an ad unit and the video player, the technology supports ad unit display behavior and tracking capabilities. Specifications for playing an ad unit of one technology within the video player of another technology are not included. For example, VPAID doesn't enable a Flash™ player to play Silverlight™ ads. Mechanisms exist for addressing the incompatibility, but are not covered as a feature of VPAID at this time.

**Preloading Logic:** VPAID enables the video player to preload an ad unit before rendering it. However, these guidelines don't address the logic for how to preload an ad or how to deal with the ramifications that preloading has on impression counts.

**Impression and Display Tracking Guidelines:** VPAID enables rich display and interaction tracking and provides details about how this works. However, the timing and method for what and when to count is out of scope for this document. Please refer to the IAB *Digital Video Ad Measurement Guidelines* for impression and display tracking guidelines.

**Ad Rule Management:** The logic for managing ad rules and any included business rules for deciding when to make an ad call and which type of ad to call are out of scope for this document.

## 1.5 VPAID, MRAID and Mobile Technology

VPAID was designed to work across multiple platforms, many of which include various mobile devices. However, VPAID interactions are limited where specific mobile interactions apply. For example, VPAID isn't designed to track use of the accelerometer in mobile devices such as when the user "shakes" the mobile device to play a song or initiate some other action.

IAB offers a specification for managing interactions between mobile apps and rich media ad units. The Mobile Rich Media Ad Interface Definition (MRAID) can be used for ads targeted specifically to mobile devices where ads are played in mobile applications, but VPAID is for use in campaigns targeted to digital video across any technical video player platform, including mobile.