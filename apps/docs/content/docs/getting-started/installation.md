---
title: Installation
description: How to install Pixyn in your project
---

## Prerequisites

Before installing Pixyn, ensure you have:

- Node.js 18+
- npm, yarn, or pnpm

## Install Pixyn

Install Pixyn and its dependencies using your preferred package manager:

```bash
npm install pixyn
# or
yarn add pixyn
# or
pnpm add pixyn
```

## Peer Dependencies

Pixyn requires pixi.js as a peer dependency:

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
import { PixynApp } from 'pixyn';

const app = new PixynApp({
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
});

app.start();
```

If the application starts without errors, Pixyn is installed correctly.

## Next Steps

- [Quick Start Guide](/docs/getting-started/quick-start/) - Build your first game
- [API Reference](/docs/api/) - Explore the full API
