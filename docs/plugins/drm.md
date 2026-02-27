# DRM

Widevine (Chrome/Firefox/Edge) and FairPlay (Safari/iOS) support. The plugin detects the browser's key system automatically.

## Install

No additional dependencies — DRM configures hls.js and dash.js via `pluginData`.

Requires one of:
- [HLS plugin](/plugins/hls) with `hls.js`
- [DASH plugin](/plugins/dash) with `dashjs`

## Usage

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
  fairplay: {
    licenseUrl: "https://license.example.com/fairplay",
    certificateUrl: "https://certificate.example.com/fairplay.cer",
  },
}));

player.src = "https://example.com/encrypted-stream.m3u8";
```

Works with both HLS and DASH — plugin order doesn't matter.

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

## Events

No custom events. DRM errors surface through the streaming plugin's error handling.

## Notes

- The plugin uses EME (Encrypted Media Extensions) to detect the browser's supported key system.
- Widevine: Chrome, Firefox, Edge. FairPlay: Safari, iOS Safari.
- Custom headers are useful for auth tokens on license requests.
- Size: **0.8 KB** gzip.
