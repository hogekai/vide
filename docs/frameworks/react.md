# React

React hooks and components for vide. Import from `@videts/vide/react`.

```sh
npm install @videts/vide react react-dom
```

## Quick Start

```tsx
import { useVidePlayer, useHls, Vide } from "@videts/vide/react";

function Player() {
  const { player, ref } = useVidePlayer();
  useHls(player);

  return <Vide.Video ref={ref} player={player} src="stream.m3u8" />;
}
```

## Hooks

### useVidePlayer()

Creates and manages a player instance.

```tsx
const { player, ref } = useVidePlayer();
```

- `player` — `Player | null`. `null` until the video element mounts.
- `ref` — Callback ref to pass to `<Vide.Video>`.
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

All hooks are safe to call with `player: null` (initial render).

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

### Vide.Video

Renders a `<video>` element and provides the player via React context.

```tsx
<Vide.Video ref={ref} player={player} src="video.mp4" className="rounded-lg">
  <Vide.PlayButton />
  <Vide.Progress />
</Vide.Video>
```

All standard `<video>` HTML attributes (`src`, `poster`, `muted`, `autoPlay`, etc.) are passed through.

### Plugin Components

Render nothing (`null`). Use for conditional plugin activation.

```tsx
<Vide.Video ref={ref} player={player} src="stream.m3u8">
  <Vide.HlsPlugin />
  {showAds && <Vide.VastPlugin tagUrl="https://..." />}
  {premium && <Vide.SsaiPlugin />}
</Vide.Video>
```

Available: `HlsPlugin`, `DashPlugin`, `DrmPlugin`, `VastPlugin`, `VmapPlugin`, `SsaiPlugin`.

### UI Components

Interactive controls that subscribe to player events via context.

```tsx
<Vide.Video ref={ref} player={player} src="video.mp4">
  <Vide.PlayButton className="rounded-full bg-white/80" />
  <Vide.Progress className="h-1" />
  <Vide.Volume className="w-24" />
  <Vide.TimeDisplay />
  <Vide.FullscreenButton />
  <Vide.MuteButton />
</Vide.Video>
```

| Component | Props | State Attributes |
|-----------|-------|-----------------|
| `PlayButton` | `className`, `children` | `data-playing` |
| `MuteButton` | `className`, `children` | `data-muted` |
| `Progress` | `className` | `data-disabled`, `--vide-progress`, `--vide-progress-buffered` |
| `Volume` | `className`, `children` | `data-muted`, `--vide-volume` |
| `FullscreenButton` | `className`, `children`, `target` | `data-fullscreen` |
| `TimeDisplay` | `className`, `separator` | — |

- `children` — custom icons or content (button components).
- CSS custom properties — use for styling sliders (same as vide UI plugin theme).
- `data-*` attributes — use for state-based CSS selectors.

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

### Direct Player Access

`player` is returned from `useVidePlayer()`, so you can control it directly:

```tsx
const { player, ref } = useVidePlayer();

return (
  <>
    <Vide.Video ref={ref} player={player} src="video.mp4" />
    <button onClick={() => player?.pause()}>Pause</button>
    <button onClick={() => { if (player) player.currentTime = 0; }}>
      Restart
    </button>
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
<Vide.Video ref={ref} player={player} />

// Individual imports
import { VideVideo, PlayButton, useVidePlayer, useHls } from "@videts/vide/react";
<VideVideo ref={ref} player={player} />
```

## Full Example

```tsx
import { useVidePlayer, useHls, useVideEvent, Vide } from "@videts/vide/react";

function VideoPlayer({ src, adTag }: { src: string; adTag?: string }) {
  const { player, ref } = useVidePlayer();
  useHls(player);

  useVideEvent(player, "statechange", ({ from, to }) => {
    console.log(`${from} → ${to}`);
  });

  return (
    <div className="relative aspect-video">
      <Vide.Video ref={ref} player={player} src={src} className="w-full">
        {adTag && <Vide.VastPlugin tagUrl={adTag} />}
        <Vide.PlayButton className="absolute inset-0 flex items-center justify-center">
          ▶
        </Vide.PlayButton>
        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 p-2">
          <Vide.Progress className="flex-1 h-1" />
          <Vide.TimeDisplay className="text-sm text-white" />
          <Vide.Volume className="w-20">🔊</Vide.Volume>
          <Vide.MuteButton>🔇</Vide.MuteButton>
          <Vide.FullscreenButton>⛶</Vide.FullscreenButton>
        </div>
      </Vide.Video>
    </div>
  );
}
```
