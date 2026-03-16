import { applyLayout, Box, Button, layout, Scene, TextNode } from 'pixora';
import type { Viewport } from 'pixora';

export class VictoryScene extends Scene {
  readonly key = 'victory';

  private readonly background = new Box();
  private readonly container = new Box();

  private readonly title = new TextNode({
    style: {
      fill: '#00ffaa',
      fontFamily: 'Orbitron, sans-serif',
      fontSize: 72,
      fontWeight: '900',
    },
    text: 'VICTORY!',
  });

  private readonly subtitle = new TextNode({
    style: {
      fill: '#ff00aa',
      fontFamily: 'Orbitron, sans-serif',
      fontSize: 28,
    },
    text: 'GALAXY DEFENDED!',
  });

  private readonly scoreLabel = new TextNode({
    style: {
      fill: '#ffffff',
      fontFamily: 'Orbitron, sans-serif',
      fontSize: 32,
    },
    text: 'FINAL SCORE: 0',
  });

  private readonly restartButton = new Button({
    backgroundColor: 0x00ffaa,
    label: 'PLAY AGAIN',
    onPress: () => {
      void this.getContext().scenes.goTo('main-menu');
    },
    width: 280,
    height: 56,
  });

  private readonly menuButton = new Button({
    backgroundColor: 0x666688,
    label: 'MAIN MENU',
    onPress: () => {
      void this.getContext().scenes.goTo('main-menu');
    },
    width: 280,
    height: 48,
  });

  constructor() {
    super();
  }

  override mount(): void {
    this.root.addChild(this.background.displayObject);
    this.root.addChild(this.container.displayObject);

    this.container.addChild(this.title);
    this.container.addChild(this.subtitle);
    this.container.addChild(this.scoreLabel);
    this.container.addChild(this.restartButton);
    this.container.addChild(this.menuButton);
  }

  override resize(viewport: Viewport): void {
    this.background.updateProps({
      backgroundColor: 0x0a0a1a,
      height: viewport.height,
      width: viewport.width,
    });

    applyLayout(
      this.container,
      layout.stack({
        align: 'center',
        direction: 'vertical',
        fitContent: true,
        gap: 24,
        padding: 48,
      }),
      { height: viewport.height, width: viewport.width, x: 0, y: 0 },
      viewport,
    );

    applyLayout(
      this.container,
      layout.anchor({
        horizontal: 'center',
        vertical: 'center',
      }),
      { height: viewport.height, width: viewport.width, x: 0, y: 0 },
      viewport,
    );
  }
}
