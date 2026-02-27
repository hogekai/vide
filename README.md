# vide

Lightweight video player library. Web standards first, zero config, explicit plugin opt-in.

## Install

```sh
npm install vide
```

## Quick Start

```ts
import { createPlayer } from "vide";

const player = createPlayer(document.querySelector("video")!);

player.on("statechange", ({ from, to }) => console.log(`${from} → ${to}`));
player.play();
```

## Plugins

Plugins are explicit opt-in. Import only what you need.

### HLS Streaming

```sh
npm install hls.js
```

```ts
import { createPlayer } from "vide";
import { hls } from "vide/hls";

const player = createPlayer(document.querySelector("video")!);
player.use(hls());

player.src = "https://example.com/stream.m3u8";
```

- Safari/iOS uses native HLS (no hls.js needed)
- Non-Safari uses hls.js via dynamic import
- `hlsConfig` option passes config directly to hls.js constructor

```ts
player.use(hls({ hlsConfig: { maxBufferLength: 60 } }));
```

`<source>` elements are auto-detected:

```html
<video>
  <source src="stream.m3u8" type="application/vnd.apple.mpegurl">
</video>
```

```ts
const player = createPlayer(document.querySelector("video")!);
player.use(hls()); // auto-loads from <source>
```

### VAST Ads

```ts
import { vast } from "vide/vast";
player.use(vast({ tagUrl: "https://example.com/vast.xml" }));
```

### VMAP Ad Scheduling

```ts
import { vmap } from "vide/vmap";
player.use(vmap({ vmapUrl: "https://example.com/vmap.xml" }));
```

### OMID Viewability

```ts
import { omid } from "vide/omid";
player.use(omid());
```

### SIMID Interactive Ads

```ts
import { simid } from "vide/simid";
player.use(simid());
```

## API

### `createPlayer(el: HTMLVideoElement): Player`

Wraps a `<video>` element. Returns a `Player` with:

| Property / Method | Description |
|---|---|
| `state` | Current state: `idle` \| `loading` \| `ready` \| `playing` \| `paused` \| `buffering` \| `ended` \| `error` |
| `src` | Get/set media source URL. Triggers SourceHandler lookup |
| `play()` / `pause()` | Delegates to HTMLVideoElement |
| `currentTime` / `duration` / `volume` / `muted` / `playbackRate` | Proxied from HTMLVideoElement |
| `on(event, handler)` / `off()` / `once()` | EventBus for player events |
| `use(plugin)` | Register a plugin |
| `registerSourceHandler(handler)` | Register custom source handler |
| `destroy()` | Cleanup all plugins and listeners |

### Events

`statechange`, `play`, `pause`, `ended`, `timeupdate`, `error`, `destroy`

Ad events: `ad:start`, `ad:end`, `ad:skip`, `ad:click`, `ad:error`, `ad:impression`, `ad:loaded`, `ad:quartile`, `ad:mute`, `ad:unmute`, `ad:volumeChange`, `ad:fullscreen`, `ad:breakStart`, `ad:breakEnd`

## Entry Points

| Import | Description |
|---|---|
| `vide` | Core player |
| `vide/hls` | HLS streaming (hls.js) |
| `vide/vast` | VAST 4.1 linear ads |
| `vide/vmap` | VMAP ad scheduling |
| `vide/omid` | OMID viewability |
| `vide/simid` | SIMID interactive ads |

## License

MIT
