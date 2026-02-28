## 2.3.3 Encoding URIs for VAST

URIs provided in a VAST response must be CDATA-wrapped as in the following example:

```xml
<Impression id="myserver">
    <![CDATA[
    http://ad.server.com/impression/dot.gif
    ]]>
</Impression>
```

Wrapping the URI in a CDATA section enables most characters to be included as they are. For example, without a CDATA section, the character `&` would need to be encoded as `&amp;`. However, encoding this within a CDATA section double-encodes the URI.

Consider the CDATA wrapping needed for the following URI:

`http://ad.server.com/impression/dot.gif?v=1&id=abc`

```xml
<Impression id="myserver">
    <![CDATA[
    http://ad.server.com/impression/dot.gif?v=1&id=abc
    ]]>
</Impression>
```

The encoding of `&` into `&amp;` is not necessary in this example because the URI is enclosed in a CDATA section. Characters in the URI that are also used to section out the URI with CDATA may need extra encoding.

Consider the CDATA wrapping needed for the following URI:

`http://ad.server.com/impression/dot.gif?s=x]]>x`

```xml
<Impression id="myserver">
    <![CDATA[http://ad.server.com/impression/dot.gif?s=x]]>
    ]]
    <![CDATA[>]]>
    x
</Impression>
```

The `]]>` characters are used to close the CDATA section; therefore, the `>` character must be enclosed in a secondary CDATA section. Since the `x` is a harmless character at the end, it can be left outside the CDATA section and will be concatenated with the other two URI components, each closed in their CDATA sections.

Since CDATA-wrapping URIs is a requirement in VAST, the author of the VAST response should carefully edit and test all included URIs, especially when input values require special handling. Incorrect treatment of these characters may cause ad playback to fail or enable content injection attacks.

Some additional examples are offered in the following table.

| Impression URI | `http://ad.server.com/impression/dot.gif` |
|---|---|

```xml
<Impression id="myserver">
    http://ad.server.com/impression/dot.gif
</Impression>
```

Not enclosed in a CDATA section

```xml
<Impression id="myserver">
    <![CDATA[http://ad.server.com/dot.gif]]>
</Impression>
```

Correct and backwards compatible

| Impression URI | `http://ad.server.com/impression/dot.gif?v=1&id=abc` |
|---|---|

```xml
<Impression id="myserver">
    http://ad.server.com/impression/dot.gif?v=1&amp;id=abc
</Impression>
```

The `&` is xml-encoded, but the URI needs to be wrapped in a CDATA block

> **Invalid -**

```xml
<Impression id="myserver">
    http://ad.server.com/impression/dot.gif?v=1&id=abc
</Impression>
```

Not only is this URI not CDATA enclosed but the `&` is also not XML-encoded

```xml
<Impression id="myserver">
    <![CDATA[http://ad.server.com/impression/dot.gif?v=1&amp;id=abc]]>
</Impression>
```

This URI is both CDATA-enclosed and the & is XML-encoded. The player will interpret the URI as:

`http://ad.server.com/impression/dot.gif?v=1&amp;id=1234`

```xml
<Impression id="myserver">
    <![CDATA[http://ad.server.com/impression/dot.gif?v=1&id=abc]]>
</Impression>
```

This URI is properly wrapped in a CDATA block. The `&` doesn't need to be encoded.

| Impression URI | `http://ad.server.com/impression/dot.gif?s=x]]>x` |
|---|---|

```xml
<Impression id="myserver">
    http://ad.server.com/impression/dot.gif?s=x]]&gt;x
</Impression>
```

Not enclosed in a CDATA section even though `>` is encoded

```xml
<Impression id="myserver">
    http://ad.server.com/impression/dot.gif?s=x]]>x
</Impression>
```

Not enclosed in a CDATA section

```xml
<Impression id="myserver">
    <![CDATA[http://ad.server.com/impression/dot.gif?s=x]]>x]]>
</Impression>
```

CDATA section used but appears to end early because of the `]]>` characters before the `x`, potentially allowing content injection attacks

```xml
<Impression id="myserver">
  <![CDATA[http://ad.server.com/impression/dot.gif?s=k]]>
  <![CDATA[]]> x
</Impression>
```

Correct and backwards compatible

Finally, a VAST-compliant ad response must conform to certain additional dependencies that cannot be expressed in the VAST 4 XSD. For example, one ad type of either `<InLine>` or `<Wrapper>` is allowed but not both. Another example is the protocol for providing 3 ready-to-serve media files, ideally separate from any interactive components (see section…). The XSD can only validate for whether you've provided a URI under `<MediaFiles>`; it cannot validate whether the appropriate files have been provided. Such dependencies are further described throughout this document.