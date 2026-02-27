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

```ts
player.use(hls({ hlsConfig: { maxBufferLength: 60 } }));
```

## Events

The HLS plugin maps hls.js fatal errors to player `error` events. No additional custom events are emitted.

## Notes

- The plugin registers a `SourceHandler` — setting `player.src` to a `.m3u8` URL is handled automatically.
- On Safari/iOS where native HLS is supported, hls.js is not imported at all.
- The hls.js instance is exposed via `player.getPluginData("hls")` for advanced use cases.
- Works with the [DRM plugin](/plugins/drm) — plugin order doesn't matter.
- Size: **0.6 KB** gzip (wrapper only, hls.js is a separate peer dependency).
