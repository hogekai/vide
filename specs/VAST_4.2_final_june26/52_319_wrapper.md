## 3.19 Wrapper

TOC Schema

VAST Wrappers are used to redirect the media player to another server for either an additional `<Wrapper>` or the VAST `<InLine>` ad. In addition to the URI that points to another file, the Wrapper may contain tracking elements that provide tracking for the InLine ad that is served following one or more wrappers. A Wrapper may also contain `<Companion>` creative and `<Linear>` creative. And while `<Linear>` and `<NonLinear>` elements are available in the Wrapper, they are only used for tracking. No media files are provided for Linear elements, nor are resource files provided for NonLinear elements. Other elements offered for InLine ads may not be offered for Wrappers.

To find out if an element is offered for Wrappers, check the human-readable schema in section 5.

| Player Support | Required |
|---|---|
| Required in Response | One of either InLine or Wrapper required but both are not allowed |
| Parent | Ad |
| Bounded | 0-1 |
| Sub-elements | Impression\* |
| | VASTAdTagURI\* |
| | AdSystem |
| | Pricing |
| | Error |
| | ViewableImpression |
| | AdVerifications |
| | Extensions |
| | Creatives |
| | BlockedAdCategories |

| Attributes | |
|---|---|
| **followAdditionalWrappers** | a Boolean value that identifies whether subsequent Wrappers after a requested VAST response is allowed. If false, any Wrappers received (i.e. not an InLine VAST response) should be ignored. Otherwise, VAST Wrappers received should be accepted (default value is "true.") |
| **allowMultipleAds** | a Boolean value that identifies whether multiple ads are allowed in the requested VAST response. If true, both Pods and stand-alone ads are allowed. If false, only the first stand-alone Ad (with no `sequence` values) in the requested VAST response is allowed. Default value is "false." |
| **fallbackOnNoAd** | a Boolean value that provides instruction for using an available Ad when the requested VAST response returns no ads. If true, the media player should select from any stand-alone ads available. If false and the Wrapper represents an Ad in a Pod, the media player should move on to the next Ad in a Pod; otherwise, the media player can follow through at its own discretion where no-ad responses are concerned. |

\* required

### 3.19.1 VASTAdTagURI

TOC Schema

While VAST Wrappers don't provide all the same elements offered for an InLine ad, the `<VASTAdTagURI>` is the only element that is unique to Wrappers. The `VASTAdTagURI` is used to provide a URI to a secondary VAST response. This secondary response may be another Wrapper, but eventually a VAST wrapper must return an `<InLine>` ad. In VAST 4 the player is only required to accept five wrappers ads. If no InLine ads are returned after 5 Wrappers, the player may move on to the next option.

| Player Support | Required |
|---|---|
| Required in Response | Yes (if `<Wrapper>` is used) |
| Parent | Wrapper |
| Bounded | 1 (if `<Wrapper>` is used) |
| Content | A URI to a VAST response that may be another VAST Wrapper or a VAST InLine ad. The number of VAST wrappers should not exceed 5 before an InLine ad is served. After 5 VAST wrapper responses, acceptance of additional VAST responses is at the publisher's discretion. |

### 3.19.2 BlockedAdCategories

TOC Schema

Ad categories are used in creative separation and for compliance in certain programs. In a wrapper, this field defines ad categories that cannot be returned by a downstream ad server. This value is used to populate the [BLOCKEDADCATEGORIES] request macro in VASTAdTagURI strings, and can also be used by the player to reject InLine ads with Category fields that violate the BlockedAdCategories fields of upstream wrappers (see section 3.4.5). If an InLine ad is skipped due to a category violation, the client must notify the ad server using the `<Error>` URI, if provided (error code 205), and move on to the next option.

| Player Support | Optional |
|---|---|
| Required in Response | No |
| Parent | Wrapper |
| Bounded | 0+ |
| Content | A string that provides a comma separated list of category codes or labels per authority that identify the ad content. |
| authority \* | A URL for the organizational authority that produced the list being used to identify ad content. |

\*Optional unless the publisher requires ad categories. The `authority` attribute is required if categories are provided.