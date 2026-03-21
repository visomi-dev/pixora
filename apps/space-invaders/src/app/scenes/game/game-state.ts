import type { GameObject, PowerUp } from './game.types';

import { clearKeyboardFrame, Keys, signal } from 'pixora';
import type { ApplicationContext, KeyboardState } from 'pixora';

export const scoreSignal = signal(0);
export const levelSignal = signal(1);
export const livesSignal = signal(3);
export const comboSignal = signal(0);
export const comboTimerSignal = signal(0);
export const pausedSignal = signal(false);
export const gameOverSignal = signal(false);
export const viewportWidthSignal = signal(1280);
export const viewportHeightSignal = signal(720);
export const playerSignal = signal<GameObject | null>(null);
export const bulletsSignal = signal<GameObject[]>([]);
export const enemyBulletsSignal = signal<GameObject[]>([]);
export const enemiesSignal = signal<GameObject[]>([]);
export const powerUpsSignal = signal<PowerUp[]>([]);
export const hasShieldSignal = signal(false);
export const hasTripleShotSignal = signal(false);
export const hasSpeedBoostSignal = signal(false);
export const shieldTimerSignal = signal(0);
export const tripleShotTimerSignal = signal(0);
export const speedTimerSignal = signal(0);
export const enemyDirectionSignal = signal(1);
export const enemyDropAmountSignal = signal(0);
export const enemySpeedSignal = signal(0.8);
export const lastShotSignal = signal(0);
export const initializedSignal = signal(false);

let gameId = 0;

function createGameObject(width: number, height: number, type = 'bullet'): GameObject {
  return { id: ++gameId, x: 0, y: 0, width, height, vx: 0, vy: 0, type, hp: 1, maxHp: 1 };
}

export function syncViewport(width: number, height: number): void {
  viewportWidthSignal.set(width);
  viewportHeightSignal.set(height);
}

export function initGame(): void {
  const width = viewportWidthSignal.get();
  const height = viewportHeightSignal.get();

  playerSignal.set({
    id: ++gameId,
    x: width / 2 - 20,
    y: height - 80,
    width: 40,
    height: 30,
    vx: 0,
    vy: 0,
    type: 'player',
    hp: 1,
    maxHp: 1,
  });

  bulletsSignal.set([]);
  enemyBulletsSignal.set([]);
  powerUpsSignal.set([]);
  spawnEnemies();
}

export function emitScore(context: ApplicationContext): void {
  context.events.emit('game.score', { level: levelSignal.get(), score: scoreSignal.get() });
}

export function updateGame(deltaMs: number, context: ApplicationContext, keyboard: KeyboardState | null): void {
  if (context.scenes.getActiveSceneKey() !== 'game') {
    return;
  }

  if (gameOverSignal.get() || pausedSignal.get() || !keyboard) {
    emitScore(context);
    return;
  }

  const keys = keyboard.keys.get();
  const keysPressed = keyboard.keysPressed.get();
  const player = playerSignal.get();
  const width = viewportWidthSignal.get();
  const height = viewportHeightSignal.get();

  if (keysPressed['KeyP'] || keysPressed['Escape']) {
    pausedSignal.set(true);
    clearKeyboardFrame();
    emitScore(context);

    return;
  }

  if (player) {
    const speed = hasSpeedBoostSignal.get() ? 0.72 : 0.4;

    if (keys[Keys.ArrowLeft] || keys['KeyA']) {
      player.x = Math.max(0, player.x - speed * deltaMs);
    }

    if (keys[Keys.ArrowRight] || keys['KeyD']) {
      player.x = Math.min(width - player.width, player.x + speed * deltaMs);
    }

    playerSignal.set({ ...player });

    if (keysPressed[Keys.Space] && Date.now() - lastShotSignal.get() > (hasTripleShotSignal.get() ? 150 : 250)) {
      const bullets = [...bulletsSignal.get()];
      const bullet = createGameObject(4, 12);
      bullet.x = player.x + player.width / 2 - 2;
      bullet.y = player.y - 12;
      bullet.vy = -0.9;
      bullets.push(bullet);
      bulletsSignal.set(bullets);
      lastShotSignal.set(Date.now());
    }
  }

  const bullets = bulletsSignal
    .get()
    .map((bullet) => {
      bullet.x += bullet.vx * deltaMs;
      bullet.y += bullet.vy * deltaMs;

      return bullet;
    })
    .filter((bullet) => bullet.y > -20);
  bulletsSignal.set(bullets);

  const enemyBullets = enemyBulletsSignal
    .get()
    .map((bullet) => {
      bullet.y += bullet.vy * deltaMs;

      return bullet;
    })
    .filter((bullet) => bullet.y < height + 20);
  enemyBulletsSignal.set(enemyBullets);

  updateEnemies(deltaMs);
  checkCollisions();
  updatePowerUps(deltaMs);
  updatePowerUpTimers(deltaMs);

  if (comboTimerSignal.get() > 0) {
    comboTimerSignal.set(comboTimerSignal.get() - deltaMs);

    if (comboTimerSignal.get() <= 0) {
      comboSignal.set(0);
    }
  }

  clearKeyboardFrame();
  emitScore(context);
}

export function resetGame(): void {
  scoreSignal.set(0);
  levelSignal.set(1);
  livesSignal.set(3);
  comboSignal.set(0);
  comboTimerSignal.set(0);
  gameOverSignal.set(false);
  pausedSignal.set(false);
  enemySpeedSignal.set(0.8);
  hasShieldSignal.set(false);
  hasTripleShotSignal.set(false);
  hasSpeedBoostSignal.set(false);
  shieldTimerSignal.set(0);
  tripleShotTimerSignal.set(0);
  speedTimerSignal.set(0);
  lastShotSignal.set(0);
  initGame();
}

function spawnEnemies(): void {
  const width = viewportWidthSignal.get();
  const level = levelSignal.get();
  const speed = enemySpeedSignal.get();
  const rows = 3 + Math.min(level - 1, 3);
  const cols = 5 + Math.min(level - 1, 3);
  const enemyWidth = 35;
  const enemyHeight = 25;
  const padding = 15;
  const offsetX = (width - cols * (enemyWidth + padding)) / 2;
  const offsetY = 60;
  const enemies: GameObject[] = [];

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < cols; column++) {
      let type = 'scout';
      let hp = 1;

      if (level >= 2 && row === 0) {
        type = 'tank';
        hp = 3;
      } else if (level >= 3 && row <= 1 && column % 2 === 0) {
        type = 'soldier';
        hp = 2;
      }

      const enemy = createGameObject(enemyWidth, enemyHeight, type);
      enemy.x = offsetX + column * (enemyWidth + padding);
      enemy.y = offsetY + row * (enemyHeight + padding);
      enemy.vx = speed;
      enemy.hp = hp;
      enemy.maxHp = hp;
      enemies.push(enemy);
    }
  }

  enemiesSignal.set(enemies);
  enemyDirectionSignal.set(1);
  enemyDropAmountSignal.set(0);
}

function rectIntersect(a: GameObject, b: GameObject): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function updateEnemies(deltaMs: number): void {
  const enemies = [...enemiesSignal.get()];
  const width = viewportWidthSignal.get();
  const player = playerSignal.get();

  if (enemies.length === 0) {
    levelSignal.set(levelSignal.get() + 1);
    scoreSignal.set(scoreSignal.get() + 1000 * levelSignal.get());
    enemySpeedSignal.set(enemySpeedSignal.get() + 0.2);
    spawnEnemies();

    return;
  }

  let leftMost = width;
  let rightMost = 0;

  for (const enemy of enemies) {
    leftMost = Math.min(leftMost, enemy.x);
    rightMost = Math.max(rightMost, enemy.x + enemy.width);
  }

  const direction = enemyDirectionSignal.get();

  if (rightMost >= width - 10 && direction > 0) {
    enemyDirectionSignal.set(-1);
    enemyDropAmountSignal.set(12);
  } else if (leftMost <= 10 && direction < 0) {
    enemyDirectionSignal.set(1);
    enemyDropAmountSignal.set(12);
  }

  const drop = enemyDropAmountSignal.get();
  const nextDirection = enemyDirectionSignal.get();
  let bulletsFired = false;
  const enemyBullets = [...enemyBulletsSignal.get()];
  const level = levelSignal.get();

  for (const enemy of enemies) {
    enemy.x += enemy.vx * nextDirection * deltaMs * 0.05;
    enemy.y += drop;

    if (Math.random() < 0.0001 * deltaMs * Math.min(level, 5)) {
      const bullet = createGameObject(4, 12, enemy.type === 'tank' ? 'tank' : 'enemy-bullet');
      bullet.x = enemy.x + enemy.width / 2 - 2;
      bullet.y = enemy.y + enemy.height;
      bullet.vy = 0.4 + Math.min(level, 5) * 0.05;
      enemyBullets.push(bullet);
      bulletsFired = true;
    }
  }

  enemiesSignal.set(enemies);
  enemyDropAmountSignal.set(0);

  if (bulletsFired) {
    enemyBulletsSignal.set(enemyBullets);
  }

  if (player && enemies.some((enemy) => enemy.y > player.y - 20)) {
    loseLife();
  }
}

function checkCollisions(): void {
  const bullets = [...bulletsSignal.get()];
  const enemies = [...enemiesSignal.get()];
  const enemyBullets = enemyBulletsSignal.get();
  const player = playerSignal.get();
  const powerUps = [...powerUpsSignal.get()];

  for (let bulletIndex = bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
    const bullet = bullets[bulletIndex];

    for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
      const enemy = enemies[enemyIndex];

      if (rectIntersect(bullet, enemy)) {
        bullets.splice(bulletIndex, 1);
        enemy.hp--;

        if (enemy.hp <= 0) {
          enemies.splice(enemyIndex, 1);
          comboSignal.set(comboSignal.get() + 1);
          comboTimerSignal.set(2000);

          const multiplier = Math.min(Math.floor(comboSignal.get() / 5) + 1, 5);
          const points = enemy.type === 'tank' ? 30 : enemy.type === 'soldier' ? 20 : 10;
          scoreSignal.set(scoreSignal.get() + points * multiplier);

          if (Math.random() < 0.15) {
            spawnPowerUp(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
          }
        }

        break;
      }
    }
  }

  for (const bullet of enemyBullets) {
    if (player && rectIntersect(bullet, player)) {
      if (hasShieldSignal.get()) {
        hasShieldSignal.set(false);
      } else {
        loseLife();
      }

      break;
    }
  }

  for (let powerUpIndex = powerUps.length - 1; powerUpIndex >= 0; powerUpIndex--) {
    const powerUp = powerUps[powerUpIndex];

    if (player && rectIntersect({ ...powerUp, hp: 1, maxHp: 1, type: '', vx: 0, vy: 0 }, player)) {
      activatePowerUp(powerUp.type);
      powerUps.splice(powerUpIndex, 1);
    }
  }

  bulletsSignal.set(bullets);
  enemiesSignal.set(enemies);
  powerUpsSignal.set(powerUps);
}

function spawnPowerUp(x: number, y: number): void {
  const types: PowerUp['type'][] = ['shield', 'triple-shot', 'speed', 'bomb'];
  const type = types[Math.floor(Math.random() * types.length)];
  const powerUp: PowerUp = { id: ++gameId, x, y, width: 20, height: 20, type, vy: 0.08 };
  powerUpsSignal.set([...powerUpsSignal.get(), powerUp]);
}

function updatePowerUps(deltaMs: number): void {
  const powerUps = powerUpsSignal
    .get()
    .map((powerUp) => {
      powerUp.y += powerUp.vy * deltaMs;

      return powerUp;
    })
    .filter((powerUp) => powerUp.y < viewportHeightSignal.get() + 20);
  powerUpsSignal.set(powerUps);
}

function activatePowerUp(type: PowerUp['type']): void {
  if (type === 'shield') {
    hasShieldSignal.set(true);
    shieldTimerSignal.set(8000);
  } else if (type === 'triple-shot') {
    hasTripleShotSignal.set(true);
    tripleShotTimerSignal.set(10000);
  } else if (type === 'speed') {
    hasSpeedBoostSignal.set(true);
    speedTimerSignal.set(8000);
  }

  scoreSignal.set(scoreSignal.get() + 50);
}

function updatePowerUpTimers(deltaMs: number): void {
  if (hasShieldSignal.get()) {
    shieldTimerSignal.set(shieldTimerSignal.get() - deltaMs);

    if (shieldTimerSignal.get() <= 0) {
      hasShieldSignal.set(false);
    }
  }

  if (hasTripleShotSignal.get()) {
    tripleShotTimerSignal.set(tripleShotTimerSignal.get() - deltaMs);

    if (tripleShotTimerSignal.get() <= 0) {
      hasTripleShotSignal.set(false);
    }
  }

  if (hasSpeedBoostSignal.get()) {
    speedTimerSignal.set(speedTimerSignal.get() - deltaMs);

    if (speedTimerSignal.get() <= 0) {
      hasSpeedBoostSignal.set(false);
    }
  }
}

function loseLife(): void {
  livesSignal.set(livesSignal.get() - 1);
  comboSignal.set(0);

  if (livesSignal.get() <= 0) {
    gameOverSignal.set(true);

    return;
  }

  const player = playerSignal.get();

  if (player) {
    player.x = viewportWidthSignal.get() / 2 - 20;
    player.y = viewportHeightSignal.get() - 80;
    playerSignal.set({ ...player });
  }

  enemyBulletsSignal.set([]);
}
