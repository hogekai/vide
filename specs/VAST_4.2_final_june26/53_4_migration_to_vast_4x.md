# 4 Migration to VAST 4.x

VAST 4 offers features to support long-form video, server-side tracking, industry-wide creative tracking, and viewability and verification tracking. While the advance in features is alluring, media players will need time to upgrade their systems. During the transition period from VAST 3.0 to 4 (or 2.0 to 4), prepare to manage varying feature support in the market. VAST 4 was designed to be backward compatible with version 3.0 and VAST 3.0 was designed to be backwards compatible with version 2.0.

However, features introduced in the newer versions will typically not be back ported to older-versioned players. Also, features explicitly called out as deprecated or removed will break backward compatibility.

The following sections outline a few notes to consider as VAST 4 is introduced into the market.

## 4.1 Advertisers and Ad Technology Vendors

Design ads that can be successfully delivered to lower versioned VAST players while still optimizing the response with new 4 capabilities. For example:

- VAST 4 ads discourage the use of VPAID or other interactive ad units that require an API to execute in the `<MediaFile>`. The new `<InteractiveCreativeFile>` was provided to accommodate such ads. However, in older versions, an interactive unit may be provided in addition to the video `<MediaFile>` in order to ensure interactive files are executed where possible in older VAST version players.
- In a 4 response, use both the Creative `adId` attribute as well as the new `<UniversalAdId>` element to provide a creative ad ID.

## 4.2 Ad Servers and Networks

Be prepared to manage the variability with VAST versions. For example, if a player specifically requests a VAST 3.0 response, then the ad server should limit responses to VAST 3.0.

If one or more verification vendors are involved, use VAST 4 to provide verification code in the new `<AdVerification>` node, but expect that older versioned players will not recognize the verification node.

An important change discussed during 4.1 is the concept of standardized ad requests using AdCOM and POST requests. This is something that likely will require a phased approach on ad servers and so should be planned accordingly. The group recommends that servers start supporting POST requests (in addition to GET requests) in the near future and look into related scaling issues, because the AdCOM based ad request support will be developed next.

## 4.3 Media Players

VAST 4 players should continue to accept ads on older versions of VAST because it will take time for the entire industry to upgrade.