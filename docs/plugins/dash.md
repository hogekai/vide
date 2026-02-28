# DASH

DASH streaming via dash.js.

## Install

```sh
npm install @videts/vide dashjs
```

`dashjs` is an optional peer dependency.

## Usage

```ts
import { createPlayer } from "@videts/vide";
import { dash } from "@videts/vide/dash";

const player = createPlayer(document.querySelector("video")!);
player.use(dash());

player.src = "https://example.com/stream.mpd";
```

## Options

| Option | Type | Description |
|--------|------|-------------|
| `dashConfig` | `Record<string, unknown>` | Settings passed to `dashjs.updateSettings()` |
| `recovery` | `Partial<RecoveryConfig> \| false` | Error recovery settings. Defaults to enabled |

```ts
player.use(dash({
  dashConfig: {
    streaming: { buffer: { bufferTimeDefault: 20 } }
  }
}));
```

## Error Recovery

Fatal dash.js errors trigger automatic retry with exponential backoff. Recovery is enabled by default.

| Setting | Default | Description |
|---------|---------|-------------|
| `maxRetries` | `3` | Maximum retry attempts before giving up |
| `retryDelay` | `3000` | Initial delay in milliseconds |
| `backoffMultiplier` | `2` | Multiplier per retry (3s → 6s → 12s) |

Recovery uses `mediaPlayer.reset()` followed by `mediaPlayer.initialize()` to reinitialize the player.

```ts
// Custom config
player.use(dash({ recovery: { maxRetries: 5, retryDelay: 1000 } }));

// Disable recovery
player.use(dash({ recovery: false }));
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

## Events

The DASH plugin maps dash.js errors to player `error` events. No additional custom events are emitted.

## Notes

- The plugin registers a `SourceHandler` — setting `player.src` to a `.mpd` URL is handled automatically.
- The dash.js instance is exposed via `player.getPluginData("dash")` for advanced use cases.
- Works with the [DRM plugin](/plugins/drm) — plugin order doesn't matter.
- **Not supported on Safari/iOS** — Safari lacks full MSE support required by dash.js.
- Size: **0.6 KB** gzip (wrapper only, dashjs is a separate peer dependency).
