---
title: Installation
description: How to install Pixora in your project
---

## Prerequisites

Before installing Pixora, ensure you have:

- Node.js 18+
- npm, yarn, or pnpm

## Install Pixora

Install Pixora and its dependencies using your preferred package manager:

```bash
npm install pixora
# or
yarn add pixora
# or
pnpm add pixora
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

Create a simple test file to verify the installation:

```typescript
import { PixoraApp } from 'pixora';

const app = new PixoraApp({
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
});

app.start();
```

If the application starts without errors, Pixora is installed correctly.

## Next Steps

- [Quick Start Guide](/docs/getting-started/quick-start/) - Build your first game
- [API Reference](/docs/api/) - Explore the full API
