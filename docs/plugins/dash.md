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

```ts
player.use(dash({
  dashConfig: {
    streaming: { buffer: { bufferTimeDefault: 20 } }
  }
}));
```

## Events

The DASH plugin maps dash.js errors to player `error` events. No additional custom events are emitted.

## Notes

- The plugin registers a `SourceHandler` — setting `player.src` to a `.mpd` URL is handled automatically.
- The dash.js instance is exposed via `player.getPluginData("dash")` for advanced use cases.
- Works with the [DRM plugin](/plugins/drm) — plugin order doesn't matter.
- **Not supported on Safari/iOS** — Safari lacks full MSE support required by dash.js.
- Size: **0.6 KB** gzip (wrapper only, dashjs is a separate peer dependency).
