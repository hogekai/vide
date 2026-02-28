## 3.17 Verification

TOC Schema

The `<Verification>` element contains the executable and bootstrapping data required to run the measurement code for a single verification vendor. Multiple `<Verification>` elements may be listed, in order to support multiple vendors, or if multiple API frameworks are supported. At least one `<JavaScriptResource>` or `<ExecutableResource>` should be provided. At most one of these resources should be selected for execution, as best matches the technology available in the current environment.

**If the player is willing and able to run one of these resources, it should execute them BEFORE creative playback begins. Otherwise, if no resource can be executed, any appropriate tracking events listed under the `<Verification>` element must be fired.**

| | |
|---|---|
| **Player Support** | Required |
| **Required in Response** | No |
| **Parent** | AdVerifications |
| **Bounded** | 0+ |
| **Sub-elements** | JavaScriptResource ExecutableResource TrackingEvents VerificationParameters |

| Attributes | |
|---|---|
| **vendor\*** | An identifier for the verification vendor. The recommended format is [domain]-[useCase], to avoid name collisions. For example, "company.com-omid". |

\*required

### 3.17.1 JavaScriptResource

TOC Schema

A container for the URI to the JavaScript file used to collect verification data.

Some verification vendors may provide JavaScript executables which work in non-browser environments, for example, in an iOS app enabled by JavaScriptCore. These resources only require methods of the API framework, without relying on any browser built-in functionality.

Players that execute verification code in a browser or webview context should prefer `browserOptional="false"` resources if both are available, but may also execute `browserOptional="true"` resources. Players that execute verification code in a non-browser environment (e.g. JavaScriptCore) may only execute resources marked `browserOptional="true"`. If only `browserOptional="false"` resources are provided, the player must trigger any provided `verificationNotExecuted` tracking events with reason code 2, to indicate the provided code is not supported (see Section 3.17.4).

| | |
|---|---|
| **Player Support** | Optional\*\* |
| **Required in Response** | No |
| **Parent** | Verification |
| **Bounded** | 0+ |
| **Content** | A CDATA-wrapped URI to the JavaScript used to collect data |

| Attributes | |
|---|---|
| **apiFramework\*** | The name of the API framework used to execute the AdVerification code |
| **browserOptional\*** | Boolean value. If `true`, this resource is optimized and able to execute in an environment without DOM and other browser built-ins (e.g. iOS' JavaScriptCore). |

\*required

\*\*while optional, if neither `JavaScriptResource` or `ExecutableResource` are executed, the player must trigger the verificationNotExecuted tracking events with reason code 2

```xml
<JavaScriptResource apiFramework="omid" browserOptional="true">
  <![CDATA[https://verificationvendor.com/omid.js]]>
</JavaScriptResource>
```

### 3.17.2 ExecutableResource

TOC Schema

A reference to a non-JavaScript or custom-integration resource intended for collecting verification data via the listed apiFramework.

| | |
|---|---|
| **Player Support** | Optional\*\* |
| **Required in Response** | No |
| **Parent** | Verification |
| **Bounded** | 0+ |
| **Content** | A CDATA-wrapped reference to the resource. This may be a URI, but depending on the execution environment can be any value which enables the player to load the required verification code. |

| Attributes | |
|---|---|
| **apiFramework\*** | The name of the API framework used to execute the AdVerification code |
| **type\*** | The type of executable resource provided. The exact value used should be agreed upon by verification integrators and vendors who are implementing verification in a custom environment. |

\*required

\*\*while optional, if neither `JavaScriptResource` or `ExecutableResource` are executed, the player must trigger the verificationNotExecuted tracking events with reason code 2

### 3.17.3 TrackingEvents

TOC Schema

The verification vendor may provide URIs for tracking events relating to the execution of their code during the ad session. The player must trigger the request of these URIs in the scenarios listed in section 3.17.4.

| | |
|---|---|
| **Player Support** | Required |
| **Required in Response** | No |
| **Parent** | Verification |
| **Bounded** | 0-1 |
| **Sub-elements** | Tracking |

### 3.17.4 Tracking

TOC Schema

Each `<Tracking>` element is used to define a single event to be tracked by the verification vendor. Multiple tracking elements may be used to define multiple events to be tracked, but may also be used to track events of the same type for multiple parties.

One event type is currently supported:

- **verificationNotExecuted**: The player did not or was not able to execute the provided verification code

The following macros should be supported specifically in URIs for this event type (in addition to all macros from the global macro set in section 6).

- **[REASON]** - The reason code corresponding to the cause of the failure.

| Reason Code | Description |
|---|---|
| 1 | Verification resource rejected. The publisher does not recognize or allow code from the vendor in the parent `<Verification>`. |
| 2 | Verification not supported. The API framework or language type of verification resources provided are not implemented or supported by the player/SDK. |
| 3 | Error during resource load. The player/SDK was not able to fetch the verification resource, or some error occurred that the player/SDK was able to detect. *Examples of detectable errors:* malformed resource URLs, 404 or other failed response codes, request time out. *Examples of potentially undetectable errors:* parsing or runtime errors in the JS resource. |

| | |
|---|---|
| **Player Support** | Required |
| **Required in Response** | No |
| **Parent** | TrackingEvents under Verification elements |
| **Bounded** | 0+ |
| **Content** | A URI to the tracking resource for the event specified using the event attribute. |

| Attributes | |
|---|---|
| **event\*** | A string that defines the event being tracked. Accepted values are listed in section 3.17.3 |

\*required

### 3.17.5 VerificationParameters

TOC Schema

`<VerificationParameters>` contains a CDATA-wrapped string intended for bootstrapping the verification code and providing metadata about the current impression. The format of the string is up to the individual vendor and should be passed along verbatim.

| | |
|---|---|
| **Player Support** | Required |
| **Required in Response** | No |
| **Parent** | Verification |
| **Bounded** | 0-1 |
| **Content** | CDATA-wrapped metadata string for the verification executable. |