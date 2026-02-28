# HLS

HLS streaming via hls.js. On Safari/iOS, uses native HLS support — hls.js is not loaded.

## Install

```sh
npm install @videts/vide hls.js
```

`hls.js` is an optional peer dependency. It is only imported when the browser doesn't support native HLS.

## Usage

```ts
import { createPlayer } from "@videts/vide";
import { hls } from "@videts/vide/hls";

const player = createPlayer(document.querySelector("video")!);
player.use(hls());

player.src = "https://example.com/stream.m3u8";
```

## Options

| Option | Type | Description |
|--------|------|-------------|
| `hlsConfig` | `Record<string, unknown>` | Configuration passed directly to the hls.js constructor |
| `recovery` | `Partial<RecoveryConfig> \| false` | Error recovery settings. Defaults to enabled |

```ts
player.use(hls({ hlsConfig: { maxBufferLength: 60 } }));
```

## Error Recovery

Fatal hls.js errors trigger automatic retry with exponential backoff. Recovery is enabled by default.

| Setting | Default | Description |
|---------|---------|-------------|
| `maxRetries` | `3` | Maximum retry attempts before giving up |
| `retryDelay` | `3000` | Initial delay in milliseconds |
| `backoffMultiplier` | `2` | Multiplier per retry (3s → 6s → 12s) |

Network errors use `hls.startLoad(-1)`, media errors use `hls.recoverMediaError()`.

```ts
// Custom config
player.use(hls({ recovery: { maxRetries: 5, retryDelay: 1000 } }));

// Disable recovery
player.use(hls({ recovery: false }));
```

The `error` event includes `recoverable` and `retryCount` fields during recovery:

```ts
player.on("error", (e) => {
  if (e.recoverable) {
    console.log(`Retrying... (${e.retryCount})`);
  } else {
    console.error("Fatal error:", e.message);
  }
});
```

## Quality Levels

When an HLS stream loads, the plugin automatically detects available quality levels and exposes them through the player API.

```ts
player.on("qualitiesavailable", ({ qualities }) => {
  console.log(qualities);
  // [{ id: 0, width: 1920, height: 1080, bitrate: 5000000, label: "1080p" }, ...]
});

// Get current state
player.qualities;      // QualityLevel[]
player.currentQuality; // QualityLevel | null
player.isAutoQuality;  // boolean

// Switch quality (use -1 for auto)
player.setQuality(2);  // select specific level
player.setQuality(-1); // back to auto

player.on("qualitychange", ({ from, to }) => {
  console.log(`${from?.label} → ${to.label}`);
});
```

## Events

The HLS plugin emits `qualitiesavailable` when the manifest is parsed and `qualitychange` when the active level switches. Fatal hls.js errors are mapped to player `error` events.

## Notes

- The plugin registers a `SourceHandler` — setting `player.src` to a `.m3u8` URL is handled automatically.
- On Safari/iOS where native HLS is supported, hls.js is not imported at all.
- The hls.js instance is exposed via `player.getPluginData("hls")` for advanced use cases.
- Works with the [DRM plugin](/plugins/drm) — plugin order doesn't matter.
- Size: **0.6 KB** gzip (wrapper only, hls.js is a separate peer dependency).
