---
title: Services Module
description: Service container and dependency injection
---

The Services module provides a service container for dependency injection.

## Overview

Services allow you to:

- Share functionality across the app
- Lazy-load heavy services
- Manage dependencies

## Registering Services

```typescript
import { Services } from 'pixora';

// Register a service
Services.register(AudioService, {
  useClass: AudioService,
  singleton: true,
});
```

## Using Services

```typescript
import { Services } from 'pixora';

// Get a service
const audio = Services.get(AudioService);
audio.play('music.mp3');
```

## Service Configuration

```typescript
// Configure with options
Services.register(StorageService, {
  useClass: LocalStorageService,
  options: {
    prefix: 'game_',
  },
});
```

## API Reference

For complete API documentation, see the [Generated API Docs](/docs/api/generated/).
