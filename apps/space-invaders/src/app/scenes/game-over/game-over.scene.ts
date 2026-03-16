import { applyLayout, Box, Button, layout, Scene, TextNode } from 'pixora';
import type { Viewport } from 'pixora';

export class GameOverScene extends Scene {
  readonly key = 'game-over';

  private readonly background = new Box();
  private readonly container = new Box();

  private readonly title = new TextNode({
    style: {
      fill: '#ff4444',
      fontFamily: 'Orbitron, sans-serif',
      fontSize: 72,
      fontWeight: '900',
    },
    text: 'GAME OVER',
  });

  private readonly scoreLabel = new TextNode({
    style: {
      fill: '#ffffff',
      fontFamily: 'Orbitron, sans-serif',
      fontSize: 32,
    },
    text: 'SCORE: 0',
  });

  private readonly highScoreLabel = new TextNode({
    style: {
      fill: '#ffff00',
      fontFamily: 'Orbitron, sans-serif',
      fontSize: 24,
    },
    text: 'HIGH SCORE: 0',
  });

  private readonly newHighScore = new TextNode({
    style: {
      fill: '#00ffaa',
      fontFamily: 'Orbitron, sans-serif',
      fontSize: 28,
      fontWeight: 'bold',
    },
    text: 'NEW HIGH SCORE!',
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

  override activate(): void {
    this.checkHighScore();
  }

  override mount(): void {
    this.root.addChild(this.background.displayObject);
    this.root.addChild(this.container.displayObject);

    this.container.addChild(this.title);
    this.container.addChild(this.scoreLabel);
    this.container.addChild(this.highScoreLabel);
    this.container.addChild(this.newHighScore);
    this.container.addChild(this.restartButton);
    this.container.addChild(this.menuButton);

    this.newHighScore.displayObject.visible = false;
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

  private checkHighScore(): void {
    try {
      const saved = localStorage.getItem('spaceInvadersHighScore');
      const currentHigh = saved ? parseInt(saved, 10) : 0;
      this.highScoreLabel.setText(`HIGH SCORE: ${currentHigh.toLocaleString()}`);
    } catch {
      this.highScoreLabel.setText('HIGH SCORE: 0');
    }
  }
}
