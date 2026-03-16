# ADR 0007: Animation Strategy

## Status

Accepted

## Context

pixora needs transitions and interaction feedback, but the PRD explicitly avoids a complex animation system in MVP.

## Decision

pixora will ship a small internal tween and transition layer for MVP.

The animation layer will support:

- numeric interpolation;
- easing selection;
- enter and exit helpers;
- button feedback;
- scene and panel transitions.

No external animation library is introduced in MVP.

## Consequences

Positive:

- small surface area;
- predictable ownership of timing and disposal;
- enough capability for menu and HUD polish.

Negative:

- advanced choreography is deferred;
- pixora must implement and test its own tween runner.

## Follow-up rules

- tweens are disposable;
- transitions must integrate with scene activation and overlay visibility;
- animations must avoid hidden layout side effects.
