# VMAP

Standardized ad break scheduling via VMAP XML. Fetches a VMAP document and automatically plays VAST ads at server-defined time offsets (pre-roll, mid-roll, post-roll). For application-controlled ad timing, you can also [schedule ads manually](/guides/ads-setup#on-demand-ad-insertion) using the VAST plugin directly.

## Usage

```ts
import { createPlayer } from "@videts/vide";
import { vmap } from "@videts/vide/vmap";

const player = createPlayer(document.querySelector("video")!);
player.use(vmap({ url: "https://example.com/vmap.xml" }));
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | — | VMAP document URL (required) |
| `timeout` | `number` | `5000` | Request timeout in ms |
| `vastOptions` | `{ timeout?, maxDepth? }` | — | Options passed to the underlying VAST resolver |
| `adPlugins` | `(ad: VastAd) => AdPlugin[]` | — | Per-ad plugin factory (same as VAST) |

## Ad Pods and Waterfall within VMAP

Each VMAP ad break resolves to a VAST response. When that response contains multiple ads, the VMAP plugin automatically classifies and plays them as a Pod or Waterfall (see [VAST plugin docs](./vast.md#ad-pods-and-waterfall) for details).

### `allowMultipleAds`

The VMAP `<AdSource>` element supports an `allowMultipleAds` attribute. When set to `false`, only the first ad from the VAST response is played, regardless of how many ads the response contains. This is enforced automatically.

### Event Layering

When a VMAP ad break contains an Ad Pod:

```
ad:breakStart → ad:pod:start → [per-ad events] → ad:pod:end → ad:breakEnd
```

## Events

VMAP fires the same ad events as VAST (`ad:start`, `ad:end`, `ad:impression`, etc.) plus:

### Break Events

| Event | Payload | Description |
|-------|---------|-------------|
| `ad:breakStart` | `{ breakId }` | Ad break started |
| `ad:breakEnd` | `{ breakId }` | Ad break ended |

### Pod Events (within breaks)

| Event | Payload | Description |
|-------|---------|-------------|
| `ad:pod:start` | `{ ads, total }` | Pod playback started within a break |
| `ad:pod:end` | `{ completed, skipped, failed }` | Pod playback ended with stats |
| `ad:pod:adstart` | `{ ad, index, total }` | Individual ad within pod started |
| `ad:pod:adend` | `{ ad, index, total }` | Individual ad within pod ended |

## Ad Break Time Offsets

VMAP supports four time offset types:

| Type | Example | Description |
|------|---------|-------------|
| `start` | `start` | Pre-roll — before content |
| `end` | `end` | Post-roll — after content |
| `time` | `00:05:00.000` | Mid-roll at specific time |
| `percentage` | `50%` | Mid-roll at percentage of duration |

## Notes

- VMAP depends on VAST internally. The dependency direction is `vmap → vast → core`.
- Supports inline VAST (`<AdData>`) and remote VAST (`<AdTagURI>`).
- Ad Pods, Waterfall, and `allowMultipleAds` are supported per the VMAP 1.0.1 spec.
