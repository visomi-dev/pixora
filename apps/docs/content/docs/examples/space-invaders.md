---
title: Space Invaders Game
description: A complete Space Invaders-style shooter game built with Pixora
---

This example demonstrates a complete Space Invaders-style game built using Pixora's declarative scene system, layout engine, input handling, and UI components.

## Play the Game

<iframe src="/examples/game/" width="100%" height="720" frameborder="0" style="max-width: 1280px; margin: 2rem 0; border-radius: 8px; background: #0f172a;"></iframe>

## Game Features

- **Player Control**: Arrow keys to move, Space to shoot
- **Enemy AI**: Enemies move in formation and shoot back
- **Scoring System**: Earn points for destroying enemies
- **Lives System**: Player has 3 lives
- **Game States**: Main menu, gameplay, pause overlay, and game over

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
  mount: document.querySelector('[data-stage-host]'),
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
| `createKeyboardInput` | Arrow keys and space bar                  |

## Controls

| Key       | Action      |
| --------- | ----------- |
| `←` / `→` | Move player |
| `Space`   | Shoot       |
| `Escape`  | Pause game  |

## Next Steps

- [API Reference](/docs/api/) - Explore the full API
- [Scene Management](/docs/api/scenes/) - Learn about scenes
