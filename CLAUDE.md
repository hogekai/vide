# vide

Lightweight video player library. Web standards first, zero config, explicit plugin opt-in.

## Philosophy

Think Deno, not webpack. Defaults are minimal. Extensions are explicit. Nothing implicit.

- `createPlayer(videoElement)` — this is the entire API surface. No config files, no data attributes, no class scanning.
- Plugins via `player.use()` — never auto-detected. User decides what loads.
- Importing a module executes nothing. Side effects are a bug.

## Rules

- **Delegate, don't wrap.** If HTMLVideoElement already has the API, proxy it. Don't invent a new name for the same thing.
- **Pure functions over stateful objects.** Parsers (VAST, VMAP) take a string, return an object. No I/O inside.
- **ESM only.** No CJS. No UMD. `sideEffects: false` in package.json.
- **Types are the docs.** If the API isn't obvious from type signatures alone, redesign the API.
- **Dependency direction: one way.** `vmap → vast → core`. Never reverse. Never circular.
- **No external runtime dependencies.** The player ships zero `dependencies`. devDependencies only.

## When adding features

1. Can the browser do it natively? → Don't build it. (e.g., subtitles → `<track>`, fullscreen → Fullscreen API)
2. Is it needed by <80% of users? → Plugin, not core.
3. Does it increase core gzip beyond 3KB? → Refactor or reject.

## Stack

TypeScript strict · ESM · tsup · vitest · Biome · pnpm

## Structure

Single package, multiple entry points via `exports` field:
- `vide` — core (createPlayer + EventBus + StateMachine)
- `vide/ui` — Headless UI plugin (16 components, optional theme.css)
- `vide/vast` — VAST 4.1 Linear Ad plugin
- `vide/vmap` — VMAP plugin (depends on vast internally)
- `vide/hls` — HLS streaming plugin (wraps hls.js, optional peer dep)
- `vide/dash` — DASH streaming plugin (wraps dashjs, optional peer dep)
- `vide/drm` — DRM plugin (Widevine + FairPlay, configures hls.js/dashjs via pluginData)
- `vide/ssai` — SSAI plugin (server-side ad insertion, reads HLS/DASH metadata)
- `vide/omid` — OM SDK (Open Measurement) viewability plugin
- `vide/simid` — SIMID (Secure Interactive Media Interface) plugin
- `vide/ima` — Google IMA SDK plugin (delegates ad lifecycle to IMA)