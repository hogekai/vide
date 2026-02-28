# Ads Setup

This guide covers the different ad integration options in vide.

## Client-Side Ads (VAST)

The simplest setup — fetch a VAST tag and play a pre-roll ad:

```ts
import { createPlayer } from "@videts/vide";
import { vast } from "@videts/vide/vast";

const player = createPlayer(document.querySelector("video")!);
player.use(vast({ tagUrl: "https://example.com/vast.xml" }));

player.on("ad:start", ({ adId }) => console.log("ad started", adId));
player.on("ad:end", ({ adId }) => console.log("ad ended", adId));
```

### Ad Pods and Waterfall

When a VAST response contains multiple `<Ad>` elements, they are automatically handled:

- **Ad Pod** — ads with `sequence` attributes are played sequentially. If one fails, a stand-alone ad is substituted.
- **Waterfall** — ads without `sequence` are tried in order until one succeeds.

Listen for pod events:

```ts
player.on("ad:pod:start", ({ ads, total }) => console.log(`pod: ${total} ads`));
player.on("ad:pod:end", ({ completed, skipped, failed }) => {
  console.log(`pod done: ${completed} completed, ${skipped} skipped, ${failed} failed`);
});
```

## Scheduled Ads (VMAP)

VMAP adds pre-roll, mid-roll, and post-roll scheduling:

```ts
import { vmap } from "@videts/vide/vmap";

player.use(vmap({ url: "https://example.com/vmap.xml" }));
```

VMAP handles VAST resolution internally — you don't need to import the VAST plugin separately.

## Server-Side Ads (SSAI)

For streams with server-stitched ads, SSAI reads in-band metadata:

```ts
import { hls } from "@videts/vide/hls";
import { ssai } from "@videts/vide/ssai";

player.use(hls());
player.use(ssai());
```

SSAI fires the same `ad:start` / `ad:end` events as VAST.

## Ad UI Components

The UI plugin provides ad-specific components (countdown, skip button, click overlay, label):

```ts
import { ui } from "@videts/vide/ui";
import { vast } from "@videts/vide/vast";

const uiPlugin = ui({ container: el });
player.use(uiPlugin);
player.use(vast({
  tagUrl: "https://example.com/vast.xml",
  adPlugins: uiPlugin.getAdPlugin(),
}));
```

## Viewability (OMID)

Add OM SDK viewability measurement:

```ts
import { omid } from "@videts/vide/omid";

player.use(vast({
  tagUrl: "https://example.com/vast.xml",
  adPlugins: () => [
    omid({ partner: { name: "your-company", version: "1.0.0" } }),
  ],
}));
```

## Interactive Ads (SIMID)

Add interactive creative overlays:

```ts
import { simid } from "@videts/vide/simid";

player.use(vast({
  tagUrl: "https://example.com/vast.xml",
  adPlugins: () => [
    simid({ container: document.getElementById("ad-container")! }),
  ],
}));
```

## Combining Everything

```ts
import { createPlayer } from "@videts/vide";
import { hls } from "@videts/vide/hls";
import { ui } from "@videts/vide/ui";
import { vast } from "@videts/vide/vast";
import { omid } from "@videts/vide/omid";
import { simid } from "@videts/vide/simid";
import "@videts/vide/ui/theme.css";

const player = createPlayer(document.querySelector("video")!);
player.use(hls());

const uiPlugin = ui({ container: el });
player.use(uiPlugin);

player.use(vast({
  tagUrl: "https://example.com/vast.xml",
  adPlugins: (ad) => [
    ...uiPlugin.getAdPlugin()(ad),
    omid({ partner: { name: "my-company", version: "1.0.0" } }),
    simid({ container: adContainer }),
  ],
}));
```
