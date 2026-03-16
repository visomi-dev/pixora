import { Box, Button, Scene, TextNode } from 'pixora';
import type { Viewport } from 'pixora';

export class MainMenuScene extends Scene {
  readonly key = 'main-menu';

  private readonly background = new Box();
  private readonly menuContainer = new Box();

  private readonly title = new TextNode({
    style: {
      fill: '#00ffaa',
      fontFamily: 'Orbitron, sans-serif',
      fontSize: 72,
      fontWeight: '900',
    },
    text: 'SPACE',
  });

  private readonly subtitle = new TextNode({
    style: {
      fill: '#ff00aa',
      fontFamily: 'Orbitron, sans-serif',
      fontSize: 48,
      fontWeight: '700',
    },
    text: 'INVADERS',
  });

  private readonly version = new TextNode({
    style: {
      fill: '#666688',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 14,
    },
    text: 'GALACTIC DEFENSE v2.0',
  });

  private readonly startButton = new Button({
    backgroundColor: 0x00ffaa,
    label: 'START GAME',
    onPress: () => {
      void this.getContext().scenes.goTo('game');
    },
    width: 280,
    height: 56,
  });

  private readonly instructionsButton = new Button({
    backgroundColor: 0x333366,
    label: 'INSTRUCTIONS',
    onPress: () => {
      void this.getContext().scenes.goTo('instructions');
    },
    width: 280,
    height: 48,
  });

  private stars: Array<{ x: number; y: number; speed: number; size: number }> = [];

  constructor() {
    super();
  }

  override activate(): void {
    this.loadHighScore();
  }

  override mount(): void {
    this.root.addChild(this.background.displayObject);
    this.root.addChild(this.title.displayObject);
    this.root.addChild(this.subtitle.displayObject);
    this.root.addChild(this.version.displayObject);
    this.root.addChild(this.menuContainer.displayObject);

    this.menuContainer.addChild(this.startButton);
    this.menuContainer.addChild(this.instructionsButton);

    this.initStars();
  }

  override resize(viewport: Viewport): void {
    this.background.updateProps({
      backgroundColor: 0x0a0a1a,
      height: viewport.height,
      width: viewport.width,
    });

    const centerX = viewport.width / 2;
    const centerY = viewport.height / 2;
    const titleY = viewport.height * 0.12;

    this.title.displayObject.x = centerX;
    this.title.displayObject.y = titleY;
    this.title.displayObject.anchor.set(0.5, 0);

    this.subtitle.displayObject.x = centerX;
    this.subtitle.displayObject.y = titleY + this.title.displayObject.height - 10;
    this.subtitle.displayObject.anchor.set(0.5, 0);

    this.version.displayObject.x = centerX;
    this.version.displayObject.y = viewport.height - 40;
    this.version.displayObject.anchor.set(0.5, 0);

    this.startButton.displayObject.x = centerX - 140;
    this.startButton.displayObject.y = centerY + 60;

    this.instructionsButton.displayObject.x = centerX - 140;
    this.instructionsButton.displayObject.y = centerY + 130;
  }

  override update(deltaMs: number): void {
    this.updateStars(deltaMs);
  }

  private initStars(): void {
    const viewport = this.getContext().viewport.get();
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * viewport.width,
        y: Math.random() * viewport.height,
        speed: 0.02 + Math.random() * 0.08,
        size: 1 + Math.random() * 2,
      });
    }
  }

  private updateStars(deltaMs: number): void {
    const viewport = this.getContext().viewport.get();
    for (const star of this.stars) {
      star.y += star.speed * deltaMs;
      if (star.y > viewport.height) {
        star.y = 0;
        star.x = Math.random() * viewport.width;
      }
    }
  }

  private loadHighScore(): void {
    try {
      const saved = localStorage.getItem('spaceInvadersHighScore');
      if (saved) {
        const highScore = parseInt(saved, 10);
        this.version.setText(`GALACTIC DEFENSE v2.0 | HIGH SCORE: ${highScore.toLocaleString()}`);
      }
    } catch {
      // localStorage not available
    }
  }
}
