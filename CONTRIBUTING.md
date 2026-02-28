# Contributing

## Setup

```sh
git clone https://github.com/hogekai/vide.git
cd vide
pnpm install
pnpm test
```

## Development

```sh
pnpm dev         # watch mode (not yet configured — use pnpm build)
pnpm build       # build all entry points
pnpm typecheck   # type check
pnpm lint        # lint
pnpm lint:fix    # lint with auto-fix
```

## Testing

```sh
pnpm test        # unit tests (vitest)
pnpm test:watch  # unit tests in watch mode
pnpm test:e2e    # E2E tests (Playwright, requires browser install)
```

### Unit Tests

Unit tests are in `tests/` and run with [vitest](https://vitest.dev/). Each plugin has its own test directory (e.g., `tests/hls/`, `tests/vast/`). `tests/performance.test.ts` covers setup timing budgets, event listener cleanup, and create/destroy cycle stability.

### E2E Tests

E2E tests are in `tests/e2e/` and run with [Playwright](https://playwright.dev/) against the example pages in `examples/`.

First-time setup:

```sh
pnpm test:e2e:install   # install browser binaries + system deps
```

The E2E suite covers core playback, HLS streaming, UI controls, and keyboard shortcuts. Tests run in Chromium by default and are also included in CI.

### Bundle Size

```sh
bash scripts/bundle-size.sh   # build + report gzip sizes for all entry points
```

Core must stay under 3 KB gzip. Size increases require justification.

## Pull Request

1. Fork → branch → commit → PR
2. All tests must pass (`pnpm test` and `pnpm typecheck`)
3. New features require tests
4. Bundle size increases require justification

## Docs

```sh
pnpm docs:api      # generate API reference (TypeDoc → docs/api-reference/)
pnpm docs:dev      # local VitePress dev server
pnpm docs:build    # production docs build
pnpm docs:preview  # preview production build
```

API reference is auto-generated from JSDoc/TypeScript via TypeDoc. The output goes to `docs/api-reference/` (gitignored) and is built before `docs:build` in CI.

## Architecture

Single package, multiple entry points (`vide`, `vide/vast`, `vide/hls`, etc.). Dependency direction is one-way: `vmap → vast → core`. Never reverse, never circular.

See [CLAUDE.md](CLAUDE.md) for design principles.

## Code Style

- TypeScript strict mode
- ESM only — no CJS, no UMD
- Biome for formatting and linting (tab indentation)
- No external runtime dependencies in core
- If the browser can do it natively, don't build it
