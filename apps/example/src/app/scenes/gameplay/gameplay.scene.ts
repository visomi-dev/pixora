import {
  applyLayout,
  Button,
  clearKeyboardFrame,
  createKeyboardInput,
  Keys,
  layout,
  Panel,
  Scene,
  TextNode,
} from 'pixora';
import type { KeyboardState, Viewport } from 'pixora';

type GameObject = {
  x: number;
  y: number;
  width: number;
  height: number;
  displayObject: Panel;
  vx: number;
  vy: number;
};

export class GameplayScene extends Scene {
  readonly key = 'gameplay';

  private readonly background = new Panel();
  private readonly hud = new Panel();
  private readonly gameArea = new Panel();

  private readonly scoreLabel = new TextNode({
    style: {
      fill: '#ffffff',
      fontFamily: 'JetBrains Mono, Courier New, monospace',
      fontSize: 24,
      fontWeight: 'bold',
    },
    text: 'Score: 0',
  });
  private readonly livesLabel = new TextNode({
    style: {
      fill: '#ef8d5e',
      fontFamily: 'JetBrains Mono, Courier New, monospace',
      fontSize: 24,
      fontWeight: 'bold',
    },
    text: 'Lives: 3',
  });
  private readonly gameOverLabel = new TextNode({
    style: {
      fill: '#ef4444',
      fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
      fontSize: 64,
      fontWeight: '600',
    },
    text: 'GAME OVER',
  });
  private readonly restartButton = new Button({
    backgroundColor: 0xef8d5e,
    label: 'Play Again',
    onPress: () => {
      this.resetGame();
    },
    width: 200,
  });

  private keyboard: KeyboardState;
  private player!: GameObject;
  private bullets: GameObject[] = [];
  private enemyBullets: GameObject[] = [];
  private enemies: GameObject[] = [];

  private score = 0;
  private lives = 3;
  private gameOver = false;
  private lastShot = 0;
  private enemyDirection = 1;
  private enemyDropAmount = 0;
  private viewportWidth = 1280;
  private viewportHeight = 720;

  constructor() {
    super();
    this.keyboard = createKeyboardInput();
  }

  override activate(): void {
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.updateLabels();
    this.initGame();
  }

  override mount(): void {
    this.root.addChild(this.background.displayObject);
    this.root.addChild(this.gameArea.displayObject);
    this.root.addChild(this.hud.displayObject);

    this.hud.addChild(this.scoreLabel);
    this.hud.addChild(this.livesLabel);

    this.gameArea.addChild(this.gameOverLabel);
    this.gameArea.addChild(this.restartButton);

    this.gameOverLabel.displayObject.visible = false;
    this.restartButton.displayObject.visible = false;
  }

  override resize(viewport: Viewport): void {
    this.viewportWidth = viewport.width;
    this.viewportHeight = viewport.height;

    this.background.updateProps({
      backgroundColor: 0x0f172a,
      height: viewport.height,
      width: viewport.width,
    });

    this.gameArea.updateProps({
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

    applyLayout(
      this.gameOverLabel,
      layout.anchor({
        horizontal: 'center',
        vertical: 'center',
        offsetY: -60,
      }),
      { height: viewport.height, width: viewport.width, x: 0, y: 0 },
      viewport,
    );

    applyLayout(
      this.restartButton,
      layout.anchor({
        horizontal: 'center',
        vertical: 'center',
        offsetY: 40,
      }),
      { height: viewport.height, width: viewport.width, x: 0, y: 0 },
      viewport,
    );

    this.initGame();
  }

  override update(deltaMs: number): void {
    if (this.gameOver) {
      return;
    }

    const keys = this.keyboard.keys.get();
    const keysPressed = this.keyboard.keysPressed.get();

    if (keysPressed[Keys.Escape]) {
      void this.getContext().scenes.showOverlay('pause-overlay');
      clearKeyboardFrame();
      return;
    }

    this.updatePlayer(deltaMs, keys);
    this.updateBullets(deltaMs);
    this.updateEnemies(deltaMs);
    this.checkCollisions();

    clearKeyboardFrame();
  }

  private initGame(): void {
    for (const bullet of this.bullets) {
      bullet.displayObject.displayObject.visible = false;
    }
    for (const bullet of this.enemyBullets) {
      bullet.displayObject.displayObject.visible = false;
    }
    for (const enemy of this.enemies) {
      enemy.displayObject.displayObject.visible = false;
    }

    this.bullets = [];
    this.enemyBullets = [];
    this.enemies = [];

    this.player = this.createGameObject(50, 30, 0x22c55e);
    this.player.x = this.viewportWidth / 2 - 25;
    this.player.y = this.viewportHeight - 60;
    this.gameArea.addChild(this.player.displayObject);

    const rows = 3;
    const cols = 5;
    const enemyWidth = 40;
    const enemyHeight = 30;
    const padding = 20;
    const offsetX = (this.viewportWidth - cols * (enemyWidth + padding)) / 2;
    const offsetY = 80;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const enemy = this.createGameObject(enemyWidth, enemyHeight, 0xef4444);
        enemy.x = offsetX + col * (enemyWidth + padding);
        enemy.y = offsetY + row * (enemyHeight + padding);
        enemy.vx = 1;
        this.enemies.push(enemy);
        this.gameArea.addChild(enemy.displayObject);
      }
    }

    this.enemyDirection = 1;
    this.enemyDropAmount = 0;
  }

  private createGameObject(width: number, height: number, color: number): GameObject {
    const panel = new Panel({
      backgroundColor: color,
      height,
      width,
    });

    return {
      x: 0,
      y: 0,
      width,
      height,
      displayObject: panel,
      vx: 0,
      vy: 0,
    };
  }

  private updatePlayer(deltaMs: number, keys: Record<string, boolean>): void {
    const speed = 0.5 * deltaMs;

    if (keys[Keys.ArrowLeft]) {
      this.player.x = Math.max(0, this.player.x - speed);
    }
    if (keys[Keys.ArrowRight]) {
      this.player.x = Math.min(this.viewportWidth - this.player.width, this.player.x + speed);
    }

    this.player.displayObject.displayObject.x = this.player.x;
    this.player.displayObject.displayObject.y = this.player.y;

    const keysPressed = this.keyboard.keysPressed.get();
    if (keysPressed[Keys.Space] && Date.now() - this.lastShot > 250) {
      this.lastShot = Date.now();
      this.fireBullet();
    }
  }

  private fireBullet(): void {
    const bullet = this.createGameObject(6, 16, 0x22c55e);
    bullet.x = this.player.x + this.player.width / 2 - 3;
    bullet.y = this.player.y - 16;
    bullet.vy = -0.8;
    this.bullets.push(bullet);
    this.gameArea.addChild(bullet.displayObject);
  }

  private fireEnemyBullet(enemy: GameObject): void {
    const bullet = this.createGameObject(6, 16, 0xef4444);
    bullet.x = enemy.x + enemy.width / 2 - 3;
    bullet.y = enemy.y + enemy.height;
    bullet.vy = 0.3;
    this.enemyBullets.push(bullet);
    this.gameArea.addChild(bullet.displayObject);
  }

  private updateBullets(deltaMs: number): void {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.y += bullet.vy * deltaMs;
      bullet.displayObject.displayObject.x = bullet.x;
      bullet.displayObject.displayObject.y = bullet.y;

      if (bullet.y < -20) {
        this.gameArea.removeChild(bullet.displayObject);
        this.bullets.splice(i, 1);
      }
    }

    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = this.enemyBullets[i];
      bullet.y += bullet.vy * deltaMs;
      bullet.displayObject.displayObject.x = bullet.x;
      bullet.displayObject.displayObject.y = bullet.y;

      if (bullet.y > this.viewportHeight + 20) {
        this.gameArea.removeChild(bullet.displayObject);
        this.enemyBullets.splice(i, 1);
      }
    }
  }

  private updateEnemies(deltaMs: number): void {
    if (this.enemies.length === 0) {
      this.initGame();
      return;
    }

    let leftMost = this.viewportWidth;
    let rightMost = 0;

    for (const enemy of this.enemies) {
      leftMost = Math.min(leftMost, enemy.x);
      rightMost = Math.max(rightMost, enemy.x + enemy.width);
    }

    if (rightMost >= this.viewportWidth - 10 && this.enemyDirection > 0) {
      this.enemyDirection = -1;
      this.enemyDropAmount = 15;
    } else if (leftMost <= 10 && this.enemyDirection < 0) {
      this.enemyDirection = 1;
      this.enemyDropAmount = 15;
    }

    for (const enemy of this.enemies) {
      enemy.x += enemy.vx * this.enemyDirection * deltaMs * 0.05;
      enemy.y += this.enemyDropAmount;
      enemy.displayObject.displayObject.x = enemy.x;
      enemy.displayObject.displayObject.y = enemy.y;

      if (enemy.y > this.player.y) {
        this.loseLife();
        return;
      }

      if (Math.random() < 0.0003 * deltaMs) {
        this.fireEnemyBullet(enemy);
      }
    }

    this.enemyDropAmount = 0;
  }

  private checkCollisions(): void {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];

        if (this.rectIntersect(bullet, enemy)) {
          this.gameArea.removeChild(bullet.displayObject);
          this.bullets.splice(i, 1);

          this.gameArea.removeChild(enemy.displayObject);
          this.enemies.splice(j, 1);

          this.score += 100;
          this.updateLabels();
          break;
        }
      }
    }

    for (const bullet of this.enemyBullets) {
      if (this.rectIntersect(bullet, this.player)) {
        this.loseLife();
        break;
      }
    }
  }

  private rectIntersect(a: GameObject, b: GameObject): boolean {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  private loseLife(): void {
    this.lives--;
    this.updateLabels();

    if (this.lives <= 0) {
      this.gameOver = true;
      this.gameOverLabel.displayObject.visible = true;
      this.restartButton.displayObject.visible = true;
    } else {
      for (const bullet of this.enemyBullets) {
        this.gameArea.removeChild(bullet.displayObject);
      }
      this.enemyBullets = [];

      this.player.x = this.viewportWidth / 2 - 25;
      this.player.y = this.viewportHeight - 60;
    }
  }

  private resetGame(): void {
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.gameOverLabel.displayObject.visible = false;
    this.restartButton.displayObject.visible = false;
    this.updateLabels();
    this.initGame();
  }

  private updateLabels(): void {
    this.scoreLabel.setText(`Score: ${this.score}`);
    this.livesLabel.setText(`Lives: ${this.lives}`);
  }
}
