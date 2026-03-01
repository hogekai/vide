# IMA

Google IMA SDK (Interactive Media Ads) plugin. Delegates ad fetching, playback, and tracking entirely to the IMA SDK. Use this when the ad server or supply-side platform requires IMA SDK integration.

::: tip VAST plugin vs IMA plugin
The [VAST plugin](/plugins/vast) parses and plays VAST XML directly using vide's own ad player. It is lighter (no external SDK), gives you full control over ad rendering and behavior, and integrates seamlessly with vide's UI components (skip button, countdown, learn more, etc.). Choose the VAST plugin when you can — it is simpler to customize, easier to debug, and has zero external dependencies.

The IMA plugin delegates everything to Google's IMA SDK. Use it only when your ad server or SSP **requires** IMA SDK integration (e.g., Google Ad Manager, AdSense for Video). IMA controls its own ad UI, ad rendering, and tracking — vide acts as a thin bridge.
:::

## Usage

```ts
import { createPlayer } from "@videts/vide";
import { ima } from "@videts/vide/ima";

const video = document.querySelector("video")!;
const container = video.parentElement!; // position: relative wrapper

const player = createPlayer(video);
player.use(ima({
  adTagUrl: "https://example.com/vast.xml",
  adContainer: container,
}));
```

IMA SDK is loaded automatically via script injection — no `<script>` tag needed.

### VMAP / Ad Rules

If the ad tag URL points to a VMAP or Ad Rules response, IMA handles pre-roll, mid-roll, and post-roll scheduling internally:

```ts
player.use(ima({
  adTagUrl: "https://example.com/vmap.xml",
  adContainer: container,
}));
```

### On-Demand Ad Insertion

Set `autoplayAdBreaks: false` and call `requestAds()` via pluginData:

```ts
player.use(ima({
  adTagUrl: "https://example.com/vast.xml",
  adContainer: container,
  autoplayAdBreaks: false,
}));

// Later, when you want to play an ad:
const imaData = player.getPluginData("ima") as {
  requestAds: (adTagUrl?: string) => void;
};
imaData.requestAds(); // uses the configured adTagUrl
imaData.requestAds("https://example.com/other-tag.xml"); // or a different tag
```

## Ad Container Setup {#ad-container-setup}

IMA SDK renders ad UI (skip button, countdown, click overlay) inside the `adContainer` element. Pass the video's parent container — IMA creates its own overlay elements inside it:

```html
<div id="player-container" style="position: relative;">
  <video src="video.mp4"></video>
</div>
```

```ts
player.use(ima({
  adTagUrl: "...",
  adContainer: document.getElementById("player-container")!,
}));
```

The wrapper must have `position: relative` (or `absolute`/`fixed`) so IMA's absolutely-positioned overlay elements are contained correctly.

### Layout Structure

IMA SDK, the video element, and vide UI all share the same container. The container sets the size, and everything else fills it:

```html
<div id="player-container" style="position: relative; aspect-ratio: 16/9;">
  <video style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></video>
  <!-- .vide-ui appended by ui() plugin — fills container via width/height: 100% -->
  <!-- IMA overlay appended by ima() plugin — position: absolute -->
</div>
```

The video is positioned absolutely within the container. The `.vide-ui` element (created by the UI plugin) fills the container with `width: 100%; height: 100%` and provides the stacking context for controls. IMA's overlay is also absolutely positioned inside the container.

::: warning UI does not wrap the video
Unlike the VAST example where `<Vide.UI>` wraps the `<video>`, IMA requires the video and UI to be **siblings** inside a shared container. The container must have explicit dimensions (e.g., `aspect-ratio: 16/9`) since the video is absolutely positioned and does not contribute to layout flow.
:::

::: tip Mobile
Add `playsinline` to the `<video>` element for skippable ads on iOS.
:::

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `adTagUrl` | `string` | — | VAST/VMAP ad tag URL (required) |
| `adContainer` | `HTMLElement` | — | Container for IMA's ad UI overlay (required). Typically the video's parent element. See [Ad Container Setup](#ad-container-setup). |
| `timeout` | `number` | `6000` | IMA SDK script load timeout in ms |
| `sdkUrl` | `string` | Google CDN | IMA SDK script URL |
| `autoplayAdBreaks` | `boolean` | `true` | Auto-play ads when content starts. Set to `false` for on-demand insertion. |
| `locale` | `string` | — | Locale for IMA SDK UI (e.g. `"ja"`) |
| `configureAdsRequest` | `(req) => void` | — | Customize the IMA AdsRequest before sending |
| `configureRenderingSettings` | `(settings) => void` | — | Customize IMA AdsRenderingSettings |

### Advanced Configuration

```ts
player.use(ima({
  adTagUrl: "https://example.com/vast.xml",
  adContainer: container,
  locale: "ja",
  configureAdsRequest(req) {
    req.setAdWillAutoPlay?.(true);
    req.setAdWillPlayMuted?.(false);
    req.setContinuousPlayback?.(true);
  },
  configureRenderingSettings(settings) {
    (settings as any).enablePreloading = true;
  },
}));
```

## Events

IMA SDK events are mapped to standard vide ad events:

| IMA Event | vide Event | State Change |
|-----------|-----------|--------------|
| `CONTENT_PAUSE_REQUESTED` | `ad:breakStart` | → `ad:loading` |
| `LOADED` | `ad:loaded` | — |
| `STARTED` | `ad:start`, `ad:impression` | → `ad:playing` |
| `FIRST_QUARTILE` | `ad:quartile` (firstQuartile) | — |
| `MIDPOINT` | `ad:quartile` (midpoint) | — |
| `THIRD_QUARTILE` | `ad:quartile` (thirdQuartile) | — |
| `COMPLETE` | `ad:quartile` (complete), `ad:end` | — |
| `PAUSED` | — | → `ad:paused` |
| `RESUMED` | — | → `ad:playing` |
| `SKIPPED` | `ad:skip`, `ad:end` | — |
| `CLICK` | `ad:click` | — |
| `VOLUME_CHANGED` / `VOLUME_MUTED` | `ad:volumeChange`, `ad:mute` / `ad:unmute` | — |
| `CONTENT_RESUME_REQUESTED` | `ad:breakEnd` | → `playing` |

### Pod Events

When IMA plays an ad pod (multiple ads in a break), pod events are emitted:

| Event | When |
|-------|------|
| `ad:pod:start` | First ad in pod starts |
| `ad:pod:adstart` | Each individual ad starts |
| `ad:pod:adend` | Each individual ad ends |
| `ad:pod:end` | Last ad in pod ends |

### Skip from UI

The vide UI's skip button (`ad:skip` event) is forwarded to `adsManager.skip()`. No extra wiring needed.

## Ad Blocker Handling

If the IMA SDK fails to load (ad blocker or network error), the plugin emits `ad:error` with `source: "ima"` and content playback continues uninterrupted:

```ts
player.on("ad:error", ({ error, source }) => {
  if (source === "ima") {
    console.log("IMA unavailable:", error.message);
  }
});
```

## Plugin Data

After initialization, the plugin exposes data via `player.getPluginData("ima")`:

| Property | Type | Description |
|----------|------|-------------|
| `adsManager` | `ImaAdsManager` | The IMA AdsManager instance |
| `adsLoader` | `ImaAdsLoader` | The IMA AdsLoader instance |
| `adDisplayContainer` | `ImaAdDisplayContainer` | The IMA AdDisplayContainer |
| `requestAds` | `(adTagUrl?: string) => void` | Request new ads on demand |

## Using with UI Plugin

When the IMA plugin and [UI plugin](/plugins/ui) are used together, vide's ad UI components (label, countdown, skip, learn more) are automatically hidden during IMA ads. IMA SDK provides its own ad UI, so vide suppresses duplicates via the `managedUI` flag on the `ad:start` event. No configuration needed:

```ts
player.use(ui({ container }));
player.use(ima({ adTagUrl: "...", adContainer: container }));
```

During IMA ads, the `vide-ui--managed-ad` class is added to the UI root, hiding `div.vide-ad`. When the ad break ends, the class is removed. VAST ads played through the VAST plugin are unaffected — vide's ad UI shows normally for those.

## Framework Components

Each framework provides two component variants and a hook/composable:

| | Wrapping | Ref-based (invisible) | Hook / Composable |
|---|---|---|---|
| **React** | `<Vide.Ima>` | `<Vide.ImaPlugin>` | `useIma()` |
| **Vue** | `<VideIma>` | `<VideImaPlugin>` | `useIma()` |
| **Svelte** | `<Ima>` | `<ImaPlugin>` | `useIma()` |

**Wrapping** renders a `<div>` (with `position: relative`) that acts as both the ad container and the children wrapper. Simplest usage — no ref needed:

::: code-group

```tsx [React]
<Vide.Root player={player}>
  <Vide.Ima adTagUrl="..." autoplayAdBreaks style={{ aspectRatio: "16/9", background: "#000" }}>
    <Vide.Video src="content.mp4" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    <Vide.UI ref={uiRef}>
      <Vide.Controls>...</Vide.Controls>
    </Vide.UI>
  </Vide.Ima>
</Vide.Root>
```

```vue [Vue]
<VideRoot :player="player">
  <VideIma ad-tag-url="..." autoplay-ad-breaks :style="{ aspectRatio: '16/9', background: '#000' }">
    <VideVideo src="content.mp4" :style="{ position: 'absolute', inset: 0, width: '100%', height: '100%' }" />
    <VideUI ref="uiRef">
      <VideControls>...</VideControls>
    </VideUI>
  </VideIma>
</VideRoot>
```

```svelte [Svelte]
<Ima adTagUrl="..." autoplayAdBreaks style="aspect-ratio:16/9; background:#000">
  <VideVideo src="content.mp4" style="position:absolute; inset:0; width:100%; height:100%" />
  <VideUI bind:this={uiEl}>
    <VideControls>...</VideControls>
  </VideUI>
</Ima>
```

:::

**Ref-based (invisible)** renders nothing. You provide your own container ref. Supports conditional rendering — toggling the component on/off does not unmount the video or UI:

::: code-group

```tsx [React]
<Vide.Root player={player}>
  <div ref={containerRef} style={{ position: "relative", aspectRatio: "16/9", background: "#000" }}>
    <Vide.Video src="content.mp4" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    {enableAds && <Vide.ImaPlugin adTagUrl="..." adContainer={containerRef} autoplayAdBreaks />}
    <Vide.UI ref={uiRef}>
      <Vide.Controls>...</Vide.Controls>
    </Vide.UI>
  </div>
</Vide.Root>
```

```vue [Vue]
<VideRoot :player="player">
  <div ref="containerRef" :style="{ position: 'relative', aspectRatio: '16/9', background: '#000' }">
    <VideVideo src="content.mp4" :style="{ position: 'absolute', inset: 0, width: '100%', height: '100%' }" />
    <VideImaPlugin v-if="enableAds" ad-tag-url="..." :ad-container="containerRef" autoplay-ad-breaks />
    <VideUI ref="uiRef">
      <VideControls>...</VideControls>
    </VideUI>
  </div>
</VideRoot>
```

```svelte [Svelte]
<div bind:this={containerEl} style="position:relative; aspect-ratio:16/9; background:#000">
  <VideVideo src="content.mp4" style="position:absolute; inset:0; width:100%; height:100%" />
  {#if enableAds}
    <ImaPlugin adTagUrl="..." adContainer={containerEl} autoplayAdBreaks />
  {/if}
  <VideUI bind:this={uiEl}>
    <VideControls>...</VideControls>
  </VideUI>
</div>
```

:::

::: warning Wrapping variant and conditional rendering
Toggling the wrapping variant (`<Vide.Ima>` / `<VideIma>` / `<Ima>`) unmounts **all children** including the video element and UI. Use the ref-based variant (`ImaPlugin`) if you need to conditionally enable/disable ads without disrupting playback.
:::

::: warning Plugin removal does not pause content
Unmounting `ImaPlugin` destroys the IMA ads manager and cleans up the ad overlay, but does **not** pause the content video. If you need to stop playback when disabling ads, call `player.pause()` explicitly.
:::

## Notes

- IMA SDK is loaded via script injection from `https://imasdk.googleapis.com/js/sdkloader/ima3.js` by default. Override with `sdkUrl`.
- IMA SDK **controls video playback during ads**. The plugin does not swap `player.el.src` — this is the key difference from the VAST plugin.
- Tracking (impressions, quartiles, clicks) is handled internally by IMA SDK. The `ad:impression`, `ad:quartile` etc. events are informational — the actual beacon firing is done by IMA.
- The plugin handles fullscreen changes and player resize via `ResizeObserver`, forwarding size updates to `adsManager.resize()`.
- Post-roll support: the plugin calls `adsLoader.contentComplete()` when the content ends.
- On iOS, the plugin calls `setDisableCustomPlaybackForIOS10Plus(true)` to enable skippable ad support. This is automatic.
