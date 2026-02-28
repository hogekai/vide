## 3.9 MediaFiles

**TOC** Schema

Since the first version of VAST, the MediaFiles element was designated for linear video files. Over the years as digital video technology advanced, the media files placed in a VAST tag have come to include complex files that require API integration. Players not equipped with the technology to execute such files may be unable to play the ad or execute interactive components. In ads that require API integration, VAST 4 separates media and interactive files. While <MediaFiles> node focus shifts to the exclusive delivery of media (video and audio), the dedicated <InteractiveCreativeFile> element (see section 3.9.3) opens opportunities for rendering modern secure interactive components in parallel with video and audio assets. The dedicated <Verification> element allows for measurement capabilities. Disjoining media and executable files enables a wider range of players to consume enhanced ads as well as performance improvements.

It is worth noting that when multiple *MediaFile* nodes are present, the publisher should decide which file to play based on attributes of the *MediaFile* nodes and not the structure of the document (e.g. defaulting to the first *MediaFile* included in the document).

Linear media files should be submitted as follows:

**Video/Audio file only:** Include three `<MediaFile>` elements (section 3.9.1), each with a URI to a ready-to-serve video or audio file at quality levels for high, medium, and low. Please review the IAB Digital Video Ad Format Guidelines for guidance on ready-to-serve file quality specifications.

**Video/Audio file for use in ad-stitching:** In addition to the three ready-to-serve files, use the `<Mezzanine>` element (section 3.9.2) to include a URI to the raw video or audio file. Please review the IAB Digital Video Ad Format Guidelines for guidance on mezzanine file specifications.

**Interactive linear video file:** In addition to at least one ready-to-serve video/audio file included in the `<MediaFiles>` element, use the `<InteractiveCreativeFile>` element (section 3.9.3) to include a URI to the interactive media file, specifying the API framework required to execute the file.

The components of the `<MediaFiles>` elements:

| Player Support | Required if `<Linear>` is supported |
|---|---|
| Required in Response | Yes [Linear ads] |
| Parent | Linear only for InLine format |
| Bounded | 1 (When `<Linear>` is used) |
| Sub-elements | MediaFile* |
| | Mezzanine** |
| | InteractiveCreativeFile |
| | ClosedCaptionFiles |

\*required \*\*required in ad-stitched video executions

### 3.9.1 MediaFile

**TOC** Schema

In VAST 4.x `<MediaFile>` should only be used to contain the video or audio file for a Linear ad. In particular, three ready-to-serve files should be included, each of a quality level for high, medium, or low. A ready-to-serve video/audio file is a media that is transcoded to a level of quality that can be transferred over an internet connection within a reasonable time for viewing. Each ready-to-serve file must be of the same MIME type and, if different MIME types files are made available for the ad, three ready-to-serve files should represent each MIME type separately.

When an interactive API is needed to deliver and execute the Linear Ad, the URI to the interactive file should be included in the `<InteractiveCreativeFile>`. In addition, at least one ready-to-serve video ad should be available in `<MediaFile>` so that the video ad can be played by the video player.

Guidelines for ad files that fulfill quality levels of high, medium, or low can be found in the IAB Digital Video Ad Format Guidelines. An adaptive bitrate streaming file featuring files at the three quality levels may also be provided.

| Player Support | Required |
|---|---|
| Required in Response | Yes |
| Parent | MediaFiles only for InLine format |
| Bounded | 1+ |
| Content | A CDATA-wrapped URI to a media file. |
| **Attributes** | **Description** |
| **delivery\*** | Either "progressive" for progressive download protocols (such as HTTP) or "streaming" for streaming protocols. |
| **type\*** | MIME type for the file container. Popular MIME types include, but are not limited to "video/mp4" for MP4, "audio/mp4" and "audio/aac" for audio ads. |
| **width\*** | The native width of the video file, in pixels. (0 for audio ads) |
| **height\*** | The native height of the video file, in pixels. (0 for audio ads) |
| **codec** | The codec used to encode the file which can take values as specified by RFC 4281: http://tools.ietf.org/html/rfc4281. |
| **id** | An identifier for the media file. |
| **bitrate or minBitrate and maxBitrate** | For progressive load video or audio, the `bitrate` value specifies the average bitrate for the media file; otherwise the `minBitrate` and `maxBitrate` can be used together to specify the minimum and maximum bitrates for streaming videos or audio files. |
| **scalable** | a Boolean value that indicates whether the media file is meant to scale to larger dimensions. |
| **maintainAspectRatio** | a Boolean value that indicates whether aspect ratio for media file dimensions should be maintained when scaled to new dimensions. |
| **apiFramework\*\*** | [Deprecated in 4.1 in preparation for VPAID being phased out] Identifies the API needed to execute an interactive media file, but current support is for backward compatibility. Please use the `<InteractiveCreativeFile>` element to include files that require an API for execution. |
| **fileSize** | Optional field that helps eliminate the need to calculate the size based on bitrate and duration. Units – Bytes. |
| **mediaType** | Type of media file (2D / 3D / 360 / *etc*). Optional. Default value = 2D |

\*required

\*\*if an API framework is needed to execute the ad, please use `<InteractiveCreativeFile>` to provide API files.

### 3.9.2 Mezzanine

**TOC** Schema

The media player may use a raw mezzanine file to transcode video or audio files at quality levels specific to the needs of certain environments. An XSD will validate this element as optional, but a mezzanine file is required in ad-stitched executions and whenever a publisher requires it. If no mezzanine file is available, this element may be excluded; however, publishers that require it may ignore the VAST response when not provided. If an ad is rejected for this reason, error code 406 is available to communicate the error when an `<Error>` URI and macro are provided.

Publishers consume mezzanine files to transcode the media into a form publisher's system and user devices support. The mezzanine file should never be used for the direct ad playback.

The mezzanine file specifications are defined in the Digital Video Ad Format Guidelines.

| Player Support | Optional |
|---|---|
| Required in Response | No* |
| Parent | MediaFiles only in InLine format. |
| Bounded | 1+ |
| Content | A CDATA-wrapped URI to a raw, high-quality media file. |
| **Attributes** | **Description** |
| **delivery\*** | Either `progressive` for progressive download protocols (such as HTTP) or streaming for streaming protocols. |
| **type\*** | MIME type for the file container. Popular MIME types include, but are not limited to "video/mp4" for MP4, "audio/mpeg" and "audio/aac" for audio ads. |
| **width\*** | The native width of the video file, in pixels. |
| **height\*** | The native height of the video file, in pixels. |
| **codec** | The codec used to encode the file which can take values as specified by RFC 4281: http://tools.ietf.org/html/rfc4281. |
| **id** | An identifier for the media file. |
| **fileSize** | Optional field that helps eliminate the need to calculate the size based on bitrate and duration. |
| **mediaType** | Type of media file (3D / 360 / etc). Optional. Default value = 2D |

\* VAST tags served to ad-stitching servers require a mezzanine file; server may reject the VAST response if no mezzanine file is provided.

### 3.9.3 InteractiveCreativeFile

**TOC** Schema

For any media file that uses interactive APIs for advanced creative functionality, the `<InteractiveCreativeFile>` element is used to identify the file and the framework needed for execution.

Providing the interactive portion for a media file in a section of VAST separate from the video/audio file enables players to more easily play the video/audio file when no support is available to execute the API, especially for players that work with an ad-stitching service or make ad calls from a server on behalf of the player.

The player should attempt to execute the interactive file before attempting to load any `<MediaFile>`, but if the file cannot be executed, the player should trigger any included error URIs and use error code 409 when macros are provided.

**Note re Audio Ads**: While not in use today, this could be used for pure audio interactivity outside of a click on devices like Alexa.

| Player Support | Required |
|---|---|
| Required in Response | No |
| Parent | MediaFiles only in InLine format |
| Bounded | 0+ |
| Content | A CDATA-wrapped URI to a file providing creative functions for the media file. |
| **Attributes** | **Description** |
| **type** | Identifies the MIME type of the file provided. |
| **apiFramework** | Identifies the API needed to execute the resource file if applicable. |
| **variableDuration** | Boolean. Useful for interactive use cases. Identifies whether the ad always drops when the duration is reached, or if it can potentially extend the duration by pausing the underlying video or delaying the adStopped call after ad/videoComplete. If set to `true`, the extension of the duration should be user-initiated (typically, by engaging with an interactive element to view additional content). |

### 3.9.4 ClosedCaptionFiles

**TOC** Schema

Optional node that enables closed caption sidecar files associated with the ad media (video or audio) to be provided to the player. Multiple files with different mime-types may be provided as children of this node to allow the player to select the one it is compatible with.

**Note:** It is expected that all the media files tied to parent MediaFiles node are associated with the same original creative and therefore of the same media length as well as accurately synchronized with closed captioned media segments times, so all the files under ClosedCaptionFiles should work for all the MediaFile nodes.

| Player Support | Optional |
|---|---|
| Required in Response | No |
| Parent | MediaFiles only in InLine format |
| Bounded | 1 |
| Sub-elements | ClosedCaptionFile |

### 3.9.5 ClosedCaptionFile

**TOC** Schema

Individual closed caption files for various languages.

| Player Support | Optional |
|---|---|
| Required in Response | No |
| Parent | ClosedCaptionFiles |
| Bounded | 0+ |
| Content | A CDATA-wrapped URI to a file providing Closed Caption info for the media file. |
| **Attributes** | **Description** |
| **type** | Identifies the MIME type of the file provided. |
| **language** | Language of the Closed Caption File using ISO 631-1 codes. An optional locale suffix can also be provided. Example: "en", "en-US", "zh-TW". |

Examples

```xml
<MediaFiles>
  ...
  <ClosedCaptionFiles>
    <ClosedCaptionFile type="text/srt" language="en">
      <![CDATA[https://mycdn.example.com/creatives/creative001.srt]]>
    </ClosedCaptionFile>
    <ClosedCaptionFile type="text/srt" language="fr">
      <![CDATA[https://mycdn.example.com/creatives/creative001-1.srt]]>
    </ClosedCaptionFile>
    <ClosedCaptionFile type="text/vtt" language="zh-TW">
      <![CDATA[https://mycdn.example.com/creatives/creative001.vtt]]>
    </ClosedCaptionFile>
    <ClosedCaptionFile type="application/ttml+xml" language="zh-CH">
      <![CDATA[https://mycdn.example.com/creatives/creative001.ttml]]>
    </ClosedCaptionFile>
  </ClosedCaptionFiles>
  ...
</MediaFiles>
```