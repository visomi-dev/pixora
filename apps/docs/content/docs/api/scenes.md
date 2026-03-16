---
title: Scenes Module
description: Scene management and transitions
---

The Scenes module provides scene management with support for transitions between scenes.

## Overview

Scenes organize your game into logical parts:

- Title scene
- Game scene
- Menu scene
- Each scene has its own update loop

## Creating Scenes

```typescript
import { Scene } from 'pixora';

class GameScene extends Scene {
  name = 'game';

  onLoad() {
    // Load resources
  }

  onEnter() {
    // Scene entered
  }

  onUpdate(delta: number) {
    // Update game logic
  }

  onExit() {
    // Scene exiting
  }
}
```

## Scene Manager

```typescript
import { SceneManager } from 'pixora';

const sceneManager = new SceneManager(app);

// Add scenes
sceneManager.add(new TitleScene());
sceneManager.add(new GameScene());

// Switch scenes
await sceneManager.switch('game');
```

## Scene Transitions

Add smooth transitions between scenes:

```typescript
sceneManager.switch('game', {
  transition: 'fade',
  duration: 500,
});
```

## API Reference

For complete API documentation, see the [Generated API Docs](/docs/api/generated/).
