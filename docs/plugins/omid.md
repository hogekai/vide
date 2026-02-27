# OMID

Open Measurement SDK integration for ad viewability measurement. Implements the IAB OM SDK standard.

## Usage

OMID is used as an AdPlugin within VAST:

```ts
import { createPlayer } from "@videts/vide";
import { vast } from "@videts/vide/vast";
import { omid } from "@videts/vide/omid";

const player = createPlayer(document.querySelector("video")!);
player.use(vast({
  tagUrl: "https://example.com/vast.xml",
  adPlugins: () => [
    omid({ partner: { name: "your-company", version: "1.0.0" } }),
  ],
}));
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `partner` | `{ name: string; version: string }` | — | Partner identification (required) |
| `serviceScriptUrl` | `string` | Google-hosted | URL to the OM SDK service script |
| `sessionClientUrl` | `string` | — | URL to the session client script |
| `timeout` | `number` | `5000` | Script loading timeout in ms |

## Events

No custom events. OMID communicates viewability data to verification vendors through the OM SDK.

## Notes

- OMID automatically reads `AdVerification` elements from the VAST response.
- The plugin creates an OM SDK session per ad and fires standard ad events (impression, quartiles, pause/resume, etc.).
- In production, host the OM SDK scripts on your own CDN.
- Size: **1.7 KB** gzip.
