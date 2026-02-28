# Audio

vide supports `<audio>` elements with the same API as `<video>`. Useful for podcasts, music players, and audio ads.

## Usage

```html
<audio src="podcast.mp3"></audio>
```

```ts
import { createPlayer } from "@videts/vide";

const player = createPlayer(document.querySelector("audio")!);
player.play();
```

The API is identical — `play()`, `pause()`, `currentTime`, `volume`, `on()`, `use()`, everything works the same.

## `player.isAudio`

```ts
player.isAudio; // true for <audio>, false for <video>
```

Use this to branch behavior at runtime when needed.

## Video-only properties

Properties that don't apply to audio return safe defaults:

| Property | Audio value |
|----------|-------------|
| `videoWidth` | `0` |
| `videoHeight` | `0` |
| `poster` (get) | `""` |
| `poster` (set) | no-op |

## UI plugin

The UI plugin auto-excludes `fullscreen` and `poster` for audio elements. No configuration needed.

```ts
import { ui } from "@videts/vide/ui";

player.use(ui({ container: document.getElementById("player-container")! }));
// play, progress, time, volume controls all work
// fullscreen and poster are automatically excluded
```

## Plugins

All plugins work with `<audio>`:

- **HLS** — audio-only HLS streams
- **VAST** — audio ad insertion
- **VMAP** — audio ad scheduling
- **DRM** — encrypted audio playback
