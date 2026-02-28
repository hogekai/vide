## 2.3.6 Error Reporting

The `<Error>` element enables the media player to provide feedback to ad servers when an Ad cannot be served. In VAST 3.0, detailed error codes and specifications for format are provided to enable detailed error logging for better ad serving diagnostics.

Providing more detailed error codes enables stronger diagnostics and enables better technology development over time. If ad servers can collect more detailed information about why their ads or specific creative couldn't be served, they can improve their systems to produce fewer errors.

The `<Error>` element is an optional element nested within the `<InLine>` or `<Wrapper>` element. It is used to track errors for an Ad. An error for an Inline Ad that is part of a chain of Wrappers will produce an error for each of the Wrappers used to serve the Inline Ad.

An `<Error>` element is also provided at the root VAST level and is primarily used to report a "No Ad" response. See section(2.3.6.4) for more information.

### 2.3.6.1 Ad Server Details: \<Error\> Element

An `<Error>` element includes a URI that provides a tracking resource for the error. This error-tracking resource is called when the media player is unable to display the Ad.

The following example is a sample VAST response that includes the `<Error>` element for an Inline Ad.

```xml
<InLine>
  <Error>
    <![CDATA[http://adserver.com/error.gif]]>
  </Error>
</InLine>
```

If the ad server wants to collect more specific details about the error from the media player (as listed in section 2.3.6.3), an [ERRORCODE] macro can be included in the URI.

### 2.3.6.2 Media Player Details

If an error occurs while trying to load an Ad and the `<Error>` element is provided, the media player must:

- Request the error source file using the URI provided.

Replace the `[ERRORCODE]` macro, if provided, with the appropriate error code listed in the table in section 2.3.6.3. At a minimum, error code `900` (`Undefined error`) can be used, but a more specific error code benefits all parties involved.

If the Ad was served after a chain of Wrapper ad responses, the media player must also return error details as listed above for each Wrapper response that also includes error parameters. Macro responses must be correctly percent-encoded per RFC 3986.

The following table lists VAST error codes and their descriptions.

### 2.3.6.3 VAST Error Codes Table

| Code | Description |
|------|-------------|
| 100 | XML parsing error. |
| 101 | VAST schema validation error. |
| 102 | VAST version of response not supported. |
| 200 | Trafficking error. Media player received an Ad type that it was not expecting and/or cannot play. |
| 201 | Media player expecting different linearity. |
| 202 | Media player expecting different duration. |
| 203 | Media player expecting different size. |
| 204 | Ad category was required but not provided. |
| 205 | Inline Category violates Wrapper BlockedAdCategories [refer 3.19.2]. |
| 206 | Ad Break shortened. Ad was not served. |
| 300 | General Wrapper error. |
| 301 | Timeout of VAST URI provided in Wrapper element, or of VAST URI provided in a subsequent Wrapper element. (URI was either unavailable or reached a timeout as defined by the media player.) |
| 302 | Wrapper limit reached, as defined by the media player. Too many Wrapper responses have been received with no InLine response. |
| 303 | No VAST response after one or more Wrappers. |
| 304 | InLine response returned ad unit that failed to result in ad display within defined time limit. |
| 400 | General Linear error. Media player is unable to display the Linear Ad. |
| 401 | File not found. Unable to find Linear/MediaFile from URL. |
| 402 | Timeout of MediaFile URI. |
| 403 | Couldn't find MediaFile that is supported by this media player, based on the attributes of the MediaFile element. |
| 405 | Problem displaying MediaFile. Media player found a MediaFile with supported type but couldn't display it. MediaFile may include: unsupported codecs, different MIME type than `MediaFileType`, unsupported delivery method, etc. |
| 406 | Mezzanine was required but not provided. Ad not served. |
| 407 | Mezzanine is in the process of being downloaded for the first time. Download may take several hours. Ad will not be served until mezzanine is downloaded and transcoded. |
| 408 | Conditional ad rejected. (deprecated along with conditionalAd) |
| 409 | Interactive unit in the InteractiveCreativeFile node was not executed. |
| 410 | Verification unit in the Verification node was not executed. |
| 411 | Mezzanine was provided as required, but file did not meet required specification. Ad not served. |
| 500 | General NonLinearAds error. |
| 501 | Unable to display NonLinearAd because creative dimensions do not align with creative display area (i.e. creative dimension too large). |
| 502 | Unable to fetch NonLinearAds/NonLinear resource. |
| 503 | Couldn't find NonLinear resource with supported type. |
| 600 | General CompanionAds error. |
| 601 | Unable to display Companion because creative dimensions do not fit within Companion display area (i.e., no available space). |
| 602 | Unable to display required Companion. |
| 603 | Unable to fetch CompanionAds/Companion resource. |
| 604 | Couldn't find Companion resource with supported type. |
| 900 | Undefined Error. |
| 901 | General VPAID error. |
| 902 | General InteractiveCreativeFile error code |

### 2.3.6.4 No Ad Response

When the ad server does not or cannot return an Ad, the VAST response should contain only the root `<VAST>` element with optional `<Error>` element, as shown below:

```xml
<VAST version="4.1">
    <Error>
        <![CDATA[http://adserver.com/noad.gif]]>
    </Error>
</VAST>
```

The VAST `<Error>` element is optional but if included, the media player must send a request to the URI provided when the VAST response returns an empty InLine response after a chain of one or more wrappers. If an `[ERRORCODE]` macro is included, the media player should substitute with error code `303`.

Besides the VAST level `<Error>` resource file, no other tracking resource requests are required of the media player in a no-ad response in either the Inline Ad or any Wrappers.