## 3.6 Creatives

The `<Creatives>` (plural) element is a container for one or more `<Creative>` (singular) element used to provide creative files for the ad. For an InLine ad, the `<Creatives>` element nests all the files necessary for executing and tracking the ad.

In a Wrapper, elements nested under `<Creatives>` are used mostly for tracking. Companion and Icon creative may be included in a Wrapper, but files for Linear and NonLinear ads can only be provided in the InLine version of the ad.

| Player Support | Required |
|---|---|
| Required in Response | Yes |
| Parent | InLine or Wrapper |
| Bounded | 1 for InLine |
| | 0-1 for Wrapper |
| Sub-elements | Creative |

\* required