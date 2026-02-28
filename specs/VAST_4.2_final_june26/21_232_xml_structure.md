## 2.3.2 XML Structure

A VAST-compliant ad response is a well-formed XML document, compliant with XML 1.0 so that standard XML requirements such as character entities and `<!-- XML comments -->` should be honored. It must also pass a schema check against the VAST 4.x XML Schema Definition (XSD) that is distributed in conjunction with this document.

IAB Tech Lab Github URL for the XSD: https://github.com/InteractiveAdvertisingBureau/vast

> **Ad Server Implementation Note**
>
> All URIs or any other free text fields containing potentially dangerous characters contained in the VAST document should be wrapped in CDATA blocks. The VAST response should be carefully tested for appropriate treatment of URI characters that require special handling.