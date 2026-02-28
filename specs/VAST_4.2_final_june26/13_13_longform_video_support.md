# 1.3 Long-Form Video Support

Long-form video is the extension of traditional broadcast networks to digital mediums. To enable video advertising across screens that include TV content, the response framework in VAST needs to reduce the challenges faced in this digital video environment. Specifically, VAST needs to support the following features:

- Server-to-server ad stitching
- Availability of the high-quality source (mezzanine) file for the ad
- A unique identifier that follows creative and related data from system to system

## 1.3.1 High-Quality Video

Previous versions of VAST have allowed for multiple media files so that the media player can poll for the file best suited to the environment where the ad will play. However, the high standards for quality in long-form video need more than a few options.

VAST 4.x includes a media container for the mezzanine file, which is the raw high-quality video file that the publisher can use to produce the best quality file where needed. In addition to the mezzanine file, VAST 4.x requires either an adaptive stream ready-to-serve file or a minimum of three media files at different levels of quality: high, medium, and low. Identifying the quality levels of three media files enables the media player to more quickly find the appropriate file needed for a given environment. A separate document, the IAB Digital Video Ad Format Guidelines, is provided for ad developers and outlines encoding recommendations for each of these files.

See section for details.

In order to support additional formats such as 3D, augmented reality (AR), virtual reality (VR), 360-degree video, etc., more than one mezzanine file may be included, with a "type" attribute to help identify the type of mezzanine file.

## 1.3.2 Unique Creative Identification

As ad creatives move from system to system, they become more difficult to track and impressions involving these creatives become difficult to reconcile in reports from different systems. Historically, VAST has provided a placeholder for a creative id, but its purpose has been unclear and its use varies under different vendors and use cases.

In VAST 4.x, the placeholder for a unique creative ID has been pulled out into a new element to draw more attention to it and provide attributes that more clearly define the id. The new `<UniversalAdId>` element is required for linear ads and consists of an attribute for defining the `IdRegistry` and the value of the ID specified in the content of the node.

Using a unique creative identifier enables all data associated with the creative to follow across systems. Unifying data under a unique ID streamlines data collection operations, reporting, and analysis.

See section for details.