# vide

Zero-config, web-standard-first video player. Tiny. No magic.

## Install

```
npm install vide
```

## Usage

```ts
import { createPlayer } from "vide";

const player = createPlayer(document.querySelector("video")!);

// It's just HTMLVideoElement. You already know the API.
player.play();
player.pause();
player.currentTime = 30;
console.log(player.duration);

// Events
player.on("statechange", ({ from, to }) => console.log(from, "→", to));
player.on("play", () => {});
player.on("ended", () => {});

// Done? Clean up.
player.destroy();
```

## VAST Ads

```ts
import { createPlayer } from "vide";
import { vast } from "vide/vast";

const player = createPlayer(document.querySelector("video")!);

player.use(vast({
  tagUrl: "https://example.com/vast.xml",
}));
```

### With OMID (Open Measurement)

```ts
import { vast } from "vide/vast";
import { omid } from "vide/omid";

player.use(vast({
  tagUrl: "https://example.com/vast.xml",
  adPlugins: (ad) => [
    omid({
      partner: { name: "your-company", version: "1.0.0" },
      serviceScriptUrl: "https://your-cdn.example.com/omweb-v1.js",
    }),
  ],
}));
```

`adPlugins` is called per-ad with the parsed `VastAd`. Each ad plugin receives the player and the ad, and is cleaned up when the ad ends. OMID reads `ad.verifications` internally — VAST knows nothing about OMID.

## VMAP (Multi-Ad Breaks)

```ts
import { createPlayer } from "vide";
import { vmap } from "vide/vmap";
import { omid } from "vide/omid";

const player = createPlayer(document.querySelector("video")!);

player.use(vmap({
  url: "https://example.com/vmap.xml",
  adPlugins: (ad) => [
    omid({
      partner: { name: "your-company", version: "1.0.0" },
      serviceScriptUrl: "https://your-cdn.example.com/omweb-v1.js",
    }),
  ],
}));
```

## Custom Plugin

```ts
import type { Plugin } from "vide";

export function myPlugin(): Plugin {
  return {
    name: "my-plugin",
    setup(player) {
      player.on("play", () => { /* ... */ });
      return () => { /* cleanup on destroy */ };
    },
  };
}
```

## Custom Ad Plugin

```ts
import type { AdPlugin } from "vide/vast";

export function myAdPlugin(): AdPlugin {
  return {
    name: "my-ad-plugin",
    setup(player, ad) {
      // ad is the parsed VastAd — read ad.verifications, ad.creatives, etc.
      return () => { /* cleanup on ad end */ };
    },
  };
}
```

## Bundle Size

| Entry | Gzip |
|-------|------|
| Core | ~1 KB |
| VAST plugin | ~2 KB |
| VMAP plugin | ~2 KB |
| OMID plugin | ~2 KB |
| All | ~7 KB |

## License

MIT
