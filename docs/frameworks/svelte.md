# Svelte

Svelte 5 functions and components for Vide. Import from `@videts/vide/svelte`.

```sh
npm install @videts/vide svelte
```

Requires Svelte 5 (runes).

## Quick Start

```svelte
<script>
  import { createVidePlayer, useHls, VideVideo } from "@videts/vide/svelte";

  const player = createVidePlayer();
  useHls(player);
</script>

<VideVideo src="stream.m3u8" />
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
  import { createVidePlayer, useHls, VideVideo } from "@videts/vide/svelte";

  const player = createVidePlayer();
  useHls(player);
</script>

<VideVideo src="video.mp4" />
<button onclick={() => player()?.pause()}>Pause</button>
<button onclick={() => { if (player()) player()!.currentTime = 0 }}>
  Restart
</button>
```

### Ad Plugins (OMID, SIMID)

`omid()` and `simid()` are ad-level plugins, not player-level. Pass them via the `adPlugins` option:

```ts
import { omid } from "@videts/vide/omid";
import { simid } from "@videts/vide/simid";

useVast(player, {
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
  <VideVideo src="stream.m3u8" class="w-full">
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
