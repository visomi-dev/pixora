import {
  applyLayout,
  Box,
  Button,
  clearKeyboardFrame,
  createKeyboardInput,
  Keys,
  layout,
  Scene,
  TextNode,
} from 'pixora';
import type { KeyboardState, Viewport } from 'pixora';

type GameObject = {
  x: number;
  y: number;
  width: number;
  height: number;
  displayObject: Box;
  vx: number;
  vy: number;
  type?: string;
  hp?: number;
  maxHp?: number;
};

type PowerUp = {
  x: number;
  y: number;
  width: number;
  height: number;
  displayObject: Box;
  type: 'shield' | 'triple-shot' | 'speed' | 'bomb';
  vy: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  displayObject: Box;
  color: number;
};

export class GameScene extends Scene {
  readonly key = 'game';

  private readonly background = new Box();
  private readonly hud = new Box();
  private readonly gameArea = new Box();

  private readonly scoreLabel = new TextNode({
    style: {
      fill: '#00ffaa',
      fontFamily: 'Orbitron, monospace',
      fontSize: 20,
      fontWeight: 'bold',
    },
    text: 'SCORE: 0',
  });

  private readonly levelLabel = new TextNode({
    style: {
      fill: '#ff00aa',
      fontFamily: 'Orbitron, monospace',
      fontSize: 20,
      fontWeight: 'bold',
    },
    text: 'LEVEL: 1',
  });

  private readonly comboLabel = new TextNode({
    style: {
      fill: '#ffff00',
      fontFamily: 'Orbitron, monospace',
      fontSize: 16,
      fontWeight: 'bold',
    },
    text: '',
  });

  private readonly livesLabel = new TextNode({
    style: {
      fill: '#ff6644',
      fontFamily: 'Orbitron, monospace',
      fontSize: 18,
    },
    text: 'LIVES: ♥ ♥ ♥',
  });

  private readonly pauseLabel = new TextNode({
    style: {
      fill: '#ffffff',
      fontFamily: 'Orbitron, monospace',
      fontSize: 48,
      fontWeight: 'bold',
    },
    text: 'PAUSED',
  });

  private readonly continueButton = new Button({
    backgroundColor: 0x00ffaa,
    label: 'CONTINUE',
    onPress: () => {
      this.paused = false;
      this.pauseLabel.displayObject.visible = false;
      this.continueButton.displayObject.visible = false;
    },
    width: 200,
  });

  private readonly restartButton = new Button({
    backgroundColor: 0xff6644,
    label: 'RESTART',
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
  private powerUps: PowerUp[] = [];
  private particles: Particle[] = [];

  private score = 0;
  private level = 1;
  private lives = 3;
  private combo = 0;
  private comboTimer = 0;
  private lastShot = 0;
  private enemyDirection = 1;
  private enemyDropAmount = 0;
  private enemySpeed = 0.8;
  private viewportWidth = 1280;
  private viewportHeight = 720;

  private paused = false;
  private gameOver = false;

  private hasShield = false;
  private hasTripleShot = false;
  private hasSpeedBoost = false;
  private shieldTimer = 0;
  private tripleShotTimer = 0;
  private speedTimer = 0;
  private screenShake = 0;

  constructor() {
    super();
    this.keyboard = createKeyboardInput();
  }

  override activate(): void {
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.combo = 0;
    this.gameOver = false;
    this.paused = false;
    this.updateLabels();
    this.initGame();
    this.emitScore();
  }

  override mount(): void {
    this.root.addChild(this.background.displayObject);
    this.root.addChild(this.gameArea.displayObject);
    this.root.addChild(this.hud.displayObject);

    this.hud.addChild(this.scoreLabel);
    this.hud.addChild(this.levelLabel);
    this.hud.addChild(this.comboLabel);
    this.hud.addChild(this.livesLabel);

    this.gameArea.addChild(this.pauseLabel);
    this.gameArea.addChild(this.continueButton);
    this.gameArea.addChild(this.restartButton);

    this.pauseLabel.displayObject.visible = false;
    this.continueButton.displayObject.visible = false;
    this.restartButton.displayObject.visible = false;
  }

  override resize(viewport: Viewport): void {
    this.viewportWidth = viewport.width;
    this.viewportHeight = viewport.height;

    this.background.updateProps({
      backgroundColor: 0x0a0a1a,
      height: viewport.height,
      width: viewport.width,
    });

    this.gameArea.updateProps({
      backgroundColor: 0x0a0a1a,
      height: viewport.height,
      width: viewport.width,
    });

    this.hud.displayObject.x = 0;
    this.hud.displayObject.y = 0;

    this.positionHud();

    applyLayout(
      this.pauseLabel,
      layout.anchor({
        horizontal: 'center',
        vertical: 'center',
        offsetY: -40,
      }),
      { height: viewport.height, width: viewport.width, x: 0, y: 0 },
      viewport,
    );

    applyLayout(
      this.continueButton,
      layout.anchor({
        horizontal: 'center',
        vertical: 'center',
        offsetY: 40,
      }),
      { height: viewport.height, width: viewport.width, x: 0, y: 0 },
      viewport,
    );

    applyLayout(
      this.restartButton,
      layout.anchor({
        horizontal: 'center',
        vertical: 'center',
        offsetY: 100,
      }),
      { height: viewport.height, width: viewport.width, x: 0, y: 0 },
      viewport,
    );

    this.initGame();
  }

  override update(deltaMs: number): void {
    if (this.gameOver || this.paused) {
      return;
    }

    const keys = this.keyboard.keys.get();
    const keysPressed = this.keyboard.keysPressed.get();

    if (keysPressed['KeyP'] || keysPressed['Escape']) {
      this.paused = true;
      this.pauseLabel.displayObject.visible = true;
      this.continueButton.displayObject.visible = true;
      this.restartButton.displayObject.visible = true;
      clearKeyboardFrame();
      return;
    }

    this.updatePowerUps(deltaMs);
    this.updatePlayer(deltaMs, keys);
    this.updateBullets(deltaMs);
    this.updateEnemies(deltaMs);
    this.checkCollisions();
    this.updateParticles(deltaMs);
    this.updateCombo(deltaMs);
    this.updateScreenShake(deltaMs);
    this.updatePowerUpTimers(deltaMs);

    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      this.gameArea.displayObject.x = shakeX;
      this.gameArea.displayObject.y = shakeY;
    } else {
      this.gameArea.displayObject.x = 0;
      this.gameArea.displayObject.y = 0;
    }

    clearKeyboardFrame();
  }

  private initGame(): void {
    this.clearAllObjects();

    this.player = this.createGameObject(40, 30, 0x00ffaa, 'player');
    this.player.x = this.viewportWidth / 2 - 20;
    this.player.y = this.viewportHeight - 80;
    this.player.displayObject.displayObject.x = this.player.x;
    this.player.displayObject.displayObject.y = this.player.y;
    this.gameArea.addChild(this.player.displayObject);

    this.spawnEnemies();
  }

  private clearAllObjects(): void {
    if (this.player) {
      this.gameArea.removeChild(this.player.displayObject);
    }

    for (const bullet of this.bullets) {
      this.gameArea.removeChild(bullet.displayObject);
    }
    for (const bullet of this.enemyBullets) {
      this.gameArea.removeChild(bullet.displayObject);
    }
    for (const enemy of this.enemies) {
      this.gameArea.removeChild(enemy.displayObject);
    }
    for (const powerUp of this.powerUps) {
      this.gameArea.removeChild(powerUp.displayObject);
    }
    for (const particle of this.particles) {
      this.gameArea.removeChild(particle.displayObject);
    }

    this.bullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.powerUps = [];
    this.particles = [];
  }

  private spawnEnemies(): void {
    const rows = 3 + Math.min(this.level - 1, 3);
    const cols = 5 + Math.min(this.level - 1, 5);
    const baseWidth = 35;
    const baseHeight = 25;
    const padding = 15;
    const offsetX = (this.viewportWidth - cols * (baseWidth + padding)) / 2;
    const offsetY = 60;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let color = 0xff4444;
        let enemyType = 'scout';
        let hp = 1;

        if (this.level >= 2 && row === 0) {
          color = 0xff00ff;
          enemyType = 'tank';
          hp = 3;
        } else if (this.level >= 3 && row <= 1 && col % 2 === 0) {
          color = 0xffaa00;
          enemyType = 'soldier';
          hp = 2;
        }

        const enemy = this.createGameObject(baseWidth, baseHeight, color, enemyType);
        enemy.x = offsetX + col * (baseWidth + padding);
        enemy.y = offsetY + row * (baseHeight + padding);
        enemy.vx = this.enemySpeed;
        enemy.hp = hp;
        enemy.maxHp = hp;
        enemy.displayObject.displayObject.x = enemy.x;
        enemy.displayObject.displayObject.y = enemy.y;
        this.enemies.push(enemy);
        this.gameArea.addChild(enemy.displayObject);
      }
    }

    this.enemyDirection = 1;
    this.enemyDropAmount = 0;
  }

  private createGameObject(width: number, height: number, color: number, type = 'bullet'): GameObject {
    const panel = new Box({
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
      type,
      hp: 1,
      maxHp: 1,
    };
  }

  private updatePlayer(deltaMs: number, keys: Record<string, boolean>): void {
    let speed = 0.4;

    if (this.hasSpeedBoost) {
      speed *= 1.8;
    }

    if (keys[Keys.ArrowLeft] || keys['KeyA']) {
      this.player.x = Math.max(0, this.player.x - speed * deltaMs);
    }
    if (keys[Keys.ArrowRight] || keys['KeyD']) {
      this.player.x = Math.min(this.viewportWidth - this.player.width, this.player.x + speed * deltaMs);
    }

    this.player.displayObject.displayObject.x = this.player.x;
    this.player.displayObject.displayObject.y = this.player.y;

    const keysPressed = this.keyboard.keysPressed.get();
    if (keysPressed[Keys.Space] && Date.now() - this.lastShot > (this.hasTripleShot ? 150 : 250)) {
      this.lastShot = Date.now();
      this.fireBullet();
    }
  }

  private fireBullet(): void {
    if (this.hasTripleShot) {
      const bullet1 = this.createGameObject(4, 12, 0x00ffaa);
      bullet1.x = this.player.x + this.player.width / 2 - 2;
      bullet1.y = this.player.y - 12;
      bullet1.vy = -0.9;
      bullet1.displayObject.displayObject.x = bullet1.x;
      bullet1.displayObject.displayObject.y = bullet1.y;
      this.bullets.push(bullet1);
      this.gameArea.addChild(bullet1.displayObject);

      const bullet2 = this.createGameObject(4, 12, 0x00ffaa);
      bullet2.x = this.player.x - 10;
      bullet2.y = this.player.y;
      bullet2.vx = -0.2;
      bullet2.vy = -0.8;
      bullet2.displayObject.displayObject.x = bullet2.x;
      bullet2.displayObject.displayObject.y = bullet2.y;
      this.bullets.push(bullet2);
      this.gameArea.addChild(bullet2.displayObject);

      const bullet3 = this.createGameObject(4, 12, 0x00ffaa);
      bullet3.x = this.player.x + this.player.width + 6;
      bullet3.y = this.player.y;
      bullet3.vx = 0.2;
      bullet3.vy = -0.8;
      bullet3.displayObject.displayObject.x = bullet3.x;
      bullet3.displayObject.displayObject.y = bullet3.y;
      this.bullets.push(bullet3);
      this.gameArea.addChild(bullet3.displayObject);
    } else {
      const bullet = this.createGameObject(4, 12, 0x00ffaa);
      bullet.x = this.player.x + this.player.width / 2 - 2;
      bullet.y = this.player.y - 12;
      bullet.vy = -0.9;
      bullet.displayObject.displayObject.x = bullet.x;
      bullet.displayObject.displayObject.y = bullet.y;
      this.bullets.push(bullet);
      this.gameArea.addChild(bullet.displayObject);
    }
  }

  private fireEnemyBullet(enemy: GameObject): void {
    const bullet = this.createGameObject(4, 12, enemy.type === 'tank' ? 0xff00ff : 0xff4444);
    bullet.x = enemy.x + enemy.width / 2 - 2;
    bullet.y = enemy.y + enemy.height;
    bullet.vy = 0.25 + this.level * 0.05;
    bullet.displayObject.displayObject.x = bullet.x;
    bullet.displayObject.displayObject.y = bullet.y;
    this.enemyBullets.push(bullet);
    this.gameArea.addChild(bullet.displayObject);
  }

  private updateBullets(deltaMs: number): void {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.x += bullet.vx * deltaMs;
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
      this.level++;
      this.score += 1000 * this.level;
      this.enemySpeed += 0.2;
      this.updateLabels();
      this.emitScore();
      this.spawnEnemies();
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
      this.enemyDropAmount = 12;
    } else if (leftMost <= 10 && this.enemyDirection < 0) {
      this.enemyDirection = 1;
      this.enemyDropAmount = 12;
    }

    for (const enemy of this.enemies) {
      enemy.x += enemy.vx * this.enemyDirection * deltaMs * 0.05;
      enemy.y += this.enemyDropAmount;
      enemy.displayObject.displayObject.x = enemy.x;
      enemy.displayObject.displayObject.y = enemy.y;

      if (enemy.y > this.player.y - 20) {
        this.loseLife();
        return;
      }

      const fireRate = enemy.type === 'tank' ? 0.0002 : enemy.type === 'soldier' ? 0.0004 : 0.0006;
      if (Math.random() < fireRate * deltaMs * (1 + this.level * 0.1)) {
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

          enemy.hp = (enemy.hp || 1) - 1;

          if (enemy.hp !== undefined && enemy.hp <= 0) {
            this.createExplosion(
              enemy.x + enemy.width / 2,
              enemy.y + enemy.height / 2,
              enemy.type === 'tank' ? 0xff00ff : enemy.type === 'soldier' ? 0xffaa00 : 0xff4444,
            );
            this.screenShake = 8;

            let points = 10;
            if (enemy.type === 'tank') points = 30;
            else if (enemy.type === 'soldier') points = 20;

            this.combo++;
            this.comboTimer = 2000;
            const multiplier = Math.min(Math.floor(this.combo / 5) + 1, 5);
            this.score += points * multiplier;

            if (Math.random() < 0.15) {
              this.spawnPowerUp(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            }

            this.gameArea.removeChild(enemy.displayObject);
            this.enemies.splice(j, 1);
          }

          this.updateLabels();
          this.emitScore();
          break;
        }
      }
    }

    for (const bullet of this.enemyBullets) {
      if (this.rectIntersect(bullet, this.player)) {
        if (this.hasShield) {
          this.createExplosion(bullet.x, bullet.y, 0x00aaff);
          this.gameArea.removeChild(bullet.displayObject);
          const idx = this.enemyBullets.indexOf(bullet);
          if (idx > -1) this.enemyBullets.splice(idx, 1);
        } else {
          this.loseLife();
        }
        break;
      }
    }

    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      if (this.rectIntersect(powerUp, this.player)) {
        this.activatePowerUp(powerUp.type);
        this.createExplosion(powerUp.x, powerUp.y, 0x00ff00);
        this.gameArea.removeChild(powerUp.displayObject);
        this.powerUps.splice(i, 1);
      }
    }
  }

  private rectIntersect(a: GameObject | PowerUp, b: GameObject): boolean {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  private createExplosion(x: number, y: number, color: number): void {
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 0.1 + Math.random() * 0.15;
      const particle: Particle = {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 500,
        maxLife: 500,
        displayObject: new Box({
          backgroundColor: color,
          height: 3 + Math.random() * 3,
          width: 3 + Math.random() * 3,
        }),
        color,
      };
      this.particles.push(particle);
      this.gameArea.addChild(particle.displayObject);
    }
  }

  private updateParticles(deltaMs: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.x += particle.vx * deltaMs;
      particle.y += particle.vy * deltaMs;
      particle.life -= deltaMs;

      const alpha = particle.life / particle.maxLife;
      particle.displayObject.displayObject.alpha = alpha;
      particle.displayObject.displayObject.x = particle.x;
      particle.displayObject.displayObject.y = particle.y;

      if (particle.life <= 0) {
        this.gameArea.removeChild(particle.displayObject);
        this.particles.splice(i, 1);
      }
    }
  }

  private spawnPowerUp(x: number, y: number): void {
    const types: PowerUp['type'][] = ['shield', 'triple-shot', 'speed', 'bomb'];
    const type = types[Math.floor(Math.random() * types.length)];

    let color = 0x00aaff;
    if (type === 'shield') color = 0x00aaff;
    else if (type === 'triple-shot') color = 0xffaa00;
    else if (type === 'speed') color = 0xffff00;
    else if (type === 'bomb') color = 0xff00ff;

    const powerUp: PowerUp = {
      x,
      y,
      width: 20,
      height: 20,
      displayObject: new Box({
        backgroundColor: color,
        height: 20,
        width: 20,
      }),
      type,
      vy: 0.08,
    };
    powerUp.displayObject.displayObject.x = powerUp.x;
    powerUp.displayObject.displayObject.y = powerUp.y;

    this.powerUps.push(powerUp);
    this.gameArea.addChild(powerUp.displayObject);
  }

  private updatePowerUps(deltaMs: number): void {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.y += powerUp.vy * deltaMs;
      powerUp.displayObject.displayObject.x = powerUp.x;
      powerUp.displayObject.displayObject.y = powerUp.y;

      if (powerUp.y > this.viewportHeight + 20) {
        this.gameArea.removeChild(powerUp.displayObject);
        this.powerUps.splice(i, 1);
      }
    }
  }

  private activatePowerUp(type: PowerUp['type']): void {
    if (type === 'shield') {
      this.hasShield = true;
      this.shieldTimer = 8000;
    } else if (type === 'triple-shot') {
      this.hasTripleShot = true;
      this.tripleShotTimer = 10000;
    } else if (type === 'speed') {
      this.hasSpeedBoost = true;
      this.speedTimer = 8000;
    } else if (type === 'bomb') {
      this.useSmartBomb();
    }

    this.score += 50;
    this.updateLabels();
    this.emitScore();
  }

  private useSmartBomb(): void {
    const rowY = this.player.y - 100;
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (Math.abs(enemy.y - rowY) < 50) {
        this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 0xff00ff);
        this.screenShake = 12;
        this.score += 20 * (this.combo + 1);
        this.gameArea.removeChild(enemy.displayObject);
        this.enemies.splice(i, 1);
      }
    }
  }

  private updatePowerUpTimers(deltaMs: number): void {
    if (this.hasShield) {
      this.shieldTimer -= deltaMs;
      if (this.shieldTimer <= 0) {
        this.hasShield = false;
      }
    }

    if (this.hasTripleShot) {
      this.tripleShotTimer -= deltaMs;
      if (this.tripleShotTimer <= 0) {
        this.hasTripleShot = false;
      }
    }

    if (this.hasSpeedBoost) {
      this.speedTimer -= deltaMs;
      if (this.speedTimer <= 0) {
        this.hasSpeedBoost = false;
      }
    }
  }

  private updateScreenShake(deltaMs: number): void {
    if (this.screenShake > 0) {
      this.screenShake -= deltaMs * 0.05;
      if (this.screenShake < 0) this.screenShake = 0;
    }
  }

  private updateCombo(deltaMs: number): void {
    if (this.comboTimer > 0) {
      this.comboTimer -= deltaMs;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.updateLabels();
      }
    }
  }

  private loseLife(): void {
    this.lives--;
    this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, 0xff4444);
    this.screenShake = 15;
    this.combo = 0;
    this.updateLabels();

    if (this.lives <= 0) {
      this.gameOver = true;
      this.saveHighScore();
      void this.getContext().scenes.goTo('game-over');
    } else {
      for (const bullet of this.enemyBullets) {
        this.gameArea.removeChild(bullet.displayObject);
      }
      this.enemyBullets = [];

      this.player.x = this.viewportWidth / 2 - 20;
      this.player.y = this.viewportHeight - 80;
    }
  }

  private resetGame(): void {
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.combo = 0;
    this.gameOver = false;
    this.paused = false;
    this.enemySpeed = 0.8;
    this.hasShield = false;
    this.hasTripleShot = false;
    this.hasSpeedBoost = false;
    this.pauseLabel.displayObject.visible = false;
    this.continueButton.displayObject.visible = false;
    this.restartButton.displayObject.visible = false;
    this.updateLabels();
    this.initGame();
    this.emitScore();
  }

  private updateLabels(): void {
    this.scoreLabel.setText(`SCORE: ${this.score.toLocaleString()}`);
    this.levelLabel.setText(`LEVEL: ${this.level}`);

    let livesStr = 'LIVES:';
    for (let i = 0; i < this.lives; i++) livesStr += ' ♥';
    this.livesLabel.setText(livesStr);

    if (this.combo > 1) {
      const multiplier = Math.min(Math.floor(this.combo / 5) + 1, 5);
      this.comboLabel.setText(`COMBO x${multiplier} (${this.combo})`);
    } else {
      this.comboLabel.setText('');
    }

    this.positionHud();
  }

  private positionHud(): void {
    const topPadding = 16;
    const leftPadding = 20;
    const rightPadding = 20;
    const hudWidth = this.viewportWidth - leftPadding - rightPadding;

    this.scoreLabel.displayObject.x = leftPadding;
    this.scoreLabel.displayObject.y = topPadding;

    this.levelLabel.displayObject.x = leftPadding + 260;
    this.levelLabel.displayObject.y = topPadding;

    this.comboLabel.displayObject.x = leftPadding + 500;
    this.comboLabel.displayObject.y = topPadding + 4;

    this.livesLabel.displayObject.x = Math.max(
      leftPadding + 680,
      leftPadding + hudWidth - this.livesLabel.displayObject.width,
    );
    this.livesLabel.displayObject.y = topPadding + 2;
  }

  private emitScore(): void {
    const context = this.getContext();
    context.events.emit('game.score', { score: this.score, level: this.level });
  }

  private saveHighScore(): void {
    try {
      const saved = localStorage.getItem('spaceInvadersHighScore');
      const currentHigh = saved ? parseInt(saved, 10) : 0;
      if (this.score > currentHigh) {
        localStorage.setItem('spaceInvadersHighScore', this.score.toString());
      }
    } catch {
      // localStorage not available
    }
  }
}
