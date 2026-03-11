# API Overview

Vide's API is minimal by design. The core surface is `createPlayer()` — everything else is a plugin.

## Player

```ts
import { createPlayer } from "@videts/vide";

const player = createPlayer(document.querySelector("video")!);
```

### Most-Used APIs

```ts
player.src = "video.mp4";         // Set source (triggers source handlers)
player.play();                     // Proxied from HTMLVideoElement
player.pause();                    // Proxied from HTMLVideoElement
player.on("statechange", fn);     // Typed event bus
player.use(plugin());              // Register a plugin
player.destroy();                  // Cleanup everything
```

### Properties

All HTMLVideoElement properties are proxied: `currentTime`, `duration`, `volume`, `muted`, `playbackRate`, `paused`, `ended`, `src`, `poster`, `autoplay`, `loop`, `preload`, `controls`, `crossOrigin`.

Additional properties:

| Property | Type | Description |
|----------|------|-------------|
| `el` | `HTMLVideoElement` | Direct access to the underlying element |
| `state` | `PlayerState` | Current state machine state |
| `isLive` | `boolean` | Whether the current source is a live stream |
| `isAudio` | `boolean` | Whether wrapping an `<audio>` element |
| `qualities` | `QualityLevel[]` | Available quality levels (set by HLS/DASH) |
| `currentQuality` | `QualityLevel \| null` | Active quality level |
| `isAutoQuality` | `boolean` | Whether auto quality selection is active |
| `textTracks` | `VideTextTrack[]` | Available text tracks |
| `activeCues` | `VideCue[]` | Currently active cues |

### Methods

| Method | Description |
|--------|-------------|
| `use(plugin)` | Register a plugin |
| `on(event, handler)` | Subscribe to an event |
| `off(event, handler)` | Unsubscribe from an event |
| `once(event, handler)` | Subscribe to an event (fires once) |
| `emit(event, data)` | Emit an event |
| `setQuality(id)` | Set quality level (-1 for auto) |
| `getTextTracks()` | Get all text tracks |
| `getActiveTextTrack()` | Get the active text track |
| `setTextTrack(id)` | Activate a text track (-1 to disable) |
| `addTextTrack(track)` | Add a text track |
| `setPluginData(key, value)` | Store plugin data |
| `getPluginData(key)` | Retrieve plugin data |
| `destroy()` | Cleanup all plugins and listeners |

### States

```
idle → loading → ready → playing ⇄ paused → ended
                    ↘ ad:loading → ad:playing ⇄ ad:paused ↗
```

Any state can transition to `error`.

## Full API Reference

The complete auto-generated API reference is available at [API Reference](/api-reference/).

| Module | Import |
|--------|--------|
| [Core](/api-reference/index/) | `@videts/vide` |
| [VAST](/api-reference/vast/) | `@videts/vide/vast` |
| [VMAP](/api-reference/vmap/) | `@videts/vide/vmap` |
| [HLS](/api-reference/hls/) | `@videts/vide/hls` |
| [DASH](/api-reference/dash/) | `@videts/vide/dash` |
| [DRM](/api-reference/drm/) | `@videts/vide/drm` |
| [SSAI](/api-reference/ssai/) | `@videts/vide/ssai` |
| [UI](/api-reference/ui/) | `@videts/vide/ui` |
| [OMID](/api-reference/omid/) | `@videts/vide/omid` |
| [SIMID](/api-reference/simid/) | `@videts/vide/simid` |
