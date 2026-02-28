# Table of Contents

| | |
|---|---|
| Executive Summary | 6 |
| Intended Audience | 7 |
| Other IAB Digital Video Guidelines | 7 |
| Updates in VPAID Version 2.0 | 7 |

## 1 Introduction

- 1.1 VPAID Enables Ad Interactivity
- 1.2 Video Ad Flow with VPAID
- 1.3 Cross-Platform Support
- 1.4 Scope and Limitation
- 1.5 VPAID, MRAID and Mobile Technology

## 2 API Reference

- 2.1 Guiding Principles
- 2.2 Notation
- 2.3 Video Player Requirements
  - 2.3.1 Displaying the Ad Unit Creative
- 2.4 Ad Unit Requirements
- 2.5 Using VPAID in Conjunction with VAST
  - 2.5.1 API Framework
  - 2.5.2 How to Initialize the VPAID Ad Unit
  - 2.5.3 How to handle event tracking
  - 2.5.4 How to handle VPAID clicks in VAST context
  - 2.5.5 How to Interpret the VAST Linear/Duration Element

## 3 VPAID Protocol Details

- 3.1 Methods
  - 3.1.1 handshakeVersion
  - 3.1.2 initAd()
  - 3.1.3 resizeAd()
  - 3.1.4 startAd()
  - 3.1.5 stopAd()
  - 3.1.6 pauseAd()
  - 3.1.7 resumeAd()
  - 3.1.8 expandAd()
  - 3.1.9 collapseAd()
  - 3.1.10 skipAd()
- 3.2 Properties
  - 3.2.1 adLinear
  - 3.2.2 adWidth
  - 3.2.3 adHeight
  - 3.2.4 adExpanded
  - 3.2.5 adSkippableState
  - 3.2.6 adRemainingTime
  - 3.2.7 adDuration
  - 3.2.8 adVolume
  - 3.2.9 adCompanions
  - 3.2.10 adIcons
- 3.3 Dispatched Events
  - 3.3.1 AdLoaded
  - 3.3.2 AdStarted
  - 3.3.3 AdStopped
  - 3.3.4 AdSkipped
  - 3.3.5 AdSkippableStateChange
  - 3.3.6 AdSizeChange
  - 3.3.7 AdLinearChange
  - 3.3.8 AdDurationChange
  - 3.3.9 AdExpandedChange
  - 3.3.10 AdRemainingTimeChange (Deprecated in 2.0)
  - 3.3.11 AdVolumeChange
  - 3.3.12 AdImpression
  - 3.3.13 AdVideoStart, AdVideoFirstQuartile, AdVideoMidpoint, AdVideoThirdQuartile, AdVideoComplete
  - 3.3.14 AdClickThru
  - 3.3.15 AdInteraction
  - 3.3.16 AdUserAcceptInvitation, AdUserMinimize, AdUserClose
  - 3.3.17 AdPaused, AdPlaying
  - 3.3.18 AdLog
  - 3.3.19 AdError
- 3.4 Error Handling and Timeouts

## 4 Security

## 5 Example Ads and the VPAID Process

- 5.1 Clickable Pre-Roll
- 5.2 Companion Banner
- 5.3 Overlay Banner
- 5.4 Overlay Banner with Click-to-Linear Video Ad

## 6 ActionScript 3 Implementation

- 6.1 API Specifics
- 6.2 Custom events
- 6.3 Security

## 7 Silverlight Implementation

- 7.1 API Specifics
- 7.2 Custom Events
- 7.3 Security

## 8 JavaScript Implementation

- 8.1 API Specifics
  - 8.1.1 Methods
  - 8.1.2 Properties
  - 8.1.3 Security
  - 8.1.4 Ad Rendering and Namespace Management
  - 8.1.5 Examples

## 9 Glossary

## Executive Summary

The IAB's Video Player Ad-Serving Interface Definition (VPAID) establishes a common interface between video players and ad units, enabling a rich interactive in-stream ad experience.

In-stream video advertisers have two important execution goals for the delivery of their video ad campaigns: a) provide viewers a rich ad experience, and b) capture ad playback and user-interaction details that report on the viewed ad experience. To achieve these goals in a world without common video player functionality, advertisers would have to develop multiple specialized versions of their ad creative for every unique video player—an expensive proposition that doesn't scale well.

The Video Ad-Serving Template (VAST), another IAB specification, provides a common ad response format for video players that enables video ads to be served across all compliant video players. However, VAST alone does not provide support for rich interactivity. VAST alone only supports relatively simple in-stream video ad formats that are not executable. These simple ad formats do not provide an interactive user experience, and do not allow the advertiser to collect rich interaction details.

Layering VPAID onto VAST offers an enhanced solution. VPAID establishes a common communication protocol between video players and ad units that allows a single "executable ad" (one that requires software logic to be executed as part of ad playback) to be displayed in-stream with the publisher's video content, in any compliant video player. Furthermore, it enables the executable ad unit to expect and rely upon a common set of functionality from the video player. VPAID enables the video player to expect and rely upon a common set of functionality from the executable ad unit. The significance is that advertisers using VPAID ads can provide rich ad experiences for viewers and collect ad playback and interaction details that are just as rich as the ad experience.

With the adoption of VPAID, advertisers have more control over the display experience in their video campaigns. Also, as VPAID compliant video players enable a more diverse and interactive set of video advertising, VPAID compliant publishers should expect to sell more in-stream video inventory.

With VPAID, the IAB aims to address the following market inefficiencies for publishers, advertisers, and vendors by:

- Increasing common video ad supply technology so that video publishers can readily accept video ad serving from agency ad servers and networks;
- Providing common technology specifications for advertisers to develop against, thereby decreasing the cost of creative production and thus increasing business ROI;
- Improving video ad supply liquidity, thus decreasing the cost of integration with each publisher.

To improve the interactive ad experience in video players, publishers should build their video players to the VPAID specifications outlined in this document. These specifications were defined with creativity and innovation in mind and should not limit video player design.

## Intended Audience

Anyone involved in the in-stream (also referred to as "in-player") video advertising supply chain can benefit from being familiar with this specification, however implementation details are targeted toward the developers of executable in-stream video ads, and video player software developers. Specifically, video software engineers and video product managers should use this document as a guide when implementing technology designed to support VPAID.

## Other IAB Digital Video Guidelines

The VPAID solution is part of a larger initiative to improve the liquidity of digital video advertising. This initiative includes the following:

- Video Ad Serving Template (VAST)
- Video Ads Multi-Playlist (VMAP)
- Digital Video Measurement Guidelines
- Digital Video Ad Format Guidelines and Best Practices
- Digital Video In-Stream Ad Metrics Definitions

## Updates in VPAID Version 2.0

VPAID 1.0 enabled cross-platform support for rich in-stream video ads. As VPAID acceptance has begun to permeate the industry, VPAID 2.0 brings enhancements and additions that provide support for more interactive capabilities and improved reporting.

Updates in VPAID 2.0 are summarized below:

- **Document Rewrite:** The content in VPAID 2.0 has been reorganized and simplified where possible to improve the flow of explanations, while also empowering non-technical readers to understand VPAID.
- **VPAID and VAST:** A valid VPAID object can be used in conjunction with the IAB Video Ad Serving Template (VAST) and is highly recommended, as VAST ads that include VPAID protocols can play in both VAST and VPAID-enabled video players. VPAID 2.0 includes details about how to use VPAID protocols in a VAST ad unit.
- **Support for HTML 5:** HTML 5 is an emerging Web syntax that has the potential to enable cross-platform/cross-device support for the latest trends in multimedia. Details for HTML 5 use of VPAID are included in this update. See Section 8 for details.
- **Technical feature updates:** In order to support added features for advanced display and reporting, the following properties, methods and dispatched events have been added or changed in this update:

  **Methods**
  - **resizeAd():** clarification has been added about how to use this method in fullscreen mode
  - **skipAd():** added to enable the video player to include controls for allowing its audience to skip ads. The new AdSkipped event is dispatched by the ad unit in response to this call.

  **Properties**
  - **adLinear:** clarification added to indicate when the property should be used
  - **adWidth:** added to provide current width of ad unit after ad has resized
  - **adHeight:** added to provide current height of ad unit after ad has resized
  - **adDuration:** reports total duration to more clearly report on the changing duration, which is confusing when both remaining time and duration can change
  - **adCompanions:** included to support ad companions in VPAID, when companion information is not available until after the VPAID .swf file has already loaded.
  - **adIcons:** included to support various industry programs which require the overlay of icons on the ad.
  - **adSkippableState:** in support of skippable ads, this feature enables the video player to identify when the ad is in a state where it can be skipped.

  **Dispatched Events**
  - **AdStopped:** clarification added to indicate that the AdStopped event is to be used as a response to `stopAd()` (or dispatched when the ad has stopped itself) rather than as a request to the video player to call `stopAd()`.
  - **AdSizeChange:** added to enable confirmation to a `resizeAd()` method call from the video player
  - **AdDurationChange:** instead of reporting `AdRemainingTimeChange`, `AdDurationChange` reports changes on the total duration that can change with user interaction. In the event of an `AdDurationChange`, both `adRemainingTime` and `adDuration` properties are updated
  - **AdInteraction:** added to capture users' interactions with the ad other than the `ClickThru` events.
  - **AdSkipped:** added to support ads that include skip controls. This event can be triggered by controls in the ad unit or in response to the video player calling the `skipAd()` method.
  - **AdSkippableStateChange:** added to support skippable ads, this event enables the ad unit to report when the ad is in a skippable state