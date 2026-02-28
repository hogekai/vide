## **Table of Contents**

| | | Page |
|---|---|---:|
| | Executive Summary | 9 |
| | VAST 4.0 Updates | 9 |
| | VAST 4.1 Updates | 11 |
| | VAST 4.2 updates | 12 |
| | Intended Audience | 12 |
| | Resources for Digital In-Stream Video and Audio | 12 |
| **1** | **General Overview** | **14** |
| 1.1 | VAST Ad Serving and Tracking | 14 |
| 1.1.1 | Client-Side Ad Serving | 14 |
| 1.1.2 | Server-Side Ad Stitching | 15 |
| 1.1.3 | Headers in Server-to-Server Ad Requests and Ad Tracking | 16 |
| 1.2 | Ad Verification | 18 |
| 1.3 | Long-Form Video Support | 19 |
| 1.3.1 | High-Quality Video | 19 |
| 1.3.2 | Unique Creative Identification | 19 |
| 1.4 | Audio Ad Support | 20 |
| 1.4.1 | Audio Player Use Cases: | 20 |
| 1.4.2 | "Audibility" / Viewability: | 20 |
| 1.5 | VAST Ad Requests | 20 |
| 1.6 | VAST Interactive Templates | 21 |
| 1.7 | Flash Support | 22 |
| 1.8 | Handling MediaFile Nodes During the Transition from VPAID | 22 |
| **2** | **VAST Compliance** | **24** |
| 2.1 | Ad Server Expectations | 24 |
| 2.2 | Media Player Expectations | 24 |
| 2.3 | General Compliance | 24 |
| 2.3.1 | VAST Ad Types | 25 |
| 2.3.2 | XML Structure | 25 |
| 2.3.3 | Encoding URIs for VAST | 26 |
| 2.3.4 | Tracking | 28 |
| 2.3.5 | VAST Wrappers | 29 |
| 2.3.5.1 | Infinite Loops and Dead Ends | 29 |
| 2.3.5.2 | Wrapper Conflict Management and Precedence | 29 |
| 2.3.6 | Error Reporting | 30 |
| 2.3.6.1 | Ad Server Details: \<Error\> Element | 30 |
| 2.3.6.2 | Media Player Details | 31 |
| 2.3.6.3 | VAST Error Codes Table | 31 |
| 2.3.6.4 | No Ad Response | 33 |
| 2.3.7 | Industry Icon Support | 33 |
| 2.3.7.1 | Icon Use Case: AdChoices for Interest-Based Advertising (IBA) | 33 |
| 2.3.7.2 | The \<Icons\> Element | 33 |
| 2.3.7.3 | Precedence and Conflict Management: | 34 |
| 2.4 | Viewability Verification and Interactive Linear Creative | 35 |
| 2.4.1 | Publisher Viewability | 35 |
| 2.4.2 | Viewability with Ad Verification Services | 36 |
| 2.4.3 | Interactive Linear Creative Files | 36 |
| **3** | **VAST Implementation** | **36** |
| 3.1 | Declaring the VAST Response | 37 |
| 3.2 | VAST | 38 |
| 3.2.1 | Error (VAST) | 38 |
| 3.3 | Ad | 38 |
| 3.3.1 | Ad Pods and Stand-Alone Ads | 39 |
| 3.3.2 | The Ad Element | 40 |
| 3.4 | InLine | 40 |
| 3.4.1 | AdSystem | 41 |
| 3.4.2 | AdTitle | 41 |
| 3.4.3 | AdServingId | 42 |
| 3.4.4 | Impression | 42 |
| 3.4.5 | Category | 43 |
| 3.4.6 | Description | 44 |
| 3.4.7 | Advertiser | 44 |
| 3.4.8 | Pricing | 44 |
| 3.4.9 | Survey | 44 |
| 3.4.10 | Expires | 45 |
| 3.4.11 | Error (InLine and Wrapper) | 45 |
| 3.5 | ViewableImpression | 46 |
| 3.5.1 | Viewable | 46 |
| 3.5.2 | NotViewable | 47 |
| 3.5.3 | ViewUndetermined | 47 |
| 3.6 | Creatives | 47 |
| 3.7 | Creative | 48 |
| 3.7.1 | UniversalAdId | 48 |
| 3.7.2 | CreativeExtensions | 49 |
| 3.7.3 | CreativeExtension | 50 |
| 3.8 | Linear | 51 |
| 3.8.1 | Duration | 51 |
| 3.8.2 | AdParameters | 51 |
| 3.9 | MediaFiles | 52 |
| 3.9.1 | MediaFile | 53 |
| 3.9.2 | Mezzanine | 54 |
| 3.9.3 | InteractiveCreativeFile | 55 |
| 3.9.4 | ClosedCaptionFiles | 56 |
| 3.9.5 | ClosedCaptionFile | 56 |
| 3.10 | VideoClicks | 57 |
| 3.10.1 | ClickThrough | 57 |
| 3.10.2 | ClickTracking | 57 |
| 3.10.3 | CustomClick | 58 |
| 3.11 | Icons | 58 |
| 3.11.1 | Icon | 59 |
| 3.11.2 | IconViewTracking | 59 |
| 3.11.3 | IconClicks | 60 |
| 3.11.4 | IconClickThrough | 60 |
| 3.11.5 | IconClickTracking | 60 |
| 3.11.6 | IconClickFallbackImages | 60 |
| 3.11.6.1 | IconClickFallbackImage | 61 |
| 3.12 | NonLinearAds | 61 |
| 3.12.1 | NonLinear | 62 |
| 3.12.2 | NonLinearClickThrough | 62 |
| 3.12.3 | NonLinearClickTracking | 63 |
| 3.13 | CompanionAds | 63 |
| 3.13.1 | Companion | 66 |
| 3.13.2 | AltText | 66 |
| 3.13.3 | CompanionClickThrough | 67 |
| 3.13.4 | CompanionClickTracking | 67 |
| 3.14 | Tracking Event Elements | 68 |
| 3.14.1 | Tracking Event Descriptions | 68 |
| 3.14.2 | TrackingEvents | 71 |
| 3.14.3 | Tracking | 71 |
| 3.15 | Creative Resource Files for Non-Video and Non-Audio Creative | 72 |
| 3.15.1 | StaticResource | 73 |
| 3.15.2 | IFrameResource | 73 |
| 3.15.3 | HTMLResource | 73 |
| 3.16 | AdVerifications | 74 |
| 3.17 | Verification | 74 |
| 3.17.1 | JavaScriptResource | 75 |
| 3.17.2 | ExecutableResource | 75 |
| 3.17.3 | TrackingEvents | 76 |
| 3.17.4 | Tracking | 76 |
| 3.17.5 | VerificationParameters | 77 |
| 3.18 | Extensions | 77 |
| 3.18.1 | Extension | 78 |
| 3.19 | Wrapper | 78 |
| 3.19.1 | VASTAdTagURI | 79 |
| 3.19.2 | BlockedAdCategories | 80 |
| **4** | **Migration to VAST 4.x** | **80** |
| 4.1 | Advertisers and Ad Technology Vendors | 80 |
| 4.2 | Ad Servers and Networks | 81 |
| 4.3 | Media Players | 81 |
| **5** | **Human Readable VAST XML Schema** | **81** |
| **6** | **Macros** | **86** |
| 6.1 | Introduction | 86 |
| 6.2 | Generic Macros | 87 |
| 6.3 | Ad Break Info | 88 |
| 6.4 | Client Info | 94 |
| 6.5 | Publisher Info | 98 |
| 6.6 | Capabilities Info | 99 |
| 6.7 | Player State Info | 102 |
| 6.8 | Click Info | 106 |
| 6.9 | Error Info | 106 |
| 6.10 | Verification Info | 107 |
| 6.11 | Regulation Info | 107 |
| **7** | **VAST Terminology** | **109** |
| **8** | **Corrections & Clarifications** | **111** |