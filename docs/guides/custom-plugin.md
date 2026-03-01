# Custom Plugin

Vide plugins follow a simple interface: a `name` and a `setup` function.

## Plugin Interface

```ts
interface Plugin {
  name: string;
  setup(player: Player): (() => void) | void;
}
```

- `name` — unique plugin identifier
- `setup` — called when `player.use(plugin)` is invoked. Receives the player instance. Optionally returns a cleanup function called on `player.destroy()`.

## Basic Example

```ts
import type { Plugin } from "@videts/vide";

function analytics(): Plugin {
  return {
    name: "analytics",
    setup(player) {
      function onPlay() {
        sendEvent("video_play");
      }
      function onPause() {
        sendEvent("video_pause");
      }

      player.on("play", onPlay);
      player.on("pause", onPause);

      // Return cleanup function
      return () => {
        player.off("play", onPlay);
        player.off("pause", onPause);
      };
    },
  };
}

// Usage
player.use(analytics());
```

## Source Handler Plugin

Plugins can register custom source handlers to intercept `player.src` assignments:

```ts
function customSource(): Plugin {
  return {
    name: "custom-source",
    setup(player) {
      player.registerSourceHandler({
        canHandle(url) {
          return url.endsWith(".custom");
        },
        load(url, videoElement) {
          // Set up custom source loading
        },
        unload(videoElement) {
          // Clean up
        },
      });
    },
  };
}
```

## Cross-Plugin Data

Plugins can share data via `setPluginData` / `getPluginData`:

```ts
// Plugin A stores data
function pluginA(): Plugin {
  return {
    name: "plugin-a",
    setup(player) {
      player.setPluginData("plugin-a", { instance: someInstance });
    },
  };
}

// Plugin B reads it
function pluginB(): Plugin {
  return {
    name: "plugin-b",
    setup(player) {
      const data = player.getPluginData("plugin-a");
      if (data) {
        // Use shared data
      }
    },
  };
}
```

This is how HLS/DASH plugins expose their instances and how DRM configures them.

## Guidelines

1. **No side effects on import.** The factory function (`analytics()`) returns a plugin object — importing the module should execute nothing.
2. **Always clean up.** Return a cleanup function that removes all event listeners and DOM elements.
3. **Use the player API.** Don't access `player.el` directly unless you need HTMLVideoElement-specific APIs not proxied by the player.
4. **One-way dependencies.** If your plugin depends on another, read its data via `getPluginData`. Never import another plugin's internals.
