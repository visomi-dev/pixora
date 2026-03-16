# Packaging and Build

This document defines the packaging expectations for `libs/pixora`.

## Packaging goals

- publish pixora as an ESM-first package;
- generate `.d.ts` types;
- keep the public API surface small and explicit;
- keep the space-invaders game consuming the same package entry used by future consumers.

## Current workspace facts

- `libs/pixora` already uses Vite library mode.
- Nx builds the library into `dist/libs/pixora`.
- the root workspace maps `pixora` to `libs/pixora/src/index.ts` during local development.

## Packaging rules for v0

- `src/index.ts` is the only public entry point in MVP.
- no deep import paths are documented or supported.
- the build must emit ESM output and type declarations.
- the package must declare runtime dependencies explicitly once PixiJS is added.

## Build expectations

- `pnpm nx build pixora` produces a consumable distribution.
- `pnpm nx typecheck pixora` validates the library contract.
- `pnpm nx test pixora` covers module-level behavior.
- `pnpm nx lint pixora` enforces code quality and import boundaries.

## Dependency policy

- PixiJS will be a runtime dependency of `pixora`.
- utility dependencies must be added only when they clearly reduce complexity.
- avoid introducing heavyweight dependencies for concerns that can be solved with small internal modules in MVP.

## Space Invaders game consumption

The space-invaders game must import from `pixora` rather than from source internals.

That keeps the demo aligned with the public API and prevents accidental dependency on private details.

## Release readiness checklist

Before the package is treated as publish-ready:

- root exports are documented;
- type declarations are correct;
- package metadata is complete;
- the space-invaders game runs against the public API only;
- changelog and versioning flow are defined.
