# UI

Headless UI plugin with 13 components. JS creates DOM and wires behavior — styling is yours. Import `theme.css` for a ready-made look.

## Usage

```html
<div id="player-container">
  <video src="video.mp4"></video>
</div>
```

```ts
import { createPlayer } from "@videts/vide";
import { ui } from "@videts/vide/ui";
import "@videts/vide/ui/theme.css"; // optional — brings default skin

const player = createPlayer(document.querySelector("video")!);
player.use(ui({ container: document.getElementById("player-container")! }));
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | `HTMLElement` | — | Container element for UI controls (required) |
| `exclude` | `UIComponentName[]` | `[]` | Components to exclude |
| `poster` | `string` | — | Poster image URL |

### Excludable Components

`play`, `progress`, `time`, `volume`, `fullscreen`, `loader`, `error`, `bigplay`, `poster`, `keyboard`, `clickplay`, `autohide`, `ad-countdown`, `ad-skip`, `ad-overlay`, `ad-label`

```ts
player.use(ui({
  container: el,
  exclude: ["volume", "fullscreen"],
  poster: "https://example.com/poster.jpg",
}));
```

## Components

| Component | Description |
|-----------|-------------|
| `play` | Play/pause toggle button |
| `progress` | Seekable progress bar |
| `time` | Current time / duration display |
| `volume` | Volume slider with mute toggle |
| `fullscreen` | Fullscreen toggle button |
| `loader` | Loading spinner |
| `error` | Error message overlay |
| `bigplay` | Centered play button overlay |
| `poster` | Poster image overlay |
| `keyboard` | Keyboard shortcuts (Space, arrows, M, F, 0-9) |
| `clickplay` | Click-to-play/pause on video area |
| `autohide` | Auto-hide controls after inactivity |
| `ad-countdown` | Ad remaining time countdown |
| `ad-skip` | Skip ad button (after skipOffset) |
| `ad-overlay` | Ad click-through overlay |
| `ad-label` | "Ad" label during ad playback |

## Standalone Components

Components can be used individually outside the `ui()` convenience plugin:

```ts
import { createPlayButton, createProgress } from "@videts/vide/ui";

const play = createPlayButton();
play.mount(controls);
play.connect(player);
```

Each component implements the `UIComponent` interface:

```ts
interface UIComponent {
  mount(container: HTMLElement): void;
  connect(player: Player): void;
  destroy(): void;
}
```

## UI + VAST Ads

The UI plugin provides ad components that integrate with VAST via `getAdPlugin()`:

```html
<div id="player-container">
  <video src="video.mp4"></video>
</div>
```

```ts
import { ui } from "@videts/vide/ui";
import { vast } from "@videts/vide/vast";

const uiPlugin = ui({ container: document.getElementById("player-container")! });
player.use(uiPlugin);
player.use(vast({
  tagUrl: "https://example.com/vast.xml",
  adPlugins: uiPlugin.getAdPlugin(),
}));
```

## Styling

### With theme.css

```ts
import "@videts/vide/ui/theme.css";
```

Provides a complete default skin with CSS custom properties (design tokens).

### Custom Styling

Target BEM class names:

```css
.vide-play { }
.vide-progress { }
.vide-progress__bar { }
.vide-volume { }
.vide-time { }
/* ... */
```

## Notes

- The UI plugin does not render into a Shadow DOM — styles are global.
- Keyboard shortcuts: Space (play/pause), Left/Right (seek ±5s), Up/Down (volume), M (mute), F (fullscreen), 0-9 (seek to percentage).
- Touch: click/double-click handling for play/pause and fullscreen on mobile.
- Size: **4.7 KB** gzip (JS), **3.4 KB** gzip (theme.css).
