# React

React hooks and components for Vide. Import from `@videts/vide/react`.

```sh
npm install @videts/vide react react-dom
```

## Quick Start

```tsx
import { useVidePlayer, useHls, Vide } from "@videts/vide/react";
import "@videts/vide/ui/theme.css";

function Player() {
  const player = useVidePlayer();
  useHls(player);

  return (
    <Vide.Root player={player}>
      <Vide.UI>
        <Vide.Video src="stream.m3u8" />
        <Vide.Controls>
          <Vide.PlayButton />
          <Vide.Progress />
        </Vide.Controls>
      </Vide.UI>
    </Vide.Root>
  );
}
```

## Hooks

### useVidePlayer()

Creates and manages a player instance.

```tsx
const player = useVidePlayer();
```

- `player.current` — `Player | null`. `null` until the video element mounts.
- Pass `player` to `<Vide.Root player={player}>`. Ref wiring is automatic.
- Calls `player.destroy()` automatically on unmount.

### useHls / useDash / useDrm / useVast / useVmap / useSsai / useUi

Plugin hooks. Call `plugin.setup()` when player becomes available, clean up on unmount.

```tsx
useHls(player);
useHls(player, { hlsConfig: { maxBufferLength: 30 } });

useDash(player);
useDrm(player, { widevine: { licenseUrl: "..." } });
useVast(player, { tagUrl: "https://..." });
useVmap(player, { url: "https://..." });
useSsai(player);
useUi(player, { container: containerRef.current! });
```

All hooks are safe to call before the video element mounts (`player.current` is `null`).

### useVideEvent(player, event, handler)

Subscribe to player events with automatic cleanup.

```tsx
useVideEvent(player, "statechange", ({ from, to }) => {
  console.log(`${from} → ${to}`);
});

useVideEvent(player, "ad:start", ({ adId }) => {
  console.log("Ad started:", adId);
});
```

- Handler changes do not cause re-subscription (uses ref internally).
- Unsubscribes on unmount or when player/event changes.

## Components

### Vide.Root

Context provider. All Vide components must be children of `Vide.Root`.

```tsx
<Vide.Root player={player}>
  <Vide.UI>
    <Vide.Video src="video.mp4" />
    <Vide.Controls>
      <Vide.PlayButton />
    </Vide.Controls>
  </Vide.UI>
</Vide.Root>
```

- `player` — the handle returned by `useVidePlayer()`.

### Vide.UI

Container `<div>` with class `vide-ui`. Wraps both the video element and controls. Always renders (so `<Vide.Video>` can mount). Manages player state classes (`vide-ui--playing`, `vide-ui--paused`, etc.) for theme.css integration.

```tsx
<Vide.UI>
  <Vide.Video src="video.mp4" />
  <Vide.Controls>...</Vide.Controls>
</Vide.UI>
```

- All standard `<div>` HTML attributes are passed through.
- `className` is appended after `vide-ui`.

### Vide.Video

Renders a `<video>` element and binds the player to it. Must be inside `<Vide.Root>`.

```tsx
<Vide.Video src="video.mp4" poster="thumb.jpg" />
```

- All standard `<video>` HTML attributes (`src`, `poster`, `muted`, `autoPlay`, etc.) are passed through.

### Vide.Controls

Container `<div>` with class `vide-controls`. Renders only after the player is ready. Place UI components inside.

```tsx
<Vide.Controls>
  <Vide.PlayButton />
  <Vide.Progress />
  <Vide.TimeDisplay />
  <Vide.Volume />
  <Vide.FullscreenButton />
</Vide.Controls>
```

- All standard `<div>` HTML attributes are passed through.
- `className` is appended after `vide-controls`.

### Plugin Components

Render nothing (`null`). Use for conditional plugin activation. Place as children of `<Vide.Root>`.

```tsx
<Vide.Root player={player}>
  <Vide.HlsPlugin />
  {showAds && <Vide.VastPlugin tagUrl="https://..." />}
  <Vide.UI>
    <Vide.Video src="stream.m3u8" />
    <Vide.Controls>...</Vide.Controls>
  </Vide.UI>
</Vide.Root>
```

Available: `HlsPlugin`, `DashPlugin`, `DrmPlugin`, `VastPlugin`, `VmapPlugin`, `SsaiPlugin`.

### UI Components

Interactive controls that subscribe to player events via context. Place inside `<Vide.Controls>`.

Each component has a default CSS class matching the vanilla UI plugin (`vide-play`, `vide-progress`, etc.), so `theme.css` styles apply automatically.

```tsx
<Vide.Controls>
  <Vide.PlayButton />
  <Vide.Progress />
  <Vide.Volume />
  <Vide.TimeDisplay />
  <Vide.FullscreenButton />
  <Vide.MuteButton />
</Vide.Controls>
```

| Component | Default Class | Props | State Attributes |
|-----------|--------------|-------|-----------------|
| `PlayButton` | `vide-play` | `className`, `children` | `data-playing` |
| `MuteButton` | `vide-mute` | `className`, `children` | `data-muted` |
| `Progress` | `vide-progress` | `className` | `data-disabled`, `--vide-progress`, `--vide-progress-buffered` |
| `Volume` | `vide-volume` | `className`, `children` | `data-muted`, `--vide-volume` |
| `FullscreenButton` | `vide-fullscreen` | `className`, `children`, `target` | `data-fullscreen` |
| `TimeDisplay` | `vide-time` | `className`, `separator` | — |

- `children` — custom icons or content (button components).
- CSS custom properties — use for styling sliders (same as Vide UI plugin theme).
- `data-*` attributes — use for state-based CSS selectors.
- `className` is appended after the default class, not replacing it.

### Ad Components

Components for ad overlay, controls, and CTA during ad playback. Use with `useVast()` or `useVmap()`. Each component auto-subscribes to ad events via context and renders only during active ads.

```tsx
<Vide.AdOverlay />
<Vide.AdLabel />
<Vide.AdCountdown />
<Vide.AdSkip />
```

| Component | Default Class | Props |
|-----------|--------------|-------|
| `AdOverlay` | `vide-ad-overlay` | `className`, `children` |
| `AdSkip` | `vide-skip` | `className`, `children` |
| `AdCountdown` | `vide-ad-countdown` | `className`, `format` |
| `AdLabel` | `vide-ad-label` | `className`, `children` |
| `AdLearnMore` | `vide-ad-cta` | `className`, `children`, `showTitle` |

### useAdState(player)

Low-level hook for custom ad UI. Returns `{ active, meta }`.

```tsx
const player = useVideContext();
const { active, meta } = useAdState(player);

if (active && meta?.clickThrough) {
  // render custom CTA
}
```

- `active` — `boolean`, true during ad playback.
- `meta` — `AdMeta | null` with `adId`, `clickThrough`, `skipOffset`, `duration`, `adTitle`.

## Patterns

### Hook vs Component for Plugins

**Hooks** — always active, configure at mount:

```tsx
useHls(player);
useVast(player, { tagUrl: "..." });
```

**Components** — conditional activation via JSX:

```tsx
{showAds && <Vide.VastPlugin tagUrl="..." />}
```

Use hooks when the plugin is always needed. Use components when you need conditional rendering.

### Headless (no UI)

```tsx
<Vide.Root player={player}>
  <Vide.UI>
    <Vide.Video src="video.mp4" />
  </Vide.UI>
</Vide.Root>
```

### Direct Player Access

`player.current` gives you direct access to the player instance:

```tsx
const player = useVidePlayer();

player.current?.play();
player.current?.pause();
player.current?.currentTime;

return (
  <>
    <Vide.Root player={player}>
      <Vide.UI>
        <Vide.Video src="video.mp4" />
      </Vide.UI>
    </Vide.Root>
    <button onClick={() => player.current?.pause()}>Pause</button>
  </>
);
```

### Ad Plugins (OMID, SIMID)

`omid()` and `simid()` are ad-level plugins, not player-level. Pass them via the `adPlugins` option:

```tsx
import { omid } from "@videts/vide/omid";
import { simid } from "@videts/vide/simid";

useVast(player, {
  tagUrl: "https://...",
  adPlugins: (ad) => [
    omid({ partner: { name: "myapp", version: "1.0" } }),
    simid({ container: containerRef.current! }),
  ],
});
```

## Import Styles

```tsx
// Namespace style
import { Vide, useVidePlayer, useHls } from "@videts/vide/react";
<Vide.Root player={player}>
  <Vide.UI>
    <Vide.Video />
  </Vide.UI>
</Vide.Root>

// Individual imports
import { VideRoot, VideUI, VideVideo, VideControls, PlayButton } from "@videts/vide/react";
<VideRoot player={player}>
  <VideUI>
    <VideVideo />
  </VideUI>
</VideRoot>
```

## Full Example

```tsx
import { useVidePlayer, useHls, useVideEvent, Vide } from "@videts/vide/react";
import "@videts/vide/ui/theme.css";

function VideoPlayer({ src, adTag }: { src: string; adTag?: string }) {
  const player = useVidePlayer();
  useHls(player);

  useVideEvent(player, "statechange", ({ from, to }) => {
    console.log(`${from} → ${to}`);
  });

  return (
    <Vide.Root player={player}>
      {adTag && <Vide.VastPlugin tagUrl={adTag} />}
      <Vide.UI>
        <Vide.Video src={src} />
        <Vide.AdOverlay />
        <Vide.AdLabel />
        <Vide.AdCountdown />
        <Vide.AdSkip />
        <Vide.Controls>
          <Vide.PlayButton />
          <Vide.Progress />
          <Vide.TimeDisplay />
          <Vide.Volume />
          <Vide.FullscreenButton />
        </Vide.Controls>
      </Vide.UI>
    </Vide.Root>
  );
}
```
