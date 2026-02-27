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
pnpm test        # run tests
pnpm test:watch  # tests in watch mode
pnpm typecheck   # type check
pnpm lint        # lint
pnpm build       # build all entry points
```

## Pull Request

1. Fork → branch → commit → PR
2. All tests must pass
3. New features require tests
4. Bundle size increases require justification

## Architecture

Single package, multiple entry points (`vide`, `vide/vast`, `vide/hls`, etc.). Dependency direction is one-way: `vmap → vast → core`. Never reverse, never circular.

See [CLAUDE.md](CLAUDE.md) for design principles.

## Code Style

- TypeScript strict mode
- ESM only — no CJS, no UMD
- Biome for formatting and linting (tab indentation)
- No external runtime dependencies in core
- If the browser can do it natively, don't build it
