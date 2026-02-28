# DRM

Widevine (Chrome/Firefox/Edge) and FairPlay (Safari/iOS) support. The plugin detects the browser's key system automatically.

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

## Options

| Option | Type | Description |
|--------|------|-------------|
| `widevine` | `WidevineConfig` | Widevine DRM configuration |
| `fairplay` | `FairPlayConfig` | FairPlay DRM configuration |

### WidevineConfig

| Field | Type | Description |
|-------|------|-------------|
| `licenseUrl` | `string` | License server URL (required) |
| `headers` | `Record<string, string>` | Custom headers for license requests |
| `prepareLicenseRequest` | `(payload: Uint8Array) => Uint8Array \| Promise<Uint8Array>` | Transform license request payload |
| `processLicenseResponse` | `(response: Uint8Array) => Uint8Array \| Promise<Uint8Array>` | Transform license response |

### FairPlayConfig

| Field | Type | Description |
|-------|------|-------------|
| `licenseUrl` | `string` | License server URL (required) |
| `certificateUrl` | `string` | FairPlay certificate URL (required) |
| `headers` | `Record<string, string>` | Custom headers for license requests |
| `prepareLicenseRequest` | `(payload: Uint8Array) => Uint8Array \| Promise<Uint8Array>` | Transform license request payload |
| `processLicenseResponse` | `(response: Uint8Array) => Uint8Array \| Promise<Uint8Array>` | Transform license response |

## Error handling

DRM errors are emitted as `error` events with `source: "drm"` and a numeric code:

| Code | Constant | Description |
|------|----------|-------------|
| 4000 | `ERR_DRM_UNSUPPORTED` | No supported key system found |
| 4001 | `ERR_DRM_DETECTION` | Key system detection failed |
| 4002 | `ERR_DRM_LICENSE` | License request/exchange failed |
| 4003 | `ERR_DRM_CERTIFICATE` | FairPlay certificate fetch failed |

```ts
import { ERR_DRM_UNSUPPORTED } from "@videts/vide/drm";

player.on("error", (e) => {
  if (e.source === "drm") console.error(`DRM error ${e.code}: ${e.message}`);
});
```

## Notes

- The plugin uses EME (Encrypted Media Extensions) to detect the browser's supported key system.
- Standalone EME handles encrypted MP4 directly. When hls.js or dash.js is active, DRM defers to the streaming library.
- Widevine: Chrome, Firefox, Edge. FairPlay: Safari, iOS Safari.
- Custom headers are useful for auth tokens on license requests.
- Size: **0.8 KB** gzip.
