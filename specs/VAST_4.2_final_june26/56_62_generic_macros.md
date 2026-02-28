# 6.2 Generic Macros

| Name | `[TIMESTAMP]` |
|---|---|
| **Type** | `string` |
| **Introduced In** | VAST 4.0 |
| **Support Status** | Required |
| **Contexts** | All tracking pixels VAST request URIs |
| **Description** | The date and time at which the URI using this macro is accessed. Used whenever a time stamp is needed, the macro is replaced with the date and time using the formatting conventions of ISO 8601. To add milliseconds, use the convention `.mmm` at the end of the time provided and before any time zone indicator. |
| **Example** | January 17, 2016 at 8:15:07 and 127 milliseconds, Eastern Time would be formatted as follows: Unencoded: `2016-01-17T8:15:07.127-05` Encoded: `2016-01-17T8%3A15%3A07.127-05` |

| Name | `[CACHEBUSTING]` |
|---|---|
| **Type** | `integer` |
| **Introduced In** | VAST 3.0 |
| **Support Status** | Required |
| **Contexts** | All tracking pixels VAST request URIs |
| **Description** | To be replaced with a random 8-digit number |
| **Example** | `12345678` |