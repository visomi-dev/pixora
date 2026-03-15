# Release Strategy

## Goal

Define how Pixyn moves from internal scaffold to publishable package.

## Versioning

- treat Pixyn as pre-1.0 until the public API stabilizes;
- use semver semantics even during internal development;
- avoid promising deep import paths or unstable APIs.

## Release path

1. finish MVP implementation;
2. validate lint, test, typecheck, and build for library and example app;
3. verify package metadata and type declarations;
4. publish from `dist/libs/pixyn` through the existing Nx release flow when ready.

## Publish readiness checklist

- public API matches docs;
- package name, version, and entry metadata are correct;
- README explains install and first-use flow;
- example app proves real consumer usage;
- no private source imports remain in the example app.

## Commit and change discipline

- keep commits scoped by framework module or example app milestone;
- use commitlint-compatible conventional commits;
- update docs when a decision or public contract changes.
