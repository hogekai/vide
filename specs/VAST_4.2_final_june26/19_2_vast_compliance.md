## 2 VAST Compliance

Compliance is a two-party effort that involves, at a minimum, the media player and the ad server. Both must meet certain expectations so that VAST can be truly interoperable and encourage growth in the marketplace.

| General Implementation Note | Open Measurement, VPAID and VMAP specs are excluded from VAST compliance because these specs are independent of each other and of VAST. Compliance with one spec does not imply compliance with any of the other specs. Compliance for either spec must be separately declared. |
|---|---|

### 2.1 Ad Server Expectations

VAST-compliant ad servers must be able to serve ad responses that conform to the VAST XML schema defined in this document. Ad servers must also be able to receive the subsequent tracking and error requests that result from the media player's execution of the VAST ad response. Tables for each VAST XML element define which are required in a VAST response.

### 2.2 Media Player Expectations

VAST-compliant media players and SSAI systems must be able to play the ad in a VAST response according to the instructions provided by the VAST ad response and according the media player's declared format support, which includes:

- Rendering the ad asset(s) correctly
- Respecting ad server instructions in a VAST response including those of any subsequent ad servers called in a chain of VAST Wrapper responses, providing the responses are VAST-compliant
- Responding to supported user-interactions
- Sending appropriate tracking information back to the ad server
- Supporting XML conventions such as standard comment syntax (i.e. acknowledge VAST comments in the standard XML syntax: `<!-- comment -->`)

Details for proper ad display and VAST support are defined throughout this document, including player support requirement notes for each XML element.

### 2.3 General Compliance

VAST specifies both the format of the ad response and how the media player should handle the response. In order for VAST to be effective, both ad servers and media players must adopt the guidelines outlined in this document.

In general, the video player need only accept ads that it requests and ad server responses should be displayed in the ad format intended.

For example, VAST allows for compliance while only supporting a subset of ad types (described in section 3.1). For example, if a standard Linear Ad is requested but a Skippable Linear Ad is received, the media player is not expected to display the Skippable Linear Ad nor should the media player play the Skippable Ad as a Linear Ad (without skip controls).

The following features must be supported for general functionality:

- Declaration of ad types
- XML structure
- Tracking
- Wrappers
- Error reporting
- Macros
- Industry icons
- Verification

These features are described in the following sections.