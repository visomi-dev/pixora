# ADR 0008: Asset Strategy

## Status

Accepted

## Context

The framework needs centralized asset access, but the first phase does not need a complex pipeline.

## Decision

pixora will provide a key-based asset registry with a small loading facade.

The registry will:

- register asset keys and source paths;
- load individual assets or bundles;
- expose load state;
- return textures or spritesheet data through typed lookup methods.

Under the hood, pixora may use PixiJS asset utilities once PixiJS is installed, but the framework API must remain framework-owned.

## Consequences

Positive:

- centralized asset ownership;
- scene code avoids path scattering;
- easier future loading screens and preload steps.

Negative:

- another abstraction layer must be maintained;
- sound and advanced content pipelines remain deferred.

## Follow-up rules

- asset keys must be stable and unique;
- missing required assets must fail fast in development;
- optional assets may expose fallback behavior.
