# Ads Setup

This guide covers the different ad integration options in Vide.

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

### Companion Ads

Companion ads (banners, sidebars) are emitted as data — display is your responsibility:

```ts
import { trackCompanionView } from "@videts/vide/vast";

player.on("ad:companions", ({ companions }) => {
  const banner = companions.find(c => c.width === 300 && c.height === 250);
  if (!banner) return;
  const resource = banner.resources.find(r => r.type === "static");
  if (!resource) return;

  document.getElementById("sidebar-ad")!.innerHTML =
    `<a href="${banner.clickThrough}"><img src="${resource.url}"></a>`;
  trackCompanionView(banner);
});
```

### NonLinear Ads (Overlays)

NonLinear ads are overlays displayed inside the player without interrupting video playback. Like companions, the plugin emits data and the integrator handles rendering:

```ts
import { trackNonLinear } from "@videts/vide/vast";

player.on("ad:nonlinears", ({ nonLinears, trackingEvents }) => {
  const nl = nonLinears[0];
  const resource = nl.resources.find(r => r.type === "static");
  if (!resource) return;

  const overlay = document.createElement("img");
  overlay.src = resource.url;
  overlay.width = nl.width;
  playerContainer.appendChild(overlay);
  trackNonLinear({ nonLinears, trackingEvents }, "creativeView");

  // Show close button after minSuggestedDuration
  if (nl.minSuggestedDuration) {
    setTimeout(() => showCloseButton(), nl.minSuggestedDuration * 1000);
  }
});
```

See the [VAST plugin docs](/plugins/vast#nonlinear-ads) for the full attribute list and tracking events.

## On-Demand Ad Insertion

The VAST plugin loads and plays ads based on **when** you call `player.use(vast(...))`. This gives you full control over ad timing without needing VMAP:

### Pre-roll

```ts
const player = createPlayer(document.querySelector("video")!);
player.use(vast({ tagUrl: "https://example.com/vast.xml" }));
```

The plugin waits for the player to reach "ready" state, then plays the ad before content.

### Mid-roll

```ts
player.on("timeupdate", function onMidroll({ currentTime }) {
  if (currentTime >= 300) { // 5 minutes
    player.off("timeupdate", onMidroll);
    player.use(vast({ tagUrl: "https://example.com/midroll.xml" }));
  }
});
```

Since the player is already in "playing" state, the ad loads immediately.

### Post-roll

```ts
player.on("ended", () => {
  player.use(vast({ tagUrl: "https://example.com/postroll.xml" }));
});
```

After the ad finishes, the player returns to "ended" state (content is not restored).

### When does the ad trigger?

| Player state when `use(vast(...))` is called | Behavior |
|-----------------------------------------------|----------|
| `ready`, `playing`, `paused`, `ended` | Ad loads immediately |
| `idle`, `loading`, `buffering` | Waits for `ready` state, then loads |

> For standardized scheduling via XML (pre-roll, mid-roll, post-roll positions defined server-side), use [VMAP](#scheduled-ads-vmap) instead.

## Scheduled Ads (VMAP)

When ad break positions are defined server-side in a VMAP document, the VMAP plugin handles scheduling automatically:

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

### Learn More Button

The `ad-learn-more` component displays a CTA button during ad playback when the VAST response includes a `clickThrough` URL. It shows the ad title and domain, and opens the URL in a new tab on click. This component is **on by default** — use `exclude: ["ad-learn-more"]` to disable it.

### Include Option

The `ad-overlay` full-area click-through overlay is off by default. Enable it with the `include` option:

```ts
const uiPlugin = ui({ container: el, include: ["ad-overlay"] });
```

### Framework Ad Components

React, Vue, and Svelte integrations provide dedicated ad components that auto-subscribe to ad events:

**React**

```tsx
<Vide.AdOverlay />
<Vide.AdLabel />
<Vide.AdCountdown />
<Vide.AdSkip />
<Vide.AdLearnMore />
```

**Vue**

```vue
<VideAdOverlay />
<VideAdLabel />
<VideAdCountdown />
<VideAdSkip />
<VideAdLearnMore />
```

**Svelte**

```svelte
<AdOverlay />
<AdLabel />
<AdCountdown />
<AdSkip />
<AdLearnMore />
```

Each component renders only during active ad playback. See the [React](/frameworks/react#ad-components), [Vue](/frameworks/vue#ad-components), or [Svelte](/frameworks/svelte#ad-components) docs for full API reference.

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

## Interactive Ads (VPAID)

Add VPAID 2.0 interactive ad creatives:

```ts
import { vpaid } from "@videts/vide/vpaid";

player.use(vast({
  tagUrl: "https://example.com/vast.xml",
  adPlugins: () => [
    vpaid({ container: document.getElementById("ad-container")! }),
  ],
}));
```

## Interactive Ads (SIMID)

Add SIMID interactive creative overlays:

```ts
import { simid } from "@videts/vide/simid";

player.use(vast({
  tagUrl: "https://example.com/vast.xml",
  adPlugins: () => [
    simid({ container: document.getElementById("ad-container")! }),
  ],
}));
```

## Ad Container Setup {#ad-container-setup}

Both VPAID and SIMID render interactive content inside a `container` element. When using the UI plugin alongside these ad plugins, the container needs specific CSS to ensure the creative's interactive elements are clickable above the UI's overlay layers:

```html
<div id="player-container">
  <video id="player" src="video.mp4"></video>
  <div id="ad-container"></div>
</div>
```

```css
#player-container { position: relative; }
#ad-container {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  z-index: 3;            /* above UI's click overlay (z-index: 2) */
  pointer-events: none;  /* let non-ad clicks pass through */
}
#ad-container > * {
  pointer-events: auto;  /* ad content itself is interactive */
}
```

In framework components, use a ref for the container element — see [React](/frameworks/react#ad-container), [Vue](/frameworks/vue#ad-container), or [Svelte](/frameworks/svelte#ad-container).

## Combining Everything

```ts
import { createPlayer } from "@videts/vide";
import { hls } from "@videts/vide/hls";
import { ui } from "@videts/vide/ui";
import { vast } from "@videts/vide/vast";
import { omid } from "@videts/vide/omid";
import { simid } from "@videts/vide/simid";
import { vpaid } from "@videts/vide/vpaid";
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
    vpaid({ container: adContainer }),
    simid({ container: adContainer }),
  ],
}));
```
