# Testing Strategy

## Goals

- verify core logic without requiring full rendering where possible;
- keep tests fast enough for frequent iteration;
- validate the space-invaders game as an integration harness.

## Test layers

### Unit tests

Focus on framework modules with minimal Pixi involvement:

- state primitives;
- event bus;
- service registry;
- layout calculation;
- scene lifecycle ordering;
- tween timing math.

### Integration tests

Focus on runtime behavior across modules:

- app boot and destroy;
- scene switch flow;
- overlay flow;
- component bindings;
- asset registry integration.

### Space Invaders game validation

Use the space-invaders game to verify:

- real imports from `pixora`;
- scene and overlay composition;
- layout behavior on multiple viewport sizes;
- keyboard input handling;
- collision detection;
- game state management.

## Commands

- `pnpm nx lint pixora`
- `pnpm nx test pixora`
- `pnpm nx typecheck pixora`
- `pnpm nx build pixora`
- `pnpm nx lint space-invaders`
- `pnpm nx test space-invaders`
- `pnpm nx typecheck space-invaders`
- `pnpm nx build space-invaders`

## Manual verification checklist

- app boots without console errors;
- buttons show correct enabled and disabled behavior;
- pause overlay blocks gameplay interaction;
- resize from narrow to wide keeps UI usable;
- scene transitions clean up listeners and visual nodes.
