# UI

Headless UI plugin with 17 components. JS creates DOM and wires behavior — styling is yours. Import `theme.css` for a ready-made look.

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
| `include` | `UIComponentName[]` | — | Components to opt-in (overrides default exclusions) |
| `poster` | `string` | — | Poster image URL |

### Component Selection

`play`, `progress`, `time`, `volume`, `fullscreen`, `loader`, `error`, `bigplay`, `poster`, `keyboard`, `clickplay`, `autohide`, `ad-countdown`, `ad-skip`, `ad-overlay`, `ad-label`, `ad-learn-more`

The `ad-learn-more` component is off by default and needs `include: ["ad-learn-more"]` to enable.

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
| `ad-learn-more` | CTA "Learn More" button (opt-in, default off) |

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

```ts
// Enable the "Learn More" CTA button (off by default)
const uiPlugin = ui({ container: el, include: ["ad-learn-more"] });
```

## Styling

### With theme.css

```ts
import "@videts/vide/ui/theme.css";
```

Provides a complete default skin (**3.5 KB** gzip) with CSS custom properties. Override any token to retheme the player.

### Design Tokens

All tokens are defined as CSS custom properties on `:root`. Override them globally or scope to a container.

**Palette**

| Token | Default | Description |
|-------|---------|-------------|
| `--vide-accent` | `#e03e52` | Primary accent (progress bar, handle) |
| `--vide-accent-hover` | `#ee4f62` | Accent hover state |
| `--vide-text` | `#fff` | Primary text / icon fill |
| `--vide-text-mid` | `rgba(255,255,255,0.72)` | Secondary text (time display) |
| `--vide-text-dim` | `rgba(255,255,255,0.44)` | Tertiary text (disabled states) |

**Surfaces**

| Token | Default | Description |
|-------|---------|-------------|
| `--vide-bg` | `rgba(0,0,0,0.75)` | Background overlay |
| `--vide-chip` | `rgba(0,0,0,0.88)` | Chip background (ad label) |
| `--vide-chip-light` | `rgba(0,0,0,0.72)` | Lighter chip (ad countdown) |
| `--vide-hover` | `rgba(255,255,255,0.08)` | Button hover background |

**Layout**

| Token | Default | Description |
|-------|---------|-------------|
| `--vide-controls-height` | `48px` | Controls bar min-height |
| `--vide-controls-padding-x` | `12px` | Controls horizontal padding |
| `--vide-controls-padding-bottom` | `6px` | Controls bottom padding |
| `--vide-controls-gap` | `4px` | Gap between control items |

**Typography**

| Token | Default | Description |
|-------|---------|-------------|
| `--vide-font` | system sans-serif stack | Primary font family |
| `--vide-font-mono` | system monospace stack | Monospace font (time display) |
| `--vide-font-size` | `13px` | Base font size |
| `--vide-font-size-sm` | `11px` | Small font size |
| `--vide-font-size-xs` | `10px` | Extra-small font size |
| `--vide-line-height` | `1` | Base line-height |

**Icons / Buttons**

| Token | Default | Description |
|-------|---------|-------------|
| `--vide-icon-size` | `22px` | SVG icon dimensions |
| `--vide-btn-size` | `40px` | Control button dimensions |
| `--vide-btn-padding` | `8px` | Control button padding |

**Radius**

| Token | Default | Description |
|-------|---------|-------------|
| `--vide-radius` | `4px` | Default border-radius |
| `--vide-radius-sm` | `3px` | Small border-radius |
| `--vide-radius-round` | `50%` | Circular elements |

**Progress**

| Token | Default | Description |
|-------|---------|-------------|
| `--vide-progress-height` | `3px` | Track height |
| `--vide-progress-height-hover` | `5px` | Track height on hover / drag |
| `--vide-progress-hit-area` | `16px` | Clickable area height |
| `--vide-handle-size` | `13px` | Seek handle diameter |

**Easing**

| Token | Default | Description |
|-------|---------|-------------|
| `--vide-ease` | `cubic-bezier(0.4,0,0.2,1)` | Default easing curve |
| `--vide-duration` | `0.2s` | Default transition duration |
| `--vide-duration-fast` | `0.12s` | Fast transition duration |

**Ad**

| Token | Default | Description |
|-------|---------|-------------|
| `--vide-accent-ad` | `#f2c94c` | Ad accent (progress bar, label stripe) |
| `--vide-ad-label-stripe` | `3px` | Ad label left stripe width |
| `--vide-ad-label-pad-y` | `6px` | Ad label vertical padding |
| `--vide-ad-label-pad-x` | `10px` | Ad label horizontal padding |
| `--vide-ad-overlay-gap` | `12px` | Gap around ad overlays |

**Skip Button**

| Token | Default | Description |
|-------|---------|-------------|
| `--vide-skip-bg` | `rgba(24,24,28,0.85)` | Background |
| `--vide-skip-border` | `rgba(255,255,255,0.22)` | Border color |
| `--vide-skip-color` | `#fff` | Text / icon color |
| `--vide-skip-padding-y` | `10px` | Vertical padding |
| `--vide-skip-padding-x` | `16px` | Horizontal padding |
| `--vide-skip-font-size` | `14px` | Font size |
| `--vide-skip-gap` | `6px` | Icon–text gap |
| `--vide-skip-icon-size` | `18px` | Icon size |

**Override example:**

```css
/* Global — change accent to blue, enlarge buttons */
:root {
  --vide-accent: #3b82f6;
  --vide-accent-hover: #60a5fa;
  --vide-btn-size: 48px;
  --vide-icon-size: 26px;
}

/* Scoped — per player instance */
#my-player {
  --vide-accent: #10b981;
  --vide-font-size: 14px;
}
```

### State Classes

The root `.vide-ui` element receives state modifier classes that track player state. Use these for state-driven styling.

| Class | Active when |
|-------|-------------|
| `.vide-ui--idle` | No source loaded |
| `.vide-ui--loading` | Source loading |
| `.vide-ui--ready` | Ready to play |
| `.vide-ui--playing` | Playing |
| `.vide-ui--paused` | Paused |
| `.vide-ui--buffering` | Buffering |
| `.vide-ui--ended` | Playback ended |
| `.vide-ui--error` | Error occurred |
| `.vide-ui--ad-loading` | Ad loading |
| `.vide-ui--ad-playing` | Ad playing |
| `.vide-ui--ad-paused` | Ad paused |
| `.vide-ui--autohide` | Controls auto-hidden (mouse idle during playback) |

```css
/* Custom background when paused */
.vide-ui--paused .vide-controls {
  background: rgba(0, 0, 0, 0.9);
}

/* Dim controls during ad playback */
.vide-ui--ad-playing .vide-controls {
  opacity: 0.6;
}
```

### BEM Classes

The UI does not use Shadow DOM — all classes are global. Target them directly in your CSS.

**Core Controls**

| Class | Element |
|-------|---------|
| `.vide-controls` | Bottom controls bar |
| `.vide-play` | Play/pause button |
| `.vide-progress` | Progress bar container |
| `.vide-progress__bar` | Played fill |
| `.vide-progress__buffered` | Buffered fill |
| `.vide-progress__handle` | Seek handle |
| `.vide-progress--dragging` | During seek drag |
| `.vide-progress--disabled` | Disabled (during ads) |
| `.vide-time` | Time display |
| `.vide-time__separator` | "/" separator |
| `.vide-volume` | Volume control container |
| `.vide-volume__button` | Mute toggle |
| `.vide-volume__slider` | Slider track area |
| `.vide-volume__track` | Background track |
| `.vide-volume__filled` | Fill level |
| `.vide-fullscreen` | Fullscreen button |

**Overlays**

| Class | Element |
|-------|---------|
| `.vide-bigplay` | Centered play button |
| `.vide-clickplay` | Click-to-play/pause area |
| `.vide-loader` | Loading overlay |
| `.vide-loader__spinner` | Spinner |
| `.vide-error` | Error overlay |
| `.vide-poster` | Poster overlay |
| `.vide-poster__image` | Poster `<img>` |

**Ad Components**

| Class | Element |
|-------|---------|
| `.vide-ad` | Ad layer container |
| `.vide-ad-overlay` | Click-through overlay |
| `.vide-ad-label` | "Ad" label chip |
| `.vide-ad-countdown` | Remaining time chip |
| `.vide-skip` | Skip button |
| `.vide-skip--disabled` | Skip button before skipOffset |
| `.vide-ad-cta` | Companion CTA card |
| `.vide-ad-cta__icon` | CTA icon |
| `.vide-ad-cta__title` | CTA title |
| `.vide-ad-cta__url` | CTA URL |

**Full theme example:**

```css
:root {
  --vide-accent: #a78bfa;
  --vide-accent-hover: #c4b5fd;
  --vide-bg: rgba(15, 15, 20, 0.9);
  --vide-radius: 8px;
}

.vide-progress__bar {
  border-radius: 4px;
}

.vide-bigplay {
  background: rgba(15, 15, 20, 0.7);
  backdrop-filter: blur(8px);
}
```

## Notes

- The UI plugin does not render into a Shadow DOM — styles are global.
- Keyboard shortcuts: Space (play/pause), Left/Right (seek ±5s), Up/Down (volume), M (mute), F (fullscreen), 0-9 (seek to percentage).
- Touch: click/double-click handling for play/pause and fullscreen on mobile.
- Size: **5.3 KB** gzip (JS), **3.5 KB** gzip (theme.css).
