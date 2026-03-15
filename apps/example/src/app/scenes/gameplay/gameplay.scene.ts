import { applyLayout, Button, layout, Panel, Scene, TextNode } from 'pixyn';
import type { Viewport } from 'pixyn';

export class GameplayScene extends Scene {
  readonly key = 'gameplay';

  private readonly background = new Panel();
  private readonly hud = new Panel();
  private readonly scoreLabel = new TextNode({
    style: {
      fill: '#ffffff',
      fontFamily: 'JetBrains Mono, Courier New, monospace',
      fontSize: 24,
      fontWeight: 'bold',
    },
    text: 'Score: 0',
  });
  private readonly pauseButton = new Button({
    backgroundColor: 0x31516b,
    height: 40,
    label: 'Pause',
    onPress: () => {
      void this.getContext().scenes.showOverlay('pause-overlay');
    },
    width: 120,
  });
  private readonly character = new Panel({
    backgroundColor: 0xef8d5e,
    height: 64,
    radius: 32,
    width: 64,
  });

  private time = 0;
  private score = 0;

  override activate(): void {
    this.score = 0;
    this.scoreLabel.setText('Score: 0');
  }

  override mount(): void {
    this.root.addChild(this.background.displayObject);
    this.root.addChild(this.character.displayObject);
    this.root.addChild(this.hud.displayObject);

    this.hud.addChild(this.scoreLabel);
    this.hud.addChild(this.pauseButton);
  }

  override resize(viewport: Viewport): void {
    this.background.updateProps({
      backgroundColor: 0x203a4f,
      height: viewport.height,
      width: viewport.width,
    });

    applyLayout(
      this.hud,
      layout.stack({
        align: 'center',
        direction: 'horizontal',
        fitContent: true,
        gap: 32,
        padding: 24,
      }),
      { height: viewport.height, width: viewport.width, x: 0, y: 0 },
      viewport,
    );

    applyLayout(
      this.hud,
      layout.anchor({
        horizontal: 'center',
        vertical: 'start',
      }),
      { height: viewport.height, width: viewport.width, x: 0, y: 0 },
      viewport,
    );

    this.updateCharacterPosition(viewport);
  }

  override update(deltaMs: number): void {
    this.time += deltaMs;

    if (this.time > 1000) {
      this.time = 0;
      this.score += 10;
      this.scoreLabel.setText(`Score: ${this.score}`);
    }

    this.updateCharacterPosition(this.getViewport());
  }

  private updateCharacterPosition(viewport: Viewport): void {
    const elapsedSeconds = this.time / 1000;
    const centerX = viewport.width / 2;
    const centerY = viewport.height / 2;
    const radiusX = viewport.width * 0.3;
    const radiusY = viewport.height * 0.2;

    this.character.displayObject.x = centerX + Math.cos(elapsedSeconds * 2) * radiusX - 32;
    this.character.displayObject.y = centerY + Math.sin(elapsedSeconds * 3) * radiusY - 32;
  }
}
