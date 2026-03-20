import { renderGameSceneShell } from './game-scene-shell';
import { emitScore, initGame, initializedSignal, syncViewport, updateGame } from './game-state';

import type { KeyboardState } from 'pixora';
import { createKeyboardInput, pixora } from 'pixora';

let keyboard: KeyboardState | null = null;

export { resetGame } from './game-state';

export const gameScene = pixora.scene({
  key: 'game',
  render: (context) => {
    const viewport = context.viewport.get();
    syncViewport(viewport.width, viewport.height);

    if (!initializedSignal.get()) {
      keyboard = createKeyboardInput();
      initGame();
      initializedSignal.set(true);

      context.app.ticker.add((() => updateGame(context.app.ticker.deltaMS, context, keyboard)) as never);
    }

    emitScore(context);

    return renderGameSceneShell(context, viewport.width, viewport.height);
  },
});
