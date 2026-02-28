## 3. Introduction

Throughout this document, the SIMID interactive component is referred to as a "SIMID creative" or "creative".

Compliance with SIMID requires support for all features and behaviors specified in this document, unless a given feature or behavior is explicitly designated as optional. Standard RFC language will be used. See https://tools.ietf.org/html/rfc2119 for RFC 2119 for enforcement terminology used in this standard.

### 3.1. SIMID Interactive Creative Nature

*SIMID Assets loading*

[Figure: A diagram showing the SIMID ad serving architecture. At the top, "Ad Servers" is depicted as a cloud. Two arrows point down from Ad Servers: one to "Ad Video" (shown with a film strip icon) on the left, and one to "Ad Creative" (shown with a code icon `</>`) on the right. Below, "Media Player" (shown with a play button icon) is on the left, and "Iframe" is on the right. Between them at the bottom center is a box labeled "SIMID API". A double-headed arrow connects Media Player to SIMID API, and another double-headed arrow connects SIMID API to Iframe.]

A SIMID creative can be included in a VAST document by way of an `<InteractiveCreativeFile>` element. The text within this element must be a url which returns an HTML document. When loaded into an iframe by a media player, this HTML document will define the SIMID creative's content, and will direct the web browser or host application to load any additional assets required by that creative (images, CSS, scripts, etc.).

The `<InteractiveCreativeFile>` element is defined as a child of the `<MediaFiles>` element in VAST 4.0. For more technical details, see the § 5 Referencing a SIMID creative from VAST section.

```xml
<MediaFiles>
    <MediaFile>
        <![CDATA[https://example.com/mediafile.mp4]]>
    </MediaFile>
    <InteractiveCreativeFile type="text/html" apiFramework="SIMID"
     variableDuration="true">
        <![CDATA[https://adserver.com/ads/creative.html]]>
    </InteractiveCreativeFile>
</MediaFiles>
```