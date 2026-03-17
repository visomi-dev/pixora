---
title: Basic Setup Example
description: A minimal Pixora application
---

This example demonstrates the smallest declarative Pixora runtime you can boot.

## Complete Example

```typescript
import { pixora } from 'pixora';

const runtime = await pixora({
  height: 600,
  initialScene: 'hello',
  mount: document.querySelector('#stage')!,
  backgroundColor: 0x1099bb,
  scenes: [
    pixora.scene({
      key: 'hello',
      render: () => pixora.text({ text: 'Hello, Pixora!', color: '#ffffff', size: 32 }),
    }),
  ],
});

await runtime.start();
```

## Expected Result

A blue canvas appears and renders a single declarative text node.

## Running the Example

1. Create a new TypeScript file
2. Copy the code above
3. Run with your preferred bundler (Vite, Webpack, etc.)

## Next Steps

- [Entity System Example](../entity-system/) - Add game objects
- [Input Handling Example](../input/) - Add interactivity
