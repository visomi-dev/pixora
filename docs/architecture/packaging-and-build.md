# Packaging and Build

This document defines the packaging expectations for `libs/pixyn`.

## Packaging goals

- publish Pixyn as an ESM-first package;
- generate `.d.ts` types;
- keep the public API surface small and explicit;
- keep the example app consuming the same package entry used by future consumers.

## Current workspace facts

- `libs/pixyn` already uses Vite library mode.
- Nx builds the library into `dist/libs/pixyn`.
- the root workspace maps `pixyn` to `libs/pixyn/src/index.ts` during local development.

## Packaging rules for v0

- `src/index.ts` is the only public entry point in MVP.
- no deep import paths are documented or supported.
- the build must emit ESM output and type declarations.
- the package must declare runtime dependencies explicitly once PixiJS is added.

## Build expectations

- `pnpm nx build pixyn` produces a consumable distribution.
- `pnpm nx typecheck pixyn` validates the library contract.
- `pnpm nx test pixyn` covers module-level behavior.
- `pnpm nx lint pixyn` enforces code quality and import boundaries.

## Dependency policy

- PixiJS will be a runtime dependency of `pixyn`.
- utility dependencies must be added only when they clearly reduce complexity.
- avoid introducing heavyweight dependencies for concerns that can be solved with small internal modules in MVP.

## Example app consumption

The example app must import from `pixyn` rather than from source internals.

That keeps the demo aligned with the public API and prevents accidental dependency on private details.

## Release readiness checklist

Before the package is treated as publish-ready:

- root exports are documented;
- type declarations are correct;
- package metadata is complete;
- the example app runs against the public API only;
- changelog and versioning flow are defined.
