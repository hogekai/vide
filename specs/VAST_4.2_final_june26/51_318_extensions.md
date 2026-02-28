## 3.18 Extensions

TOC Schema

Ad servers can use this XML node for custom extensions of VAST. When used, custom XML should fall under the nested `<Extension>` (singular) element so that custom XML can be separated from VAST elements. An XML namespace (xmlns) should also be used for the custom extension to separate it from VAST components.

The following example includes a custom XML element within the `<Extensions>` element.

```xml
<Extensions>
  <Extension>
    <CustomXML>...</CustomXML>
  </Extension>
</Extensions>
```

The publisher must be aware of and be capable of executing any VAST extensions in order to process the content.

| Player Support | Optional |
|---|---|
| Required in Response | No |
| Parent | InLine or Wrapper |
| Bounded | 0-1 |
| Sub-elements | Extension |

### 3.18.1 Extension

TOC Schema

One instance of `<Extension>` should be used for each custom extension. The `type` attribute is a custom value which identifies the extension.

| Player Support | Optional |
|---|---|
| Required in Response | No |
| Parent | Extensions |
| Bounded | 0+ |
| Content | Custom XML object |

| Attributes | |
|---|---|
| **type** | A string that identifies the type of extension. |