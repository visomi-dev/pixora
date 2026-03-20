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

## Gameplay scenes

For gameplay-heavy scenes, prefer a stable `GameSceneShell` plus a focused `InPlay` island.

- keep background, HUD, and overlays in the shell;
- keep player and dynamic entity collections in `InPlay`;
- use `pixora.island()` for the hot gameplay surface that owns its own Pixi state;
- use keyed host helpers such as `pixora.keyedBox()` for bullets, enemies, and power-ups;
- let the scene shell stay declarative while the island patches gameplay objects directly.
