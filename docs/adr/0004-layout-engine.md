# ADR 0004: Layout Engine

## Status

Accepted

## Context

Manual positioning is one of the main pain points the framework must solve, but building a CSS-like engine would delay the MVP.

## Decision

The MVP layout engine will support only three layout strategies:

- `fixed`
- `anchor`
- `stack`

Layouts are declarative and attached to nodes. The engine recalculates when:

- the viewport changes;
- the parent layout changes;
- a layout-relevant property changes.

`grid` and more advanced responsive behavior are postponed until after the first working space-invaders game.

## Consequences

Positive:

- focused scope;
- solves menus, HUDs, and overlays;
- keeps runtime cost small.

Negative:

- complex dynamic arrangements may need temporary custom logic;
- some future game screens may outgrow the MVP layout primitives.

## Follow-up rules

- mobile-first layouts are the default;
- layout rules resolve from parent bounds or viewport bounds;
- layout does not animate by itself.
