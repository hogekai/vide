# CDN / No Build Tool

## ESM (recommended)

Use an ESM CDN like [esm.sh](https://esm.sh) with an import map:

```html
<script type="importmap">
{
  "imports": {
    "@videts/vide": "https://esm.sh/@videts/vide@0.10",
    "@videts/vide/ui": "https://esm.sh/@videts/vide@0.10/ui",
    "@videts/vide/hls": "https://esm.sh/@videts/vide@0.10/hls"
  }
}
</script>

<link rel="stylesheet" href="https://esm.sh/@videts/vide@0.10/ui/theme.css">

<div id="player-container">
  <video src="video.mp4"></video>
</div>

<script type="module">
  import { createPlayer } from "@videts/vide";
  import { ui } from "@videts/vide/ui";

  const player = createPlayer(document.querySelector("video"));
  player.use(ui({ container: document.getElementById("player-container") }));
</script>
```

Or use bare URLs without an import map:

```html
<script type="module">
  import { createPlayer } from "https://esm.sh/@videts/vide@0.10";
</script>
```

Import maps are supported in all modern browsers. For older browsers, use [es-module-shims](https://github.com/guybedford/es-module-shims).

## Script tag

For tag managers and environments without ES module support, use the global IIFE builds:

```html
<script src="https://cdn.jsdelivr.net/npm/@videts/vide/dist/vide.global.js"></script>
<script>
  var player = Vide.createPlayer(document.querySelector("video"));
</script>
```

All exports are available on the `window.Vide` namespace. The API is identical to the ESM version — `import { hls }` becomes `Vide.hls`.

To load only the plugins you need, use individual builds:

```html
<script src="https://cdn.jsdelivr.net/npm/@videts/vide/dist/vide.core.global.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@videts/vide/dist/vide.hls.global.js"></script>
<script>
  var player = Vide.createPlayer(document.querySelector("video"));
  player.use(Vide.hls());
</script>
```

For HLS or DASH streaming, load the peer dependency before the Vide plugin:

```html
<script src="https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@videts/vide/dist/vide.core.global.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@videts/vide/dist/vide.hls.global.js"></script>
```

Available individual builds: `vide.core.global.js`, `vide.hls.global.js`, `vide.dash.global.js`, `vide.vast.global.js`, `vide.vmap.global.js`, `vide.drm.global.js`, `vide.ssai.global.js`, `vide.omid.global.js`, `vide.simid.global.js`, `vide.ui.global.js`.
