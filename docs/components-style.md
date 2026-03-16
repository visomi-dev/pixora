BAD:

```ts
import { api as pixora, pixora as createPixoraApp } from 'pixora';
import type { ApplicationContext, PixoraNode, TextNodeProps } from 'pixora';

function renderMainMenu(context: ApplicationContext): PixoraNode {
  // ...
  return pixora.container(
    {
      x: 0,
      y: 0,
    },
    pixora.box({
      backgroundColor: 0x0a0a1a,
      height: context.viewport.get().height,
      width: context.viewport.get().width,
      x: 0,
      y: 0,
    }),
  );
}
```

GOOD:

```ts
import { api as pixora, pixora as createPixoraApp } from 'pixora';
import type { ApplicationContext, PixoraNode, TextNodeProps } from 'pixora';

const mainMenu = pixora.component((context: ApplicationContext) => {
    // ...
  
  return pixora.container(
    {
      x: 0,
      y: 0,
    },
    pixora.box({
      backgroundColor: 0x0a0a1a,
      height: context.viewport.get().height,
      width: context.viewport.get().width,
      x: 0,
      y: 0,
    }),
  );
});
```
