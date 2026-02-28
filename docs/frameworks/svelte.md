# Svelte

Svelte 5 functions and components for vide. Import from `@videts/vide/svelte`.

```sh
npm install @videts/vide svelte
```

Requires Svelte 5 (runes).

## Quick Start

```svelte
<script>
  import { createVidePlayer, useHls, VideVideo } from "@videts/vide/svelte";

  const { player } = createVidePlayer();
  useHls(() => player);
</script>

<VideVideo src="stream.m3u8" />
```

## Functions

### createVidePlayer()

Creates and manages a player instance. Provides it to child components via `setContext`.

```ts
const { player } = createVidePlayer();
```

- `player` — `Player | null`. `null` until `<VideVideo>` mounts.
- Calls `player.destroy()` automatically when the component is destroyed.
- Must be called in a parent component's `<script>` block before `<VideVideo>` is used.

### useHls / useDash / useDrm / useVast / useVmap / useSsai / useUi

Plugin functions. Call `plugin.setup()` when player becomes available, clean up on destroy.

```ts
useHls(() => player);
useHls(() => player, { hlsConfig: { maxBufferLength: 30 } });

useDash(() => player);
useDrm(() => player, { widevine: { licenseUrl: "..." } });
useVast(() => player, { tagUrl: "https://..." });
useVmap(() => player, { url: "https://..." });
useSsai(() => player);
useUi(() => player, { container: containerEl });
```

All functions take a getter `() => Player | null` as the first argument to preserve reactivity. Safe to call before mount (`player === null`).

### useVideEvent(getPlayer, event, handler)

Subscribe to player events with automatic cleanup.

```ts
useVideEvent(() => player, "statechange", ({ from, to }) => {
  console.log(`${from} → ${to}`);
});

useVideEvent(() => player, "ad:start", ({ adId }) => {
  console.log("Ad started:", adId);
});
```

- Unsubscribes when the component is destroyed or player changes.

## Components

### VideVideo

Renders a `<video>` element inside a wrapper `<div>` and connects to the player via `getContext`.

```svelte
<VideVideo src="video.mp4" class="rounded-lg">
  <PlayButton />
  <Progress />
</VideVideo>
```

- `class` is applied to the wrapper `<div>`.
- All other attributes (`src`, `poster`, `muted`, `autoplay`, etc.) are passed to the `<video>` element.
- Children are rendered alongside the video element via Svelte 5 snippets.

### Plugin Components

Render nothing. Use for conditional plugin activation with `{#if}`.

```svelte
<VideVideo src="stream.m3u8">
  <HlsPlugin />
  {#if showAds}
    <VastPlugin tagUrl="https://..." />
  {/if}
  {#if premium}
    <SsaiPlugin />
  {/if}
</VideVideo>
```

Available: `HlsPlugin`, `DashPlugin`, `DrmPlugin`, `VastPlugin`, `VmapPlugin`, `SsaiPlugin`.

### UI Components

Interactive controls that subscribe to player events via context.

```svelte
<VideVideo src="video.mp4">
  <PlayButton class="rounded-full bg-white/80" />
  <Progress class="h-1" />
  <Volume class="w-24" />
  <TimeDisplay />
  <FullscreenButton />
  <MuteButton />
</VideVideo>
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
- CSS custom properties — use for styling sliders (same as vide UI plugin theme).
- `data-*` attributes — use for state-based CSS selectors.

## Patterns

### Function vs Component for Plugins

**Functions** — always active, configure in `<script>`:

```ts
useHls(() => player);
useVast(() => player, { tagUrl: "..." });
```

**Components** — conditional activation via `{#if}`:

```svelte
{#if showAds}
  <VastPlugin tagUrl="..." />
{/if}
```

Use functions when the plugin is always needed. Use components when you need conditional rendering.

### Direct Player Access

`player` is returned from `createVidePlayer()`, so you can control it directly:

```svelte
<script>
  import { createVidePlayer, useHls, VideVideo } from "@videts/vide/svelte";

  const { player } = createVidePlayer();
  useHls(() => player);
</script>

<VideVideo src="video.mp4" />
<button onclick={() => player?.pause()}>Pause</button>
<button onclick={() => { if (player) player.currentTime = 0 }}>
  Restart
</button>
```

### Ad Plugins (OMID, SIMID)

`omid()` and `simid()` are ad-level plugins, not player-level. Pass them via the `adPlugins` option:

```ts
import { omid } from "@videts/vide/omid";
import { simid } from "@videts/vide/simid";

useVast(() => player, {
  tagUrl: "https://...",
  adPlugins: (ad) => [
    omid({ partner: { name: "myapp", version: "1.0" } }),
    simid({ container: containerEl }),
  ],
});
```

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
    VideVideo, PlayButton, Progress,
    Volume, MuteButton, FullscreenButton,
    TimeDisplay, VastPlugin,
  } from "@videts/vide/svelte";

  const { player } = createVidePlayer();
  useHls(() => player);

  let showAds = $state(true);

  useVideEvent(() => player, "statechange", ({ from, to }) => {
    console.log(`${from} → ${to}`);
  });
</script>

<div class="relative aspect-video">
  <VideVideo src="stream.m3u8" class="w-full">
    {#if showAds}
      <VastPlugin tagUrl="https://..." />
    {/if}
    <PlayButton class="absolute inset-0 flex items-center justify-center">
      ▶
    </PlayButton>
    <div class="absolute bottom-0 left-0 right-0 flex items-center gap-2 p-2">
      <Progress class="flex-1 h-1" />
      <TimeDisplay class="text-sm text-white" />
      <Volume class="w-20" />
      <MuteButton />
      <FullscreenButton />
    </div>
  </VideVideo>
</div>
```
