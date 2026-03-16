---
title: Space Invaders Game
description: A complete Space Invaders-style shooter game built with Pixyn
---

This example demonstrates a complete Space Invaders-style game built using Pixyn's scene system, entity components, input handling, and UI elements.

## Play the Game

<iframe src="/examples/game/" width="100%" height="720" frameborder="0" style="max-width: 1280px; margin: 2rem 0; border-radius: 8px; background: #0f172a;"></iframe>

## Game Features

- **Player Control**: Arrow keys to move, Space to shoot
- **Enemy AI**: Enemies move in formation and shoot back
- **Scoring System**: Earn points for destroying enemies
- **Lives System**: Player has 3 lives
- **Game States**: Main menu, gameplay, pause overlay, and game over

## Code Overview

The game is organized into three scenes:

1. **MainMenuScene** - Title screen with play button
2. **GameplayScene** - The main game logic
3. **PauseOverlay** - Pause menu with resume and quit options

### Main Application Setup

```typescript
import { createPixynApp } from 'pixyn';

const app = await createPixynApp({
  autoStart: false,
  backgroundColor: 0x172033,
  initialScene: 'main-menu',
  mount: stageHost,
  scenes: [
    { create: () => new MainMenuScene(), key: 'main-menu' },
    { create: () => new GameplayScene(), key: 'gameplay' },
    { create: () => new PauseOverlay(), key: 'pause-overlay', kind: 'overlay' },
  ],
});

await app.start();
```

### Scene Structure

```typescript
export class GameplayScene extends Scene {
  readonly key = 'gameplay';

  private player: GameObject;
  private bullets: GameObject[] = [];
  private enemies: GameObject[] = [];
  private score = 0;
  private lives = 3;

  override update(deltaMs: number): void {
    // Handle input
    // Update game objects
    // Check collisions
  }
}
```

## Key Pixyn Features Used

| Feature               | Usage                               |
| --------------------- | ----------------------------------- |
| `Scene`               | Game scenes (menu, gameplay, pause) |
| `Panel`               | Game objects and UI                 |
| `Button`              | Menu buttons                        |
| `TextNode`            | Score and UI labels                 |
| `createKeyboardInput` | Arrow keys and space bar            |
| `applyLayout`         | Responsive positioning              |
| `layout.anchor`       | Center game over text               |

## Controls

| Key       | Action      |
| --------- | ----------- |
| `←` / `→` | Move player |
| `Space`   | Shoot       |
| `Escape`  | Pause game  |

## Next Steps

- [API Reference](/docs/api/) - Explore the full API
- [Scene Management](/docs/api/scenes/) - Learn about scenes
