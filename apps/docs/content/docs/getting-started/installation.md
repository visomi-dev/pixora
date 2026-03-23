---
title: Installation
description: How to install Pixora in your project
---

Pixora's default authoring model is declarative: you boot a runtime with `pixora()`, provide scenes, and let the runtime manage rendering, layout, and scene transitions for you.

## Prerequisites

Before installing Pixora, ensure you have:

- Node.js 18+
- npm, yarn, or pnpm

## Install Pixora

Install Pixora and its dependencies using your preferred package manager:

```bash
npm install pixora@0.7.1
# or
yarn add pixora@0.7.1
# or
pnpm add pixora@0.7.1
```

## Peer Dependencies

Pixora requires pixi.js as a peer dependency:

```bash
npm install pixi.js
# or
yarn add pixi.js
# or
pnpm add pixi.js
```

## TypeScript Configuration

Ensure your `tsconfig.json` has the following settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler",
    "esModuleInterop": true
  }
}
```

## Verify Installation

Create a simple scene to verify the installation:

```typescript
import { pixora } from 'pixora';

const runtime = await pixora({
  backgroundColor: 0x1099bb,
  initialScene: 'hello',
  mount: document.querySelector('#stage')!,
  scenes: [
    pixora.scene({
      key: 'hello',
      render: () => pixora.text({ text: 'Hello, Pixora!', color: '#ffffff', size: 32 }),
    }),
  ],
});

await runtime.start();
```

If the runtime starts without errors and renders the scene tree, Pixora is installed correctly.

## Next Steps

- [Quick Start Guide](../quick-start/) - Build your first declarative game scene
- [API Reference](../../api/) - Explore the full runtime and compatibility APIs
