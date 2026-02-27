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

## VMAP (Multi-Ad Breaks)

```ts
import { createPlayer } from "vide";
import { vmap } from "vide/vmap";

const player = createPlayer(document.querySelector("video")!);

player.use(vmap({
  url: "https://example.com/vmap.xml",
}));
```

## OMID (Open Measurement)

```ts
import { createPlayer } from "vide";
import { vast } from "vide/vast";
import { omid } from "vide/omid";

const player = createPlayer(document.querySelector("video")!);

player.use(vast({ tagUrl: "https://example.com/vast.xml" }));

player.use(omid({
  verifications: vast.verifications, // from VAST AdVerifications
  partner: { name: "your-company", version: "1.0.0" },
  serviceScriptUrl: "https://cdn.example.com/omweb-v1.js",
}));
```

OM SDK scripts are loaded dynamically — zero runtime dependencies. If the SDK fails to load, ad playback continues unaffected.

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
