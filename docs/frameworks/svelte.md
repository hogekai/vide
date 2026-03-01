# Svelte

Svelte 5 functions and components for Vide. Import from `@videts/vide/svelte`.

```sh
npm install @videts/vide svelte
```

Requires Svelte 5 (runes).

## Quick Start

Core only — no UI, no plugins:

```svelte
<script>
  import { createVidePlayer, VideVideo } from "@videts/vide/svelte";

  const player = createVidePlayer();
</script>

<VideVideo src="video.mp4" />
```

With headless UI components and HLS streaming:

```svelte
<script>
  import {
    createVidePlayer, useHls,
    VideUI, VideVideo, VideControls, PlayButton, Progress,
  } from "@videts/vide/svelte";
  // Optional — default theme. Omit to style from scratch.
  import "@videts/vide/ui/theme.css";

  const player = createVidePlayer();
  useHls(player);
</script>

<VideUI>
  <VideVideo src="stream.m3u8" />
  <VideControls>
    <PlayButton />
    <Progress />
  </VideControls>
</VideUI>
```

## Functions

### createVidePlayer()

Creates and manages a player instance. Provides it to child components via `setContext`.

```ts
const player = createVidePlayer();
```

- Returns a `PlayerGetter` (`() => Player | null`). Call `player()` to access the current player instance.
- `player()` returns `null` until `<VideVideo>` mounts.
- Calls `player().destroy()` automatically when the component is destroyed.
- Must be called in a parent component's `<script>` block before `<VideVideo>` is used.

### useHls / useDash / useDrm / useVast / useVmap / useSsai / useUi

Plugin functions. Call `plugin.setup()` when player becomes available, clean up on destroy.

```ts
useHls(player);
useHls(player, { hlsConfig: { maxBufferLength: 30 } });

useDash(player);
useDrm(player, { widevine: { licenseUrl: "..." } });
useVast(player, { tagUrl: "https://..." });
useVmap(player, { url: "https://..." });
useSsai(player);
useUi(player, { container: containerEl });
```

All functions take a `PlayerGetter` (`() => Player | null`) as the first argument. Since `createVidePlayer()` returns a getter, pass it directly. Safe to call before mount.

### useVideEvent(getPlayer, event, handler)

Subscribe to player events with automatic cleanup.

```ts
useVideEvent(player, "statechange", ({ from, to }) => {
  console.log(`${from} → ${to}`);
});

useVideEvent(player, "ad:start", ({ adId }) => {
  console.log("Ad started:", adId);
});
```

- Unsubscribes when the component is destroyed or player changes.

## Components

### VideUI

Container `<section>` with class `vide-ui`. Wraps both the video element and controls. Manages player state classes (`vide-ui--playing`, `vide-ui--paused`, etc.) for theme.css integration.

```svelte
<VideUI>
  <VideVideo src="video.mp4" />
  <VideControls>...</VideControls>
</VideUI>
```

- All standard HTML attributes are passed through.
- `class` is appended after `vide-ui`.

### VideVideo

Renders a `<video>` element and connects to the player via `getContext`.

```svelte
<VideUI>
  <VideVideo src="video.mp4" class="rounded-lg" />
  <VideControls>
    <PlayButton />
    <Progress />
  </VideControls>
</VideUI>
```

- All attributes (`src`, `poster`, `muted`, `autoplay`, `class`, etc.) are passed to the `<video>` element.

### VideControls

Container `<div>` with class `vide-controls`. Renders only after the player is ready. Place UI components inside.

```svelte
<VideControls>
  <PlayButton />
  <Progress />
  <TimeDisplay />
  <Volume />
  <FullscreenButton />
</VideControls>
```

- All standard `<div>` HTML attributes are passed through.
- `class` is appended after `vide-controls`.

### Plugin Components

Render nothing. Use for conditional plugin activation with `{#if}`.

```svelte
<VideUI>
  <VideVideo src="stream.m3u8" />
  <HlsPlugin />
  {#if showAds}
    <VastPlugin tagUrl="https://..." />
  {/if}
  {#if premium}
    <SsaiPlugin />
  {/if}
</VideUI>
```

Available: `HlsPlugin`, `DashPlugin`, `DrmPlugin`, `VastPlugin`, `VmapPlugin`, `SsaiPlugin`.

### UI Components

Interactive controls that subscribe to player events via context.

```svelte
<VideUI>
  <VideVideo src="video.mp4" />
  <VideControls>
    <PlayButton class="rounded-full bg-white/80" />
    <Progress class="h-1" />
    <Volume class="w-24" />
    <TimeDisplay />
    <FullscreenButton />
    <MuteButton />
  </VideControls>
</VideUI>
```

| Component | Props | State Attributes |
|-----------|-------|-----------------|
| `PlayButton` | `class`, children | `data-playing` |
| `MuteButton` | `class`, children | `data-muted` |
| `Progress` | `class` | `data-disabled`, `--vide-progress`, `--vide-progress-buffered` |
| `Volume` | `class`, children | `data-muted`, `--vide-volume` |
| `FullscreenButton` | `class`, `target`, children | `data-fullscreen` |
| `TimeDisplay` | `class`, `separator` | — |

- Children — custom icons or content (button components), rendered via Svelte 5 snippets.
- CSS custom properties — use for styling sliders (same as Vide UI plugin theme).
- `data-*` attributes — use for state-based CSS selectors.

### Ad Components

Components for ad overlay, controls, and CTA during ad playback.

```svelte
<AdOverlay />
<AdLabel />
<AdCountdown />
<AdSkip />
```

| Component | Props |
|-----------|-------|
| `AdOverlay` | `class`, children |
| `AdSkip` | `class`, children |
| `AdCountdown` | `class`, `format` |
| `AdLabel` | `class`, children |
| `AdLearnMore` | `class`, `showTitle`, children |

### useAdState(getPlayer)

Low-level function for custom ad UI. Returns `{ active: boolean, meta: AdMeta | null }` (reactive via runes).

```ts
const getPlayer = getContext<PlayerGetter>(VIDE_PLAYER_KEY);
const { active, meta } = useAdState(getPlayer);
```

## Patterns

### Function vs Component for Plugins

**Functions** — always active, configure in `<script>`:

```ts
useHls(player);
useVast(player, { tagUrl: "..." });
```

**Components** — conditional activation via `{#if}`:

```svelte
{#if showAds}
  <VastPlugin tagUrl="..." />
{/if}
```

Use functions when the plugin is always needed. Use components when you need conditional rendering.

### Direct Player Access

`createVidePlayer()` returns a getter function. Call `player()` to access the underlying `Player` instance:

```svelte
<script>
  import { createVidePlayer, useHls, VideUI, VideVideo } from "@videts/vide/svelte";

  const player = createVidePlayer();
  useHls(player);
</script>

<VideUI>
  <VideVideo src="video.mp4" />
</VideUI>
<button onclick={() => player()?.pause()}>Pause</button>
<button onclick={() => { if (player()) player()!.currentTime = 0 }}>
  Restart
</button>
```

### Custom Components

Build your own player components using `useVideContext()` and `useVideEvent()`. All built-in components follow this same pattern.

#### Basics

`useVideContext()` returns a `PlayerGetter` (`() => Player | null`) from context. Must be inside a component tree where `createVidePlayer()` was called.

```svelte
<script>
  import { useVideContext, useVideEvent } from "@videts/vide/svelte";

  const player = useVideContext();
  let time = $state(0);

  useVideEvent(player, "timeupdate", ({ currentTime }) => {
    time = currentTime;
  });
</script>

<span>{Math.floor(time)}s</span>
```

Use it inside `<VideUI>` (or anywhere within the provider tree):

```svelte
<VideUI>
  <VideVideo src="video.mp4" />
  <VideControls>
    <PlayButton />
    <CurrentTime />
  </VideControls>
</VideUI>
```

#### Subscribing to State Changes

```svelte
<script>
  import { useVideContext, useVideEvent } from "@videts/vide/svelte";

  const player = useVideContext();
  let state = $state("idle");

  useVideEvent(player, "statechange", ({ to }) => {
    state = to;
  });
</script>

<div class="my-state-badge">{state}</div>
```

#### Calling Player Methods

Call `player()` to access the player instance for actions. Guard with a null check since it returns `null` before mount.

```svelte
<script>
  import { useVideContext } from "@videts/vide/svelte";

  interface Props {
    seconds?: number;
  }

  const { seconds = 10 }: Props = $props();

  const player = useVideContext();

  function onClick() {
    const p = player();
    if (!p) return;
    p.currentTime = Math.min(
      p.currentTime + seconds,
      p.el.duration,
    );
  }
</script>

<button onclick={onClick}>+{seconds}s</button>
```

#### Ad-Aware Components

Use `useAdState()` for components that react to ad playback.

```svelte
<script>
  import { useVideContext, useAdState } from "@videts/vide/svelte";

  const player = useVideContext();
  const { active } = useAdState(player);
</script>

{#if !active}
  <div class="my-overlay">...</div>
{/if}
```

#### Available Functions

| Function | Purpose |
|----------|---------|
| `useVideContext()` | Get `PlayerGetter` (`() => Player \| null`) from context |
| `useVideEvent(getPlayer, event, handler)` | Subscribe to player events with auto-cleanup |
| `useAdState(getPlayer)` | Get `{ active: boolean, meta: AdMeta \| null }` for ad state (reactive via runes) |
| `useAutohide(getContainer, getPlayer)` | Auto-hide controls on inactivity |
| `useKeyboard(getContainer, getPlayer)` | Keyboard shortcuts (space, arrows, etc.) |

### Ad Plugins (OMID, SIMID, VPAID)

`omid()`, `simid()`, and `vpaid()` are ad-level plugins, not player-level. Pass them via the `adPlugins` option:

```ts
import { omid } from "@videts/vide/omid";
import { simid } from "@videts/vide/simid";
import { vpaid } from "@videts/vide/vpaid";

useVast(player, {
  tagUrl: "https://...",
  adPlugins: (ad) => [
    omid({ partner: { name: "myapp", version: "1.0" } }),
    vpaid({ container: adContainerEl }),
    simid({ container: adContainerEl }),
  ],
});
```

### Ad Container {#ad-container}

VPAID and SIMID render interactive content inside a `container` element that must overlay the player. When using the UI plugin, the container needs `z-index: 3` to sit above the UI's click overlay:

```svelte
<script>
  import { createVidePlayer, useVast, VideUI, VideVideo, VideControls } from "@videts/vide/svelte";
  import { vpaid } from "@videts/vide/vpaid";

  const player = createVidePlayer();
  let adContainerEl;

  useVast(player, {
    tagUrl: "https://...",
    adPlugins: () => [
      vpaid({ container: adContainerEl }),
    ],
  });
</script>

<div style="position: relative">
  <VideUI>
    <VideVideo src="video.mp4" />
    <VideControls>...</VideControls>
  </VideUI>
  <div
    bind:this={adContainerEl}
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;
           z-index: 3; pointer-events: none;"
  />
</div>
```

> The ad container children need `pointer-events: auto` — the VPAID/SIMID plugins set this on their slot elements automatically.

## Import Styles

```ts
import {
  createVidePlayer, useHls, useVideEvent,
  VideVideo, PlayButton, Progress,
  Volume, MuteButton, FullscreenButton,
  TimeDisplay, HlsPlugin, VastPlugin,
} from "@videts/vide/svelte";
```

## Full Example

```svelte
<script lang="ts">
  import {
    createVidePlayer, useHls, useVideEvent,
    VideUI, VideVideo, VideControls,
    PlayButton, Progress,
    Volume, MuteButton, FullscreenButton,
    TimeDisplay, VastPlugin,
    AdOverlay, AdLabel, AdCountdown, AdSkip,
  } from "@videts/vide/svelte";

  const player = createVidePlayer();
  useHls(player);

  let showAds = $state(true);

  useVideEvent(player, "statechange", ({ from, to }) => {
    console.log(`${from} → ${to}`);
  });
</script>

<div class="relative aspect-video">
  <VideUI>
    <VideVideo src="stream.m3u8" class="w-full" />
    {#if showAds}
      <VastPlugin tagUrl="https://..." />
    {/if}
    <AdOverlay />
    <AdLabel />
    <AdCountdown />
    <AdSkip />
    <PlayButton class="absolute inset-0 flex items-center justify-center">
      ▶
    </PlayButton>
    <VideControls>
      <Progress class="flex-1 h-1" />
      <TimeDisplay class="text-sm text-white" />
      <Volume class="w-20" />
      <MuteButton />
      <FullscreenButton />
    </VideControls>
  </VideUI>
</div>
```
