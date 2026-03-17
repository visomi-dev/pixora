---
title: Space Invaders Game
description: A complete Space Invaders-style shooter game built with Pixora
---

{{< space-invaders-showcase >}}

Space Invaders is the reference example for Pixora's declarative-default runtime. It demonstrates how one runtime can coordinate menus, gameplay, overlays, and HUD state without switching mental models between docs and deploy.

## What this example proves

- The same build publishes the documentation site and the production game output together.
- Scenes stay declarative from the main menu through gameplay and post-game flows.
- HUD updates come from runtime events and reactive state, not from ad hoc DOM wiring.
- Layout primitives handle menu composition, overlays, and viewport-aware positioning.

<div class="control-grid">
  <div class="control-card">
    <strong>Move</strong>
    <span>Use <code>←</code> and <code>→</code> to reposition the ship.</span>
  </div>
  <div class="control-card">
    <strong>Shoot</strong>
    <span>Press <code>Space</code> to fire at the invading wave.</span>
  </div>
  <div class="control-card">
    <strong>Pause</strong>
    <span>Press <code>Escape</code> to open the pause overlay.</span>
  </div>
</div>

## Code Overview

The game is organized into declarative scenes using `pixora.scene()`:

1. **mainMenuScene** - Title screen with play button
2. **gameScene** - The main game logic
3. **gameOverScene** - Game over screen
4. **victoryScene** - Victory screen
5. **instructionsScene** - Controls and tips

### Main Application Setup

```typescript
import { pixora } from 'pixora';
import { mainMenuScene } from './scenes/main-menu/main-menu.scene';
import { gameScene } from './scenes/game/game.scene';

const runtime = await pixora({
  autoStart: false,
  backgroundColor: 0x0a0a1a,
  initialScene: 'main-menu',
  mount: document.querySelector('[data-stage-host]')!,
  scenes: [mainMenuScene, gameScene],
});

await runtime.start();
```

### Scene Structure

Scenes are pure functions that return a node tree. Layout is handled declaratively with `layout.flex()` and `layout.percent()`:

```typescript
import { layout, pixora } from 'pixora';

export const mainMenuScene = pixora.scene({
  key: 'main-menu',
  render: (context) => {
    const vp = context.viewport.get();

    return pixora.container(
      { x: 0, y: 0 },
      pixora.box({ backgroundColor: 0x0a0a1a, width: vp.width, height: vp.height }),
      pixora.container(
        {
          layout: layout.percent({ horizontal: 'center', vertical: 'center', width: 1 }),
        },
        pixora.container(
          {
            layout: layout.flex({ direction: 'vertical', align: 'center', gap: 16 }),
          },
          pixora.text({ text: 'SPACE', color: '#00ffaa', size: 72, weight: '900', font: 'Orbitron, sans-serif' }),
          pixora.text({ text: 'INVADERS', color: '#ff00aa', size: 48, weight: '700', font: 'Orbitron, sans-serif' }),
          pixora.button({
            label: 'START GAME',
            backgroundColor: 0x00ffaa,
            width: 280,
            height: 56,
            onPointerTap: () => void context.scenes.goTo('game'),
          }),
        ),
      ),
    );
  },
});
```

## Key Pixora Features Used

| Feature               | Usage                                     |
| --------------------- | ----------------------------------------- |
| `pixora.scene()`      | Declarative scene definition              |
| `pixora.container()`  | Node grouping and layout root             |
| `pixora.box()`        | Background fills                          |
| `pixora.text()`       | Score labels and UI text                  |
| `pixora.button()`     | Menu buttons with pointer event callbacks |
| `layout.flex()`       | Flow-based component layout               |
| `layout.percent()`    | Percentage-based positioning              |
| `createKeyboardInput` | Arrow keys, space bar, and pause shortcut |

<div class="note-card">
  <strong>Deployment note</strong>
  <span>
    The embedded iframe and the standalone example both point at the game output copied into the docs build,
    which keeps the GitHub Pages artifact self-contained.
  </span>
</div>

## Next Steps

- [API Reference](../../api/) - Explore the full API
- [Scene Management](../../api/scenes/) - Learn about scenes
- [Quick Start](../../getting-started/quick-start/) - Build your own declarative scene flow
