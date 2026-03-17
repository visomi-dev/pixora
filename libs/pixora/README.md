# pixora

Pixora is a declarative-by-default game framework for Pixi.js and TypeScript.

Start with `pixora()`, describe screens with `pixora.scene()`, and compose menus, HUD, and overlays from layout-aware nodes and reactive state. Lower-level compatibility APIs remain available when you need imperative interop or migration paths.

## Install

```bash
pnpm add pixora pixi.js
```

## First runtime

```ts
import { pixora } from 'pixora';

const runtime = await pixora({
  backgroundColor: 0x0a0a1a,
  initialScene: 'menu',
  mount: document.querySelector('#stage'),
  scenes: [
    pixora.scene({
      key: 'menu',
      render: () => pixora.text({ text: 'Hello, Pixora!', color: '#ffffff', size: 32 }),
    }),
  ],
});

await runtime.start();
```

## Workspace tasks

- `pnpm nx build pixora`
- `pnpm nx run pixora:test --run`
