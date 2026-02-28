## 3.15 Creative Resource Files for Non-Video and Non-Audio Creative

TOC Schema

NonLinear ads, Companions, and Industry Icons are non-video and non-audio creative, so creative files are nested using elements that define the type of creative resource file provided: `StaticResource`, `IFrameResource`, and `HTMLResource`.

These resource nodes are available under the elements: `<NonLinear>`, `<Companion>`, and `<Icon>` in the InLine format; however, in Wrapper format, resource files may only be provided under the `<Companion>` and `<Icon>` elements. NonLinear elements in Wrapper format are only used for tracking, and resource files are not allowed.

Multiple creative files may be included using these components, but each element should contain one or more files to represent different versions of the creative for use in different environments. The media player can choose which file to use when more than one resource file is provided within a single container.

For example, if an ad server wants to submit both a static image and an HTML creative for a NonLinear ad, then the NonLinear portion of the VAST response would be formatted as follows:

```xml
<NonLinearAds>
    <NonLinear>
        <StaticResource>
            <![CDATA[http://adserver.com/staticresourcefile.jpg]]>
        </StaticResource>
        <HTMLResource>
            <![CDATA[<html><body>I'm a html snippet</body></html>]]>
        </HTMLResource>

    </NonLinear>
</NonLinearAds>
```

The three resource file elements are described in the following sections.

### 3.15.1 StaticResource

TOC Schema

The URI to a static creative file to be used for the ad component identified in the parent element, which is either: `<NonLinear>`, `<Companion>`, or `<Icon>`.

| | |
|---|---|
| **Player Support** | Required for `<Icon>` and for `<NonLinear>` or `<Companion>` when supported |
| **Required in Response** | One of `<StaticResource>`, `<IFrameResource>`, or `<HTMLResource>` is required if `<NonLinear>`, `<Companion>`, or `<Icon>` is used |
| **Parent** | NonLinear, Companion, or Icon in the InLine format Companion or Icon in the Wrapper format (Resource files are not provided for NonLinear ads in a Wrapper) |
| **Bounded** | 0+ |
| **Content** | A URI to the static creative file to be used for the ad component identified in the parent element. |

| Attributes | |
|---|---|
| **creativeType\*** | Identifies the MIME type of the creative provided. |

\*required

### 3.15.2 IFrameResource

TOC Schema

The URI to an HTML resource file to be loaded into an iframe by the publisher. Associated with the ad component identified in the parent element, which is either: `<NonLinear>`, `<Companion>`, or `<Icon>`.

| | |
|---|---|
| **Player Support** | Required for `<Icon>` and for `<NonLinear>` or `<Companion>` when supported |
| **Required in Response** | One of `<StaticResource>`, `<IFrameResource>`, or `<HTMLResource>` is required if `<NonLinear>`, `<Companion>`, or `<Icon>` is used |
| **Parent** | NonLinear, Companion, or Icon in the InLine format Companion or Icon in the Wrapper format (Resource files are not provided for NonLinear ads in a Wrapper) |
| **Bounded** | 0+ |
| **Content** | A URI to the iframe creative file to be used for the ad component identified in the parent element. |

### 3.15.3 HTMLResource

TOC Schema

A "snippet" of HTML code to be inserted directly within the publisher's HTML page code.

| | |
|---|---|
| **Player Support** | Required for `<Icon>` and for `<NonLinear>` or `<Companion>` when supported |
| **Required in Response** | One of `<StaticResource>`, `<IFrameResource>`, or `<HTMLResource>` is required if `<NonLinear>`, `<Companion>`, or `<Icon>` is used in the Inline format |
| **Parent** | NonLinear, Companion, or Icon in the InLine format Companion or Icon in the Wrapper format (Resource files are not provided for NonLinear ads in a Wrapper) |
| **Bounded** | 0+ |
| **Content** | HTML code to be inserted within the publisher's HTML page code. |