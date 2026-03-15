# ADR 0001: Reactive Core

## Status

Accepted

## Context

The PRD left the reactive model open between three options:

- RxJS-first;
- signals-first;
- a hybrid model.

Pixyn needs predictable local and global state, lightweight derived values, and clear cleanup. The framework does not need a stream-heavy public API for MVP.

## Decision

Pixyn will use a minimal internal signals-and-store reactive core as the primary state model.

RxJS is not the foundation of the public API.

Events and asynchronous workflows are handled through the typed event bus and promise-based asset loading. RxJS can be added later as an integration layer if a real use case appears.

## Consequences

Positive:

- simpler mental model for app, scene, and component state;
- fast synchronous snapshot reads;
- low boilerplate for local state;
- easier cleanup and framework ownership of subscriptions.

Negative:

- Pixyn must implement a small reactive runtime instead of reusing an existing stream library;
- advanced stream composition is not part of MVP.

## Follow-up rules

- stores expose snapshot reads and controlled writes;
- derived values use `computed`;
- side effects use `effect`;
- domain events go through the event bus, not through stores.
