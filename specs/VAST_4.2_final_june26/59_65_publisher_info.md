## 6.5 Publisher Info

| | |
|---|---|
| **Name** | `[DOMAIN]` |
| **Type** | `string` |
| **Introduced In** | VAST 4.1 |
| **Support Status** | Optional |
| **Contexts** | All tracking pixels VAST request URIs |
| **Description** | Domain of the top level page where the end user will view the ad. |
| **Example** | `www.mydomain.com` |

| | |
|---|---|
| **Name** | `[PAGEURL]` |
| **Type** | `string` |
| **Introduced In** | VAST 4.1 |
| **Support Status** | Required if OM for Web is supported, otherwise Optional |
| **Contexts** | All tracking pixels VAST request URIs |
| **Description** | The full URL of the top level page where the end user will view the ad. Where required and applicable, but unknown or unavailable, -1 or -2 must be set, as described in 6.1. When required and not applicable (such as in an app), 0 must be set. |
| **Example** | Unencoded: `https://www.mydomain.com/article/page` Encoded: `https%3A%2F%2Fwww.mydomain.com%2Farticle%2Fpage` |

| | |
|---|---|
| **Name** | `[APPBUNDLE]` |
| **Type** | `string` |
| **Introduced In** | VAST 4.1 |
| **Support Status** | Required if OM for App is supported, otherwise Optional |
| **Contexts** | All tracking pixels VAST request URIs |
| **Description** | For app ads, a platform-specific application identifier, bundle or package name and should not be an app store ID such as iTunes store ID. Where required and applicable, but unknown or unavailable, -1 or -2 must be set, as described in 6.1. When required and not applicable (such as in a web context), 0 must be set. |
| **Example** | `com.example.myapp` |