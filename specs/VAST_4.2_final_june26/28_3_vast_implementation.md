## 3 VAST Implementation

VAST is an XML schema for providing metadata about an ad for in-stream video or audio that is parsed by a player or by a server on the player's behalf. This section provides the details for forming the VAST.

Beginning with section 3.1, each element available in VAST is described and a table summarizes information about hierarchy, requirements, and attributes. Each VAST element that includes nested elements is defined under a second-level heading in this document. Third-level headings represent nested elements that have no additional nested elements under them.

Links to the table of contents (TOC) and the schema are provided under each heading to aid in navigation. The human-readable schema in section summarizes VAST elements and provides a link to the chapter that describes the element in more detail.

Before forming a VAST document, considerations for the XML namespace and browser security for JavaScript or other scripting languages should be established as follows.

**XML Namespace**
Whenever VAST is used in conjunction with any other XML template, such as with VMAP or VAST extensions, a namespace should be declared for each so that the elements of one are not confused with the elements of another.

For more information, visit: http://www.w3.org/TR/REC-xml-names/

**Browser Security**
Modern browsers restrict Adobe Flash and JavaScript runtime environments from retrieving data from other servers. Since typical VAST responses come from other servers, measures must be taken for each.

**Cross Origin Resource Sharing (CORS) for JavaScript**
In order for JavaScript media players to accept a VAST response, ad servers must include a CORS header in the http file that wraps the VAST response. The CORS header must be formatted as follows:

```
Access-Control-Allow-Origin: <origin header value>
Access-Control-Allow-Credentials: true
```

These HTTP headers allow an ads player on any origin to read the VAST response from the ad server origin. The value of `Access-Control-Allow-Origin` should be the value of the `Origin` header sent with the ad request.

Setting the `Access-Control-Allow-Credentials` header to `true` will ensure that cookies will be sent and received properly.

*Note: For requests where the Origin header is null, ad servers should respond with only `Access-Control-Allow-Origin: *` (and no `Access-Control-Allow-Credentials` header) to prevent breaking or originless requests, such as those from iOS wkwebviews.*

For more information, visit http://www.w3.org/TR/cors