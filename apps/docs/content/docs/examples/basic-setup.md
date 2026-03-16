---
title: Basic Setup Example
description: A minimal Pixora application
---

This example demonstrates the minimum code needed to create a Pixora application.

## Complete Example

```typescript
import { PixoraApp } from 'pixora';

const app = new PixoraApp({
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
});

document.body.appendChild(app.view);

app.start();
```

## Expected Result

A blue (0x1099bb) canvas will appear with dimensions 800x600.

## Running the Example

1. Create a new TypeScript file
2. Copy the code above
3. Run with your preferred bundler (Vite, Webpack, etc.)

## Next Steps

- [Entity System Example](/docs/examples/entity-system/) - Add game objects
- [Input Handling Example](/docs/examples/input/) - Add interactivity
