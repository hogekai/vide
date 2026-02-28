## 3.7 Creative

TOC Schema

Each `<Creative>` element contains nested elements that describe the type of ad being served using nested sub-elements. Multiple creatives may be used to define different components of the ad. At least one `<Linear>` element is required under the Creative element.

| Player Support | Required |
|---|---|
| Required in Response | Yes |
| Parent | Creatives for both InLine and Wrapper formats |
| Bounded | 1+ |
| Sub-elements | UniversalAdId* |
| | CreativeExtensions |
| | Linear |
| | CompanionAds |
| **Attributes** | **Description** |
| id | A string used to identify the ad server that provides the creative. |
| adId | Used to provide the ad server's unique identifier for the creative. In VAST 4, the UniversalAdId element was introduced to provide a unique identifier for the creative that is maintained across systems. Please see section 3.7.1 for details on the UniversalAdId. |
| sequence | A number representing the numerical order in which each sequenced creative within an ad should play. |
| apiFramework | A string that identifies an API that is needed to execute the creative. |

\*required

> The Creative `sequence` attribute should not be confused with the Ad `sequence` attribute. Creative `sequence` identifies the sequence of multiple creative within a single ad and does NOT define a Pod. Conversely, the Ad `sequence` identifies the sequence of multiple ads and defines an Ad Pod. See section 2.4.1 for details about Ad Pods.

### 3.7.1 UniversalAdId

TOC Schema

A required element for the purpose of tracking ad creative, the `<UniversalAdId>` is used to provide a unique creative identifier that is maintained across systems. This creative ID may be generated with an authoritative program, such as the AD-ID® program in the United States, or Clearcast in the UK. Some countries may have specific requirements for ad-tracking programs.

The UniversalAdId element is required in 4, but the attribute value for `idRegistry` and the idValue in the node are to be used to support a company's need for tracking ad creative. If no common registry is used, a value of "unknown" may be used. Ad servers and publishers should discuss what is required for this field to support a successful ad campaign.

**Note**: A creative id can also be included in the `adId` attribute used in the `<Creative>` element, but that creative id should be used to specify the ad server's unique identifier. The UniversalAdId is used for maintaining a creative id for the ad across multiple systems.

**Note** – VAST 4.0 had an attribute "idValue" that was a duplicate of the node value and so was removed as of 4.1. Media players should not fail if this attribute is present, but should always use the Content as the source of truth for the creative ID value.

| | |
|---|---|
| Player Support | Required |
| Required in Response | Yes |
| Parent | Creative only in the InLine format |
| Bounded | 1+ |
| Content | A string identifying the unique creative identifier. Default value is "unknown" |
| Attributes | Description |
| **idRegistry\*** | A string used to identify the URL for the registry website where the unique creative ID is cataloged. Default value is "unknown." |

\*required

Examples -

`<UniversalAdId idRegistry="ad-id.org">CNPA0484000H</UniversalAdId>`

`<UniversalAdId idRegistry="clearcast.co.uk"> AAA/BBB8123/030</UniversalAdId>`

**Note**: With VAST 4.2 we now allow multiple UniversalAdID elements to be passed in a VAST response

### 3.7.2 CreativeExtensions

TOC Schema

When an executable file is needed as part of the creative delivery or execution, a `<CreativeExtensions>` element can be added under the `<Creative>`. This extension can be used to load an executable creative with or without using the `<MediaFile>`.

A `<CreativeExtension>` (singular) element is nested under the `<CreativeExtensions>` (plural) element so that any XML extensions are separated from VAST XML. Additionally, any XML used in this extension should identify an XML name space (xmlns) to avoid confusing any of the extension element names with those of VAST.

The nested `<CreativeExtension>` includes an attribute for `type`, which specifies the MIME type needed to execute the extension.

| | |
|---|---|
| Player Support | Recommended |
| Required in Response | No |
| Parent | Creative only in the InLine format |
| Bounded | 0-1 |
| Sub-elements | CreativeExtension |

### 3.7.3 CreativeExtension

TOC Schema

Used as a container under the CreativeExtensions element, this node is used to delineate any custom XML object that might be needed for ad execution.

| | |
|---|---|
| Player Support | Recommended |
| Required in Response | No |
| Parent | CreativeExtensions only in the InLine format |
| Bounded | 0+ |
| Content | Custom XML object |
| Attributes | Description |
| **type** | The MIME type of any code that might be included in the extension. |