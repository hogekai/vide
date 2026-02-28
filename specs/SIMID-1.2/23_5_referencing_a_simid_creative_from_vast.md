# 5. Referencing a SIMID creative from VAST

The VAST 4.x response designates the `<InteractiveCreativeFile>` element to describe the ad's interactive component data. For SIMID, `<InteractiveCreativeFile>` element must include the following required attributes and their values: `type="text/html"` and `apiFramework="SIMID"`.

```xml
<InteractiveCreativeFile type="text/html" apiFramework="SIMID"
 variableDuration="true">
  <![CDATA[https://adserver.com/ads/creative.html]]>
</InteractiveCreativeFile>
```

The value of the `apiFramework` attribute identifies SIMID as the required API for the creative. Players that do not support the SIMID API may load an audio or video file included with the ad, but they will not load or play the SIMID creative.

Media players that do support the SIMID API should handle version negotiation between the creative and the media player via the § 6.1 How to Handle Ad Loading algorithm. The SIMID API version is not identified by any element or attribute in the VAST file.

A third, optional attribute which may be included on the InteractiveCreativeFile element is `variableDuration="true"`. If present, this attribute indicates that the ad unit is only playable if the media player allows the creative to pause playback of the ad's audio or video and extend the duration of the ad break (for example, with interactive content such as a game or survey). If the player does not support or allow this capability, then it must not render the current ad's audio/video or SIMID creative. The player should error out the ad instead (and either resume its primary content or continue on to the next ad in the current ad pod).