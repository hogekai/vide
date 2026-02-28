## VAST 4.1 Updates

The updates made in VAST 4.1 are summarized here:

- **Verification:** Changes that enable verification to be supported in a non-VPAID architecture (separated from media file). Also includes changes required to work with Open Measurement.
- **Digital Audio Ad Serving Template (DAAST):** With VAST 4.1, DAAST has been merged into VAST. This mostly involves providing direction in places where audio ads might need to be treated differently. The main change is an optional "adType" added to the "Ad" element to support the various audio use cases.
- **Ad Requests:** VAST is a response protocol. 4.1 now includes a basic Ad Request specification, based on macros.
- **Updates to Macros:** With the new Ad Requests proposal, the Macros section has been completely revamped and updated.
- **Server Side Ad Insertion (SSAI) related changes:** VAST 4.1 includes minor changes to how headers should be handled. The "Ad Request" section is also relevant to SSAI use cases.
- **Deprecating Video Player Ad-Serving Interface Definition (VPAID):** While VPAID will likely be in use for some more time, with VAST 4.1 we are taking the first steps to officially deprecate the use of VPAID. The apiFramework attribute on MediaFile, and the conditionalAd attribute on the Ad element are being deprecated.
- **Updates to Tracking Events:** Added "loaded", "closeLinear" (back from VAST 3.0). Removed acceptInvitationLinear and timeSpentViewing.
- **AdServingId:** A required field has been added to simplify comparing data about a video impression across the various systems involved with the delivery and tracking of the impression.
- **VAST Interactive Templates:** Recognizing the need for standardizing interactive ads without ad delivered executable code, VAST 4.1 introduces the concept of interactive templates, with End-Cards as an example template.
- **Closed Captioning:** VAST 4.1 enables Closed Captioning by standardizing the delivery of Closed Captioning files.
- **Flash:** Following up on the white paper to transition video ads from flash to HTML5 (https://iabtechlab.com/html5videotransition/) with VAST 4.1, all references to Flash and Flash resources are being removed.
- **Survey:** The survey node is being deprecated as of VAST 4.1.
- **Other Updates:**
    - MediaFile fixes - fixes to UniversalAdId, added support for more types, changed bounding of Mezzanine files, added support for fileSize etc.
    - Added id attribute to "Advertiser" element
    - Added "Expires" element
    - Added variableDuration to InteractiveCreativeFile

**Note** - based on feedback received during public comment, the group decided not to deprecate nonlinear ads in VAST 4.1. However, we will continue to explore this format further to determine if the use cases are better handled with other options.