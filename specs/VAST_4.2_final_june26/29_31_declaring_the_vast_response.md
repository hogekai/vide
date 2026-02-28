## 3.1 Declaring the VAST Response

All VAST responses share the same general structure. Each VAST response is declared with `<VAST>` as its topmost element along with the `version` attribute indicating the official version with which the response is compliant. For example, a VAST 4.1 response is declared as follows.

```xml
<VAST version="4.1">
```

As with all XML documents, each element must be closed after details nested within the element are provided. The following example is a VAST response with one nested `<Ad>` element.

```xml
<VAST version="4.1">
    <Ad>
        <!--ad details go here-->
    </Ad>
</VAST>
```