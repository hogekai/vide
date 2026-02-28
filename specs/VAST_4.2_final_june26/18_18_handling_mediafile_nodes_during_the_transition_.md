# 1.8 Handling MediaFile Nodes During the Transition from VPAID

One of the goals of VAST4 is to eliminate the practice of using the MediaFile node to deliver executable code (usually VPAID). To achieve this goal, the AdVerifications Node and the InteractiveCreativeFile were added in VAST 4, so that executable code for measurement and for interactivity could be delivered separately from the MediaFile. VPAID is being replaced by OMID for verification/measurement and SIMID for interactivity. (Refer to http://bit.ly/videoAdVision for more information).

However, adoption of new protocols require time and so there will be a transition period where VPAID remains in use. With VAST 4.1, the working group has also deprecated the "apiFramework" attribute on the MediaFile node, which enables the delivery of VPAID. During the transition period, VAST 4.2 tags will likely have both the AdVerifications node for Open Measurement, alongside a VPAID MediaFile element.

This section provides recommendations for both publishers and tag creators to help during this transition period-

**For VAST tag creators (both direct as well as wrapped tags):**

VAST tag creators should plan to deliver the relevant VAST content based on information in the ad requests (OpenRTB and via VAST ad request macros - refer section 1.5 and 5). Use the `APIFRAMEWORKS` macro.

1. When OMID support is indicated in the request, include the AdVerifications node (or extensions node with type AdVerifications for pre VAST 4.1) to include verification scripts.
2. If VPAID support is indicated in the request and the tag creator requires VPAID support (for interactivity or ad blocking), include the following in the VAST tag
   a. The AdVerifications node (or extensions node with type AdVerifications for pre VAST 4.1)
   b. The VPAID file type MediaFile node (for Blocking or Interactivity)
3. If OMID/VPAID support status is not known and there is no hard requirement on VPAID use from the buyer, ensure that the VAST tag contains all 3 of the following so that the publisher has all resources available:
   a. The AdVerifications node (or extensions node with type AdVerifications for pre VAST 4.1)
   b. The VPAID file type MediaFile node (for Blocking or Interactivity)
   c. One or more non-VPAID (video creative) MediaFile nodes.

**For Publishers**

For best results, send information in the ad request (OpenRTB and VAST ad request macros) about capabilities of the video player. Use the `APIFRAMEWORKS` macro.

Based on the standards supported, execute in this order for best results

1. If OMID is supported, run the AdVerifications node (for Open Measurement) - and the video creative MediaFile
2. If OMID is not supported but VPAID is supported and VPAID MediaFile node is available in VAST tag, run VPAID
3. If OMID and VPAID are supported, run both AdVerifications node and VPAID
4. If OMID and VPAID not supported, run one of the non-VPAID MediaFile nodes.

The above is only a recommendation and might not work in all cases. Publishers can decide to run any MediaFile they deem appropriate for their use cases, so as always, please ensure that your integrations are working as expected and per your business agreements.

Also, publishers and technology vendors are responsible for testing the various combinations above and ensure that potential issues like double counting or namespace clashes are correctly handled.

Once Open Measurement supports Brand Safety and once the interactivity replacement for VPAID is defined (and is delivered via the InteractiveCreative Node) the use of "VPAID-MediaFile" will be eliminated.