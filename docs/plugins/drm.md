# DRM

Widevine (Chrome/Firefox/Edge), FairPlay (Safari/iOS), PlayReady (Edge/Smart TV), and ClearKey (development/testing) support. The plugin detects the browser's key system automatically.

## Install

No additional dependencies. Works standalone for encrypted MP4 or alongside [HLS](/plugins/hls)/[DASH](/plugins/dash) plugins for streaming.

## Usage

### Encrypted MP4 (standalone)

```ts
import { createPlayer } from "@videts/vide";
import { drm } from "@videts/vide/drm";

const player = createPlayer(document.querySelector("video")!);
player.use(drm({
  widevine: {
    licenseUrl: "https://license.example.com/widevine",
  },
  fairplay: {
    licenseUrl: "https://license.example.com/fairplay",
    certificateUrl: "https://certificate.example.com/fairplay.cer",
  },
}));

player.src = "https://example.com/encrypted-video.mp4";
```

The plugin handles the full EME lifecycle internally — no HLS or DASH plugin required.

### With HLS / DASH streaming

```ts
import { createPlayer } from "@videts/vide";
import { hls } from "@videts/vide/hls";
import { drm } from "@videts/vide/drm";

const player = createPlayer(document.querySelector("video")!);
player.use(hls());
player.use(drm({
  widevine: {
    licenseUrl: "https://license.example.com/widevine",
  },
}));

player.src = "https://example.com/encrypted-stream.m3u8";
```

When an HLS or DASH plugin is active, DRM bridges its config via `pluginData`. Plugin order doesn't matter. The standalone EME handler detects that hls.js/dash.js has set `mediaKeys` and defers to it automatically.

### PlayReady

```ts
player.use(drm({
  playready: {
    licenseUrl: "https://license.example.com/playready",
    robustness: "2000",
  },
}));
```

### ClearKey (development)

```ts
player.use(drm({
  clearkey: {
    keys: {
      "base64url-key-id": "base64url-key-value",
    },
  },
}));
```

ClearKey requires no license server — keys are provided directly.

## Options

| Option | Type | Description |
|--------|------|-------------|
| `widevine` | `WidevineConfig` | Widevine DRM configuration |
| `fairplay` | `FairPlayConfig` | FairPlay DRM configuration |
| `playready` | `PlayReadyConfig` | PlayReady DRM configuration |
| `clearkey` | `ClearKeyConfig` | ClearKey configuration (no license server) |

### WidevineConfig

| Field | Type | Description |
|-------|------|-------------|
| `licenseUrl` | `string` | License server URL (required) |
| `certificateUrl` | `string` | Server certificate URL. Avoids an extra round-trip |
| `headers` | `Record<string, string>` | Custom headers for license requests |
| `robustness` | `string` | Robustness level (e.g. `"SW_SECURE_CRYPTO"`, `"HW_SECURE_DECODE"`) |
| `encryptionScheme` | `"cenc" \| "cbcs" \| "cbcs-1-9"` | Encryption scheme |
| `retry` | `DrmRetryConfig` | Retry configuration for license/certificate requests |
| `prepareLicenseRequest` | `(payload: Uint8Array) => Uint8Array \| Promise<Uint8Array>` | Transform license request payload |
| `processLicenseResponse` | `(response: Uint8Array) => Uint8Array \| Promise<Uint8Array>` | Transform license response |

### FairPlayConfig

| Field | Type | Description |
|-------|------|-------------|
| `licenseUrl` | `string` | License server URL (required) |
| `certificateUrl` | `string` | FairPlay certificate URL (required) |
| `headers` | `Record<string, string>` | Custom headers for license requests |
| `encryptionScheme` | `"cenc" \| "cbcs" \| "cbcs-1-9"` | Encryption scheme (FairPlay typically uses `"cbcs"`) |
| `retry` | `DrmRetryConfig` | Retry configuration for license/certificate requests |
| `transformInitData` | `(initData: Uint8Array, initDataType: string) => Uint8Array \| Promise<Uint8Array>` | Transform init data before `generateRequest()`. Used for vendor-specific content ID extraction |
| `prepareLicenseRequest` | `(payload: Uint8Array) => Uint8Array \| Promise<Uint8Array>` | Transform license request payload |
| `processLicenseResponse` | `(response: Uint8Array) => Uint8Array \| Promise<Uint8Array>` | Transform license response |

### PlayReadyConfig

| Field | Type | Description |
|-------|------|-------------|
| `licenseUrl` | `string` | License server URL (required) |
| `headers` | `Record<string, string>` | Custom headers for license requests |
| `robustness` | `string` | Robustness level (e.g. `"150"`, `"2000"`, `"3000"`) |
| `encryptionScheme` | `"cenc" \| "cbcs" \| "cbcs-1-9"` | Encryption scheme |
| `retry` | `DrmRetryConfig` | Retry configuration for license requests |
| `prepareLicenseRequest` | `(payload: Uint8Array) => Uint8Array \| Promise<Uint8Array>` | Transform license request payload |
| `processLicenseResponse` | `(response: Uint8Array) => Uint8Array \| Promise<Uint8Array>` | Transform license response |

### ClearKeyConfig

| Field | Type | Description |
|-------|------|-------------|
| `keys` | `Record<string, string>` | Map of key IDs to keys, both as base64url-encoded strings (required) |

### DrmRetryConfig

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `maxAttempts` | `number` | `1` | Maximum number of retry attempts |
| `delayMs` | `number` | `1000` | Base delay between retries (ms) |
| `backoff` | `number` | `2` | Exponential backoff multiplier (`delayMs × backoff^attempt`) |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `drm:ready` | `{ keySystem: KeySystem }` | DRM initialized successfully |
| `drm:keystatus` | `{ keyId: string, status: MediaKeyStatus }` | Key status changed |

```ts
player.on("drm:ready", ({ keySystem }) => {
  console.log(`DRM initialized with: ${keySystem}`);
});

player.on("drm:keystatus", ({ keyId, status }) => {
  console.log(`Key ${keyId}: ${status}`);
});
```

## Error handling

DRM errors are emitted as `error` events with `source: "drm"` and a numeric code:

| Code | Constant | Description |
|------|----------|-------------|
| 4000 | `ERR_DRM_UNSUPPORTED` | No supported key system found |
| 4001 | `ERR_DRM_DETECTION` | Key system detection failed |
| 4002 | `ERR_DRM_LICENSE` | License request/exchange failed |
| 4003 | `ERR_DRM_CERTIFICATE` | Certificate fetch failed |
| 4004 | `ERR_DRM_KEY_STATUS` | Key status error (expired or internal-error) |

```ts
import { ERR_DRM_UNSUPPORTED } from "@videts/vide/drm";

player.on("error", (e) => {
  if (e.source === "drm") console.error(`DRM error ${e.code}: ${e.message}`);
});
```

## Standalone utilities

### detectKeySystem

Detect the first supported key system from a list of candidates. Supports plain strings or objects with robustness/encryption scheme.

```ts
import { detectKeySystem } from "@videts/vide/drm";

const keySystem = await detectKeySystem([
  { keySystem: "com.widevine.alpha", robustness: "HW_SECURE_DECODE" },
  { keySystem: "com.apple.fps.1_0" },
  "com.microsoft.playready",
]);
```

### queryDrmSupport

Query support for multiple key systems at once.

```ts
import { queryDrmSupport } from "@videts/vide/drm";

const support = await queryDrmSupport([
  "com.widevine.alpha",
  "com.apple.fps.1_0",
  "com.microsoft.playready",
  "org.w3.clearkey",
]);

support.forEach((supported, ks) => {
  console.log(`${ks}: ${supported}`);
});
```

## Notes

- The plugin uses EME (Encrypted Media Extensions) to detect the browser's supported key system.
- Standalone EME handles encrypted MP4 directly. When hls.js or dash.js is active, DRM defers to the streaming library.
- Widevine: Chrome, Firefox, Edge. FairPlay: Safari, iOS Safari. PlayReady: Edge, Smart TVs. ClearKey: all modern browsers.
- Custom headers are useful for auth tokens on license requests.
- Server certificates (Widevine optional, FairPlay required) reduce round-trips by avoiding individualization requests.
- License and certificate requests use exponential backoff when `retry` is configured.

