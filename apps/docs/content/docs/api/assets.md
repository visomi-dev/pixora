---
title: Assets Module
description: Asset loading and caching
---

The Assets module provides efficient loading and caching of game assets including textures, sounds, and data files.

## Overview

Pixora's asset system handles:

- Texture loading (PNG, JPG, WebP, etc.)
- Sprite sheet loading
- Audio loading
- JSON data loading
- Asset caching

## Loading Assets

```typescript
import { Assets } from 'pixora';

// Load a single texture
const texture = await Assets.loadTexture('player.png');

// Load multiple assets
const assets = await Assets.load(['player.png', 'enemy.png', 'background.jpg']);
```

## Loading Sprite Sheets

```typescript
import { Assets, Spritesheet } from 'pixora';

const spritesheet = await Assets.loadSpritesheet('character.json');
```

## Preloading

Preload assets at game start:

```typescript
const preloader = new Preloader({
  assets: ['player.png', 'enemy.png', 'bg.png'],
  onProgress: (progress) => {
    console.log(`Loading: ${progress * 100}%`);
  },
  onComplete: () => {
    startGame();
  },
});
```

## Asset Cache

Assets are cached automatically:

```typescript
// Returns cached asset if available
const texture = Assets.get('player.png');
```

## API Reference

For complete API documentation, see the [Generated API Docs](../generated/).
