## 6.11 Regulation Info

| Name | `[LIMITADTRACKING]` |
|---|---|
| Type | `integer` |
| Introduced In | VAST 4.1 |
| Support Status | Optional |
| Contexts | All tracking pixels VAST request URIs |
| Description | The limit ad tracking setting of a device-specific advertising ID scheme. This value is a boolean, with "1" indicating that a user has opted for limited ad tracking, and "0" indicating that they have not. |
| Example | `0` |

| Name | `[REGULATIONS]` |
|---|---|
| Type | `Array<string>` |
| Introduced In | VAST 4.1 |
| Support Status | Optional |
| Contexts | All tracking pixels VAST request URIs |
| Description | List of applicable regulations. Possible values: - `coppa` - `gdpr` |
| Example | `gdpr` |

| Name | `[GDPRCONSENT]` |
|---|---|
| Type | `string` |
| Introduced In | VAST 4.1 |
| Support Status | Optional |
| Contexts | All tracking pixels VAST request URIs |
| Description | Base64-encoded Cookie Value of IAB GDPR consent info |
| Example | `BOLqFHuOLqFHuAABAENAAAAAAAAoAAA` |