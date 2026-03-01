# Vue

Vue 3 composables and components for Vide. Import from `@videts/vide/vue`.

```sh
npm install @videts/vide vue
```

## Quick Start

```vue
<script setup>
import { useVidePlayer, useHls, VideVideo } from "@videts/vide/vue";

const player = useVidePlayer();
useHls(player);
</script>

<template>
  <VideVideo src="stream.m3u8" />
</template>
```

## Composables

### useVidePlayer()

Creates and manages a player instance. Provides it to child components via `provide/inject`.

```ts
const player = useVidePlayer();
```

- `player` — `ShallowRef<Player | null>`. `null` until `<VideVideo>` mounts.
- Calls `player.destroy()` automatically when scope is disposed.
- Must be called in a parent component's `setup()` before `<VideVideo>` is used.

### useHls / useDash / useDrm / useVast / useVmap / useSsai / useUi

Plugin composables. Call `plugin.setup()` when player becomes available, clean up on scope disposal.

```ts
useHls(player);
useHls(player, { hlsConfig: { maxBufferLength: 30 } });

useDash(player);
useDrm(player, { widevine: { licenseUrl: "..." } });
useVast(player, { tagUrl: "https://..." });
useVmap(player, { url: "https://..." });
useSsai(player);
useUi(player, { container: containerRef.value! });
```

All composables are safe to call with `player.value === null` (before mount).

### useVideEvent(player, event, handler)

Subscribe to player events with automatic cleanup.

```ts
useVideEvent(player, "statechange", ({ from, to }) => {
  console.log(`${from} → ${to}`);
});

useVideEvent(player, "ad:start", ({ adId }) => {
  console.log("Ad started:", adId);
});
```

- Unsubscribes when scope is disposed or player changes.

## Components

### VideVideo

Renders a `<video>` element inside a wrapper `<div>` and connects to the player via `inject`.

```vue
<VideVideo src="video.mp4" class="rounded-lg">
  <VidePlayButton />
  <VideProgress />
</VideVideo>
```

- `class` is applied to the wrapper `<div>`.
- All other attributes (`src`, `poster`, `muted`, `autoplay`, etc.) are passed to the `<video>` element.
- Default slot renders alongside the video element.

### Plugin Components

Render nothing. Use for conditional plugin activation with `v-if`.

```vue
<VideVideo src="stream.m3u8">
  <VideHlsPlugin />
  <VideVastPlugin v-if="showAds" tag-url="https://..." />
  <VideSsaiPlugin v-if="premium" />
</VideVideo>
```

Available: `VideHlsPlugin`, `VideDashPlugin`, `VideDrmPlugin`, `VideVastPlugin`, `VideVmapPlugin`, `VideSsaiPlugin`.

### UI Components

Interactive controls that subscribe to player events via context.

```vue
<VideVideo src="video.mp4">
  <VidePlayButton class="rounded-full bg-white/80" />
  <VideProgress class="h-1" />
  <VideVolume class="w-24" />
  <VideTimeDisplay />
  <VideFullscreenButton />
  <VideMuteButton />
</VideVideo>
```

| Component | Props | State Attributes |
|-----------|-------|-----------------|
| `VidePlayButton` | `class`, slot | `data-playing` |
| `VideMuteButton` | `class`, slot | `data-muted` |
| `VideProgress` | `class` | `data-disabled`, `--vide-progress`, `--vide-progress-buffered` |
| `VideVolume` | `class`, slot | `data-muted`, `--vide-volume` |
| `VideFullscreenButton` | `class`, `target`, slot | `data-fullscreen` |
| `VideTimeDisplay` | `class`, `separator` | — |

- Default slot — custom icons or content (button components).
- CSS custom properties — use for styling sliders (same as Vide UI plugin theme).
- `data-*` attributes — use for state-based CSS selectors.

### Ad Components

Components for ad overlay, controls, and CTA during ad playback. Use with `useVast()` or `useVmap()`.

```vue
<VideAdOverlay />
<VideAdLabel />
<VideAdCountdown />
<VideAdSkip />
```

| Component | Props |
|-----------|-------|
| `VideAdOverlay` | `class`, slot |
| `VideAdSkip` | `class`, slot |
| `VideAdCountdown` | `class`, `format` |
| `VideAdLabel` | `class`, slot |
| `VideAdLearnMore` | `class`, `show-title`, slot |

### useAdState(player)

Low-level composable for custom ad UI. Returns `{ active: Ref<boolean>, meta: ShallowRef<AdMeta | null> }`.

```ts
const player = useVideContext();
const { active, meta } = useAdState(player);
```

## Patterns

### Composable vs Component for Plugins

**Composables** — always active, configure in `setup()`:

```ts
useHls(player);
useVast(player, { tagUrl: "..." });
```

**Components** — conditional activation via `v-if`:

```vue
<VideVastPlugin v-if="showAds" tag-url="..." />
```

Use composables when the plugin is always needed. Use components when you need conditional rendering.

### Direct Player Access

`player` is returned from `useVidePlayer()`, so you can control it directly:

```vue
<script setup>
import { useVidePlayer, useHls, VideVideo } from "@videts/vide/vue";

const player = useVidePlayer();
useHls(player);
</script>

<template>
  <VideVideo src="video.mp4" />
  <button @click="player.value?.pause()">Pause</button>
  <button @click="() => { if (player.value) player.value.currentTime = 0 }">
    Restart
  </button>
</template>
```

### Custom Components

Build your own player components using `useVideContext()` and `useVideEvent()`. All built-in components follow this same pattern.

#### Basics

`useVideContext()` returns `ShallowRef<Player | null>` from context. Must be inside a component tree where `useVidePlayer()` was called.

```vue
<script setup>
import { ref } from "vue";
import { useVideContext, useVideEvent } from "@videts/vide/vue";

const player = useVideContext();
const time = ref(0);

useVideEvent(player, "timeupdate", ({ currentTime }) => {
  time.value = currentTime;
});
</script>

<template>
  <span>{{ Math.floor(time) }}s</span>
</template>
```

Use it inside `<VideVideo>` (or anywhere within the provider tree):

```vue
<VideVideo src="video.mp4">
  <VidePlayButton />
  <CurrentTime />
</VideVideo>
```

#### Subscribing to State Changes

```vue
<script setup>
import { ref } from "vue";
import { useVideContext, useVideEvent } from "@videts/vide/vue";

const player = useVideContext();
const state = ref("idle");

useVideEvent(player, "statechange", ({ to }) => {
  state.value = to;
});
</script>

<template>
  <div class="my-state-badge">{{ state }}</div>
</template>
```

#### Calling Player Methods

Access `player.value` directly for actions. Guard with `if (!player.value)` since it's `null` before mount.

```vue
<script setup>
import { useVideContext } from "@videts/vide/vue";

const props = withDefaults(defineProps<{ seconds?: number }>(), {
  seconds: 10,
});

const player = useVideContext();

function onClick() {
  const p = player.value;
  if (!p) return;
  p.currentTime = Math.min(
    p.currentTime + props.seconds,
    p.el.duration,
  );
}
</script>

<template>
  <button @click="onClick">+{{ seconds }}s</button>
</template>
```

#### Ad-Aware Components

Use `useAdState()` for components that react to ad playback.

```vue
<script setup>
import { useVideContext, useAdState } from "@videts/vide/vue";

const player = useVideContext();
const { active } = useAdState(player);
</script>

<template>
  <div v-if="!active" class="my-overlay">...</div>
</template>
```

#### Available Composables

| Composable | Purpose |
|------------|---------|
| `useVideContext()` | Get `ShallowRef<Player \| null>` from context |
| `useVideEvent(player, event, handler)` | Subscribe to player events with auto-cleanup |
| `useAdState(player)` | Get `{ active: Ref<boolean>, meta: ShallowRef<AdMeta \| null> }` for ad state |
| `useAutohide(containerRef, player)` | Auto-hide controls on inactivity |
| `useKeyboard(containerRef, player)` | Keyboard shortcuts (space, arrows, etc.) |

### Ad Plugins (OMID, SIMID)

`omid()` and `simid()` are ad-level plugins, not player-level. Pass them via the `adPlugins` option:

```ts
import { omid } from "@videts/vide/omid";
import { simid } from "@videts/vide/simid";

useVast(player, {
  tagUrl: "https://...",
  adPlugins: (ad) => [
    omid({ partner: { name: "myapp", version: "1.0" } }),
    simid({ container: containerRef.value! }),
  ],
});
```

## Import Styles

```ts
// Namespace style
import { Vide, useVidePlayer, useHls } from "@videts/vide/vue";
// <Vide.Video src="..." />

// Individual imports
import { VideVideo, VidePlayButton, useVidePlayer, useHls } from "@videts/vide/vue";
```

## Full Example

```vue
<script setup lang="ts">
import {
  useVidePlayer, useHls, useVideEvent,
  VideVideo, VidePlayButton, VideProgress,
  VideVolume, VideMuteButton, VideFullscreenButton,
  VideTimeDisplay, VideVastPlugin,
  VideAdOverlay, VideAdLabel, VideAdCountdown, VideAdSkip,
} from "@videts/vide/vue";
import { ref } from "vue";

const player = useVidePlayer();
useHls(player);

const showAds = ref(true);

useVideEvent(player, "statechange", ({ from, to }) => {
  console.log(`${from} → ${to}`);
});
</script>

<template>
  <div class="relative aspect-video">
    <VideVideo src="stream.m3u8" class="w-full">
      <VideVastPlugin v-if="showAds" tag-url="https://..." />
      <VideAdOverlay />
      <VideAdLabel />
      <VideAdCountdown />
      <VideAdSkip />
      <VidePlayButton class="absolute inset-0 flex items-center justify-center">
        ▶
      </VidePlayButton>
      <div class="absolute bottom-0 left-0 right-0 flex items-center gap-2 p-2">
        <VideProgress class="flex-1 h-1" />
        <VideTimeDisplay class="text-sm text-white" />
        <VideVolume class="w-20" />
        <VideMuteButton />
        <VideFullscreenButton />
      </div>
    </VideVideo>
  </div>
</template>
```
