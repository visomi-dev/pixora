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
- The gameplay scene is split into a stable `GameSceneShell` and an `InPlay` island.

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
2. **gameScene** - A reactive gameplay shell plus the `InPlay` gameplay island
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

### Gameplay Structure

The gameplay scene follows Pixora's recommended shell-plus-island split:

- `GameSceneShell` owns the background, HUD, and pause or game-over overlays.
- `InPlay` owns the player, bullets, enemy bullets, enemies, and power-ups.
- `InPlay` renders through `pixora.island()` so gameplay objects update directly on the canvas.
- Only `InPlay` reads the high-frequency gameplay signals.

## Key Pixora Features Used

| Feature               | Usage                                     |
| --------------------- | ----------------------------------------- |
| `pixora.scene()`      | Declarative scene definition              |
| `pixora.container()`  | Node grouping and layout root             |
| `pixora.island()`     | Managed self-updating gameplay surface    |
| `pixora.box()`        | Background fills                          |
| `pixora.keyedBox()`   | Stable keyed entity rendering             |
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

<a class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 no-underline transition-colors hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800" href="https://github.com/visomi-dev/pixora/tree/v0.7.4/apps/space-invaders" target="_blank" rel="noopener">
  <span class="material-symbols-outlined text-sm">code</span>
  View full source code
</a>

## Next Steps

- [API Reference](../../api/) - Explore the full API
- [Scene Management](../../api/scenes/) - Learn about scenes
- [Quick Start](../../getting-started/quick-start/) - Build your own declarative scene flow
