# 2.3.7 Industry Icon Support

Several initiatives in the advertising industry involve using an icon that overlays on top of an Ad creative to provide some extended functionality such as to communicate with consumers or otherwise fulfill requirements of a specific initiative. Often this icon and its functionality may be provided by a vendor, and is not necessarily served by the ad server or included in the creative itself.

One example of icon use is for compliance to certain Digital Advertising Alliance (DAA) self-regulatory principles for interest-based advertising (IBA). This section provides an overview of how media players can support the use of icons in a general manner while using the DAA's AdChoices program, as a specific example.

Icons are optional for audio, and can be used in the context of a companion banner. But since audio ad players are not required to have a rendering engine, icons are not a requirement when the adType is "audio" or "hybrid".

## 2.3.7.1 Icon Use Case: AdChoices for Interest-Based Advertising (IBA)

The Digital Advertising Alliance (DAA) sets forth principles that endeavor to give consumers a better understanding of and greater control over ads that are customized based on the consumer's online behavior. This control is made available to the consumer in the form of the AdChoices icon, which is displayed in a prominent location in or around the Ad creative. When a consumer clicks the icon, they may be offered: information about the ad server and data providers used to select the Ad, options to learn more about online behavioral advertising (OBA), and the ability for consumers to opt out from receiving OBA ads in the future.

## 2.3.7.2 The \<Icons\> Element

VAST 3.0 introduced the `<Icons>` element, which is offered under the `<Linear>` creative element for both InLine and Wrapper ad elements.

The following diagram illustrates the general process for how the `<Icons>` element is represented in a VAST response.

[Figure: A diagram showing the VAST icon request/response flow. A "Video Player" box on the left sends "1. VAST Request" upward to an "Ad Server" box on the upper right. The Ad Server sends back "2. VAST Response" to the Video Player. The Video Player then sends "3. Icon Request" to an "Icon Provider Server" box on the lower right. The Icon Provider Server sends back "4. Icon Response" to the Video Player.]

The Icon Provider Server represented in this diagram may be the same server that serves the VAST response but more commonly, is a vendor that serves the icon from its own systems.

When the `<Icons>` element is included in the VAST response, the media player must display the object as an overlay on top of the Linear Ad with which the icon is served and after the ad has started (i.e. first frame of video is displayed in the player).

> **Media Player Implementation Note**
> Since a vendor often serves icons and may charge advertising parties for each icon served, the media player should not pre-fetch the icon resource until the resource can be displayed. Pre-fetching the icon resource may cause the icon provider to falsely record an icon view when the icon may not have been displayed.

## 2.3.7.3 Precedence and Conflict Management

As an Ad goes through a delivery chain, companies may include their own Icon element in their Wrapper responses. Sometimes these multiple icon elements are all for the same program and the media player must decide on only one icon to display. When icon elements represent more than one program, one icon from each program should be displayed.

The media player can use its own business rules to decide which icon to display, along with any specific program recommendations. For example, when multiple AdChoices icons are offered, the DAA program recommendation is to select the icon that is closest to the creative. To comply with the AdChoices program when multiple AdChoices icons are served, the media player must choose the icon closest to the creative.

If no other rules govern the selection of which icon to display, the media player should choose the one closest to the creative. That is, if the `<Icon>` element is included within the Inline Ad, then that icon is the closest to the creative. However, if the Inline Ad contains no `<Icon>` element, but the last Wrapper in a chain of Wrappers did contain the `<Icon>` element, then the icon from that last Wrapper is the one closest to the creative.

When multiple icons from more than one Icon program are included in a chain of wrappers, the media player must decide which icon from each program should be displayed. Again, the media player can use its own business rules; however, the icons must not overlap each other. If all program icons use the same `xPosition` and `yPosition` values, the media player can use `width` and `height` attribute values to offset coordinates relative to the display area of the Ad creative.

> **Media Player Implementation Note**
> A media player may not be able to display an Icon but should make every attempt to do so.