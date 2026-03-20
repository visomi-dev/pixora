# ADR 0011: Gameplay Islands

## Status

Accepted

## Context

ADR 0009 established the declarative runtime with tree reconciliation and scheduler-driven updates. That works well for menus, HUDs, overlays, and other scene regions that change intermittently.

Gameplay-heavy scenes have a different profile. A root scene that re-renders every tick forces reconciliation to walk more of the tree than necessary, even when only entity collections such as bullets or enemies are changing.

The Space Invaders demo exposed this gap. The gameplay scene needs to keep declarative composition, but isolate the high-churn playfield from the slower-changing shell around it.

## Decision

pixora will support a gameplay-oriented composition pattern built around **reactive scene shells** and **gameplay islands**.

### Scene structure

Gameplay scenes should be organized as:

1. **GameSceneShell**
   - background
   - HUD
   - pause and game-over overlays
   - `InPlay`
2. **InPlay**
   - player
   - bullets
   - enemy bullets
   - enemies
   - power-ups

### Runtime behavior

- Declarative scenes default to a reactive update mode so render functions re-run only when the signals they read change.
- High-frequency gameplay state should be rendered inside a `pixora.island()` owned by `InPlay`, not by the entire scene shell.
- The scene manager does not need to know when gameplay objects move if the declarative tree itself remains stable.

### Entity rendering rules

- Dynamic gameplay entities inside islands must be keyed by stable `id` values.
- Family containers such as bullet, enemy, or power-up layers are recommended when they clarify ordering or ownership.
- Structural changes such as spawn and despawn should update island-owned maps keyed by entity id.
- Per-entity visual changes such as position, size, and color should patch existing Pixi objects instead of remounting the whole scene.

## Consequences

Positive:

- keeps declarative composition for gameplay scenes;
- keeps the declarative scene tree stable during gameplay churn;
- makes gameplay rendering easier to reason about and document;
- gives example apps a consistent shell-plus-playfield structure.

Negative:

- adds new public runtime surface for managed islands;
- requires authors to think about scene boundaries and signal ownership more explicitly;
- introduces a stronger recommendation to separate scene shell state from gameplay entity state.

## Follow-up rules

- Prefer the default reactive scene mode for gameplay shells.
- Keep background, HUD, and overlays in the shell.
- Keep player and dynamic entity collections in `InPlay`.
- Use `pixora.island()` when a gameplay surface should own and patch its own Pixi objects.
