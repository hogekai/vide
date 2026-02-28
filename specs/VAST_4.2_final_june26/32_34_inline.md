## 3.4 InLine

Within the nested elements of an `<InLine>` ad are all the files and URIs necessary to play and track the ad. In a chain of `<Wrapper>` VAST responses, an `<InLine>` response ends the chain.

| Player Support | Required |
|---|---|
| Required in Response | One of `<InLine>` or `<Wrapper>` is required, but both are not allowed |
| Parent | Ad |
| Bounded | 0-1 |
| Sub-elements | AdSystem\* AdTitle\* Impression\* AdServingId\* Category Description Advertiser Pricing Survey Error Extensions ViewableImpression AdVerifications Creatives\* Expires |

\*required

### 3.4.1 AdSystem

The ad serving party must provide a descriptive name for the system that serves the ad. Optionally, a version number for the ad system may also be provided using the `version` attribute.

| Player Support | Required |
|---|---|
| Required in Response | Yes |
| Parent | InLine or Wrapper |
| Bounded | 1 |
| Content | A string that provides the name of the ad server that returned the ad |

| Attributes | Description |
|---|---|
| **version** | A string that provides the version number of the ad system that returned the ad |

### 3.4.2 AdTitle

The ad serving party must provide a title for the ad using the `<AdTitle>` element. If a longer description is needed, the `<Description>` element can be used.

| Player Support | Required |
|---|---|
| Required in Response | Yes |
| Parent | InLine |
| Bounded | 1 |
| Content | A string that provides a common name for the ad |

### 3.4.3 AdServingId

Any ad server that returns a VAST containing an `<InLine>` ad must generate a pseudo-unique identifier that is appropriate for all involved parties to track the lifecycle of that ad. This should be inserted into the `<AdServingId>` element, and also be included on all outgoing tracking pixels. The purpose of this id is to greatly reduce the amount of work required to compare impression-level data across multiple systems, which is otherwise done by passing proprietary IDs across different systems and matching them.

This value should be different for each `<InLine>` in a VAST (i.e. each `<Ad>` in an Ad Pod or buffet should have distinct `<AdServingId>` values). The player is responsible for parsing this value and using it to fill the associated macro (see section 6) on tracking pixels.

Using a GUID for the AdServingId value is recommended. Other formats are acceptable, provided they are generally sufficiently unique to allow different systems to match tracking data. Ad servers may also choose to prepend their AdSystem or a shortened version of their server name to ID value, so that the originating server can easily be identified from the ID alone.

*Example:* ServerName-47ed3bac-1768-4b9a-9d0e-0b92422ab066

Note that only `<InLine>` elements may provide an `<AdServingId>`. Servers providing `<Wrapper>` VASTs may learn the ad serving ID by including the [ADSERVINGID] macro in their tracking pixels.

| Player Support | Required |
|---|---|
| Required in Response | Yes (for InLine) |
| Parent | InLine |
| Bounded | 1 |
| Content | A unique or pseudo-unique (long enough to be unique when combined with timestamp data) GUID |

### 3.4.4 Impression

The ad server provides an impression-tracking URI for either the InLine ad or the Wrapper using the `<Impression>` element. All `<Impression>` URIs in the InLine response and any Wrapper responses preceding it should be triggered at the same time when the impression for the ad occurs, or as close in time as possible to when the impression occurs, to prevent impression-counting discrepancies.

| Player Support | Required |
|---|---|
| Required in Response | Yes |
| Parent | InLine or Wrapper |
| Bounded | 1+ |
| Content | A URI that directs the media player to a tracking resource file that the media player must use to notify the ad server when the impression occurs. If there is no reason to include an Impression element, the placeholder "about:blank" should be used instead of a tracking URL. The player should disregard dispatching the tracking URI if it is set to "about:blank". |
| **Attributes** | **Description** |
| **id** | An ad server id for the impression. Impression URIs of the same id for an ad should be requested at the same time or as close in time as possible to help prevent discrepancies. |

### 3.4.5 Category

Used in creative separation and for compliance in certain programs, a category field is needed to categorize the ad's content. Several category lists exist, some for describing site content and some for describing ad content. Some lists are used interchangeably for both site content and ad content. For example, the category list used to comply with the IAB Quality Assurance Guidelines (QAG) describes site content, but is sometimes used to describe ad content.

The VAST category field should only use AD CONTENT description categories.

The `authority` attribute is used to identify the organizational authority that developed the list being used. In some cases, the publisher may require that an ad category be identified. If required by the publisher and not provided, the publisher may skip the ad, notify the ad server using the `<Error>` URI, if provided (error code 204), and move on to the next option.

If category is used, the `authority=` attribute must be provided.

| Player Support | Optional |
|---|---|
| Required in Response | No* |
| Parent | InLine |
| Bounded | 0+ |
| Content | A string that provides a category code or label that identifies the ad content category. |
| **Attributes** | **Description** |
| **authority \*** | A URL for the organizational authority that produced the list being used to identify ad content category. |

\*Optional unless the publisher requires ad categories. The `authority` attribute is required if categories are provided.

Example:
`<Category authority="iabtechlab.com">232</Category>`
(where the IAB Ad Product Taxonomy is being used, and 232 is the category and maps to a particular category - say Automobiles or Designer Clothing)

### 3.4.6 Description

When a longer description of the ad is needed, the `<Description>` element can be used.

| Player Support | Required |
|---|---|
| Required in Response | No |
| Parent | InLine |
| Bounded | 0-1 |
| Content | A string that provides a long ad description |

### 3.4.7 Advertiser

Providing an advertiser name can help publishers prevent display of the ad with its competitors. Ad serving parties and publishers should identify how to interpret values provided within this element.

| Player Support | Required |
|---|---|
| Required in Response | No |
| Parent | InLine |
| Bounded | 0-1 |
| Content | A string that provides the name of the advertiser as defined by the ad serving party. Recommend using the domain of the advertiser. |
| **Attributes** | **Description** |
| **id** | An (optional) identifier for the advertiser, provided by the ad server. Can be used for internal analytics. |

### 3.4.8 Pricing

Used to provide a value that represents a price that can be used by real-time bidding (RTB) systems. VAST is not designed to handle RTB since other methods exist, but this element is offered for custom solutions if needed. If the value provided is to be obfuscated or encoded, publishers and advertisers must negotiate the appropriate mechanism to do so.

When included as part of a VAST Wrapper in a chain of Wrappers, only the value offered in the first Wrapper need be considered.

| Player Support | Recommended |
|---|---|
| Required in Response | No |
| Parent | InLine or Wrapper |
| Bounded | 0-1 |
| Content | A number that represents a price that can be used in real-time bidding systems |
| **Attributes** | **Description** |
| **model\*** | Identifies the pricing model as one of: CPM, CPC, CPE, or CPV. |
| **currency\*** | The three-letter ISO-4217 currency symbol that identifies the currency of the value provided (e.g. USD, GBP, etc.). |

\*required

### 3.4.9 Survey

The survey node is deprecated in VAST 4.1, since usage was very limited and survey implementations can be supported by other VAST elements such as 3rd party trackers.

Ad tech vendors may want to use the ad to collect data for resource purposes. The `<Survey>` element can be used to provide a URI to any resource file having to do with collecting survey data. Publishers and any parties using the `<Survey>` element should determine how surveys are implemented and executed. Multiple survey elements may be provided.

A `type` attribute is available to specify the MIME type being served. For example, the attribute might be set to `type="text/javascript"`. Surveys can be dynamically inserted into the VAST response as long as cross-domain issues are avoided.

| Player Support | Recommended |
|---|---|
| Required in Response | No |
| Parent | InLine |
| Bounded | 0+ |
| Content | A URI to any resource relating to an integrated survey. |
| **Attributes** | **Description** |
| **type** | The MIME type of the resource being served. |

### 3.4.10 Expires

The number of seconds in which the ad is valid for execution. In cases where the ad is requested ahead of time, this timing indicates how many seconds after the request that the ad expires and cannot be played. This element is useful for preventing an ad from playing after a timeout has occurred.

If no value is provided, the response can be played back at any time indefinitely after being received by the player.

| Player Support | Recommended |
|---|---|
| Required in Response | No |
| Parent | InLine |
| Bounded | 0-1 |
| Content | An integer value that defines the expiry period (in seconds). |

### 3.4.11 Error (InLine and Wrapper)

The `<Error>` element contains a URI that the player uses to notify the ad server when errors occur with ad playback. If the URI contains an `[ERRORCODE]` macro, the media player must populate the macro with an error code as defined in section 2.3.6.

If no specific error can be found, error 900 may be used to indicate an undefined error; however, every attempt should be made to provide an error code that maps to the error that occurred. The `<Error>` element is available for both the InLine or Wrapper elements.

| Player Support | Required |
|---|---|
| Required in Response | No |
| Parent | InLine or Wrapper |
| Bounded | 0+ |
| Content | A URI to a tracking resource to be used when an error in ad playback occurs. |