## 3.2. SIMID Ad Serving Flow

The SIMID ad experience is delivered by a web browser or application concurrently rendering an ad's streaming audio or video file and its interactive creative file. The media player obtains urls for both files from a VAST document, loads the files, assembles them into a single ad unit, and ensures a cohesive ad experience.

*SIMID creative loading and presentation process.*

[Figure: A multi-step diagram illustrating the SIMID creative loading and presentation process, consisting of 5 numbered steps:

**1. Media Player loads VAST containing SIMID ad unit**
A "Media Player" box (with a play button icon) has a document labeled "VAST" beneath it. An arrow points right to "Ad Servers" (depicted as a cloud).

**2. Media Player loads SIMID media asset**
A "media container" box has a media item labeled "Ad Media" beneath it. An arrow points right to "Ad Servers or CDN" (depicted as a cloud).

**3. Media Player loads SIMID creative asset into iframe**
An "iframe" box contains a code icon `</>`. Below it is a label "Ad Creative". An arrow points right to "Ad Servers or CDN" (depicted as a cloud).

**4. SIMID creative loads additional assets into iframe**
An "iframe" box contains a code icon `</>` with multiple layered asset icons. Below it is a label "Ad Assets (.png, .js, ...)". An arrow points right to "Ad Servers or CDN" (depicted as a cloud).

**5. Media Player renders cohesive ad experience, synchronized via SIMID API**
A rendered ad is shown displaying an example vacation advertisement with the text "Don't You Deserve a Vacation" and a "Book Now" button with a "Learn More" link.]

### 3.3. Player and Creative Communication

A media player and a SIMID creative communicate by sending serialized messages back and forth to each other.

Because a SIMID creative is an HTML document that is served from an advertiser's web domain, and it is loaded by a media player into an iframe within a web page hosted on a different domain, loading the creative requires the creation of a cross-origin iframe (also known as an "unfriendly iframe"). Due to browser sandbox security restrictions, JavaScript communication across this type of iframe can only be achieved via the standard postMessage API.

SIMID API requirements govern message construction conventions as well as the message data structure. See sections § 8 Messaging Protocol, § 4 API Reference for more information.

### 3.4. Audio Only in a Web Player

While SIMID was designed to support interactive video creative, SIMID can also be used to handle interactive audio without the visual component. Interactivity in an audio-only creative can take advantage of SIMID controls to pause, play, seek, and skip. SIMID can also help with performance by reporting on media events and any errors.

The use of SIMID features in audio player must maintain an internet connection. For audio content that is downloaded and executed offline, SIMID features will be inoperable.

### 3.5. Scope and Limitations

The use of HTML is only required for the SIMID creative, not the publisher property hosting that creative. As long as the publisher can load HTML and communicate with it over the standard postMessage API, it can support SIMID. In practice, this means that SIMID can be hosted in web page iframes, mobile app web views, and other platforms. In fact, SIMID can better support mobile use cases than VPAID because a native app or media player directly controls loading and playback of a SIMID ad unit's media asset (whereas a VPAID ad unit offers no direct access or control of its internal media asset).

Note: Certain devices, including TV sets and OTT boxes, restrict loading of external assets, have limited HTML rendering capabilities, or are unable to display HTML along with audio or video. These devices are incapable of implementing SIMID. Devices that support HTML and JavaScript can support SIMID - on both client side as well as in server side ad insertion scenarios

SIMID cannot be used to decide which media to show on the client pre-impression. This is because the media file must be present alongside the SIMID creative and delivered via the VAST `MediaFile` node.

SIMID should not be set up to measure viewability. IAB Tech Lab offers resources for measurement in its Open Measurement initiative. For more information, please visit:

iabtechlab.com/standards/open-measurement-sdk/

Any use of the SIMID spec to support something other than interactive or dynamic content within the ad unit is counter to the intentions of this spec.

#### 3.5.1. Privacy Compliance

Compliance with current privacy regulations involve actions that occur during the transaction on the ad and before SIMID is loaded. As long as the ad is contained in a SIMID container, it cannot access any data the publisher may have in the player app or the environment where the player is installed (web page, mobile device, etc.). Please visit iabtechlab.com to learn more about what IAB Tech Lab offers in support of your efforts to respect the privacy of consumers' data.

### 3.6. Introduction to Nonlinear Ads

Nonlinear ads are served and displayed concurrently with the primary media content. In video players, nonlinear ads overlay a portion of the video.

Nonlinear ads implement two states: collapsed and expanded. The player renders the nonlinear ad in the original state, collapsed, while media content progresses uninterrupted. The expanded ad state typically occupies the entire player viewport and requires the media content to be paused. The expanded state of the nonlinear ad usually occurs via user interaction with the creative.

Unlike the linear ads, there is no media asset that the player needs to render with a nonlinear ad.

SIMID supports nonlinear ads by providing a nonlinear specific API. Both linear and nonlinear ads share the same communication protocol and data providers. As with linear ads, the interactive creative is a single resource that the player loads into a cross-origin iframe.

*Nonlinear Ad User Experience:*

[Figure: A series of diagrams showing the nonlinear ad user experience flow. The flow consists of 5 states:

1. Initial state: A video player showing "Ad" label in the top left, with a collapsed nonlinear ad creative (green circle labeled "content creative") overlaying the bottom portion of the video content. An expand button is visible.

2. State after clicking expand (labeled "1"): The creative expands to fill the entire player viewport, showing the green "content creative" circle centered, with a collapse button and close button visible.

3. State 1.1 (after clicking collapse button): The creative returns to its collapsed state at the bottom of the video player, with the "Ad" label and expand button visible again. An arrow labeled "1.1" leads here from state 2.

4. State 1.2 (after clicking close button from expanded state): The video player shows only the video content with a bicycle icon, no ad overlay. An arrow labeled "1.2" leads here from state 2.

5. State 2.1 (after clicking close button provided by default state): The video player shows only the video content with a bicycle icon, no ad overlay. An arrow labeled "2" leads here from state 1.]

1. User clicks on expand button. The player pauses content and expands the creative.
   1. User clicks collapse button.
      1. Player resizes the creative to its default state and resumes content playback.
   2. User clicks close button.
      1. Player unloads the creative and resumes media content.
2. User clicks close button provided by the default state. Player unloads the creative.

#### 3.6.1. L-Shaped Ads (L Squeeze backs)

SIMID already supports L shape ads. As a creative vendor, you should have access to the media files for the ad as well as the interactive creative files. Using these two things, you can create an L shape ad experience using SIMID.

The video asset will need to be cropped or resized to allow the interactive creative to be put into the correct place. This means replacing the part that the interactive creative would cover with blank areas. Effectively, you are shrinking the effective size of the video to fit the new window that's created when the interactive creative overlay is placed over it. Since the video and interactive asset are coming from the same source, when you know you want an L shape ad experience, serve the proper cropped video along with the interactive creative and a SIMID enabled player should play the video and overlay the interactive creative over the blank spots which preserves the L shape ad experience.

While this takes some work on the video size, it can also be achieved by making the parts of the video that the interactive creative overlays a less relevant part of the video ad. Meaning, if the overlay is covering those parts of the video, minimal information is lost. This is the second way L shaped ads can run right now.

SIMID does not support L shaped ads that resize the video player without an overlay covering the video. Video assets and interactive creatives should be able to work together to achieve the same result.

#### 3.6.2. Nonlinear Ads VAST Response

VAST supports nonlinear ads since version 2.0 including interactive ads that implement API frameworks.

VAST response describes nonlinear ads in the `<NonLinear>` node children. The `<NonLinear>` node attribute's `apiFramework` value is `SIMID`. The node delivers a URI to the SIMID interactive component. The node `<AdParameters>` contains custom ad data for the creative's consumption.

```xml
<Creative>
    <NonLinear>
        <IFrameResource type="text/html" apiFramework="SIMID">
            <![CDATA[http://adserver.com/videoads/simidshell.html]]>
        </IFrameResource>
        <AdParameters>
            <![CDATA[adir345693,cturl="https://mycar.com/model2.html"]]>
        </AdParameters>
    </NonLinear>
</Creative>
```