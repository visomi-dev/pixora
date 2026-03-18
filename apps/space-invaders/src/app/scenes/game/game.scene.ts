import { centeredTextX, rightAlignedTextX } from '../scene-positioning';

import { api as pixora, signal, createKeyboardInput, clearKeyboardFrame, Keys } from 'pixora';
import type { ApplicationContext } from 'pixora';

type GameObject = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  type: string;
  hp: number;
  maxHp: number;
};

type PowerUp = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'shield' | 'triple-shot' | 'speed' | 'bomb';
  vy: number;
};

const scoreSignal = signal(0);
const levelSignal = signal(1);
const livesSignal = signal(3);
const comboSignal = signal(0);
const comboTimerSignal = signal(0);
const pausedSignal = signal(false);
const gameOverSignal = signal(false);
const viewportWidthSignal = signal(1280);
const viewportHeightSignal = signal(720);
const playerSignal = signal<GameObject | null>(null);
const bulletsSignal = signal<GameObject[]>([]);
const enemyBulletsSignal = signal<GameObject[]>([]);
const enemiesSignal = signal<GameObject[]>([]);
const powerUpsSignal = signal<PowerUp[]>([]);
const hasShieldSignal = signal(false);
const hasTripleShotSignal = signal(false);
const hasSpeedBoostSignal = signal(false);
const shieldTimerSignal = signal(0);
const tripleShotTimerSignal = signal(0);
const speedTimerSignal = signal(0);
const enemyDirectionSignal = signal(1);
const enemyDropAmountSignal = signal(0);
const enemySpeedSignal = signal(0.8);
const lastShotSignal = signal(0);
const initializedSignal = signal(false);

let gameId = 0;
let keyboard: ReturnType<typeof createKeyboardInput> | null = null;
let tickerCallback: (() => void) | null = null;

function createGameObject(width: number, height: number, _color: number, type = 'bullet'): GameObject {
  return { id: ++gameId, x: 0, y: 0, width, height, vx: 0, vy: 0, type, hp: 1, maxHp: 1 };
}

function initGame(): void {
  const w = viewportWidthSignal.get();
  const h = viewportHeightSignal.get();

  playerSignal.set({
    id: ++gameId,
    x: w / 2 - 20,
    y: h - 80,
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

function spawnEnemies(): void {
  const w = viewportWidthSignal.get();
  const lvl = levelSignal.get();
  const spd = enemySpeedSignal.get();

  const rows = 3 + Math.min(lvl - 1, 3);
  const cols = 5 + Math.min(lvl - 1, 3);
  const bw = 35,
    bh = 25,
    pad = 15;
  const offX = (w - cols * (bw + pad)) / 2;
  const offY = 60;

  const enemies: GameObject[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let color = 0xff4444,
        etype = 'scout',
        hp = 1;
      if (lvl >= 2 && r === 0) {
        color = 0xff00ff;
        etype = 'tank';
        hp = 3;
      } else if (lvl >= 3 && r <= 1 && c % 2 === 0) {
        color = 0xffaa00;
        etype = 'soldier';
        hp = 2;
      }

      const e = createGameObject(bw, bh, color, etype);
      e.x = offX + c * (bw + pad);
      e.y = offY + r * (bh + pad);
      e.vx = spd;
      e.hp = hp;
      e.maxHp = hp;
      enemies.push(e);
    }
  }
  enemiesSignal.set(enemies);
  enemyDirectionSignal.set(1);
  enemyDropAmountSignal.set(0);
}

function rectIntersect(a: GameObject, b: GameObject): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function update(deltaMs: number): void {
  if (gameOverSignal.get() || pausedSignal.get() || !keyboard) return;

  const keys = keyboard.keys.get();
  const keysPressed = keyboard.keysPressed.get();
  const player = playerSignal.get();
  const w = viewportWidthSignal.get();
  const h = viewportHeightSignal.get();

  if (keysPressed['KeyP'] || keysPressed['Escape']) {
    pausedSignal.set(true);
    clearKeyboardFrame();
    return;
  }

  if (player) {
    const speed = hasSpeedBoostSignal.get() ? 0.72 : 0.4;
    if (keys[Keys.ArrowLeft] || keys['KeyA']) player.x = Math.max(0, player.x - speed * deltaMs);
    if (keys[Keys.ArrowRight] || keys['KeyD']) player.x = Math.min(w - player.width, player.x + speed * deltaMs);
    playerSignal.set({ ...player });

    if (keysPressed[Keys.Space] && Date.now() - lastShotSignal.get() > (hasTripleShotSignal.get() ? 150 : 250)) {
      const bullets = [...bulletsSignal.get()];
      const b = createGameObject(4, 12, 0x00ffaa);
      b.x = player.x + player.width / 2 - 2;
      b.y = player.y - 12;
      b.vy = -0.9;
      bullets.push(b);
      bulletsSignal.set(bullets);
      lastShotSignal.set(Date.now());
    }
  }

  const bullets = bulletsSignal
    .get()
    .map((b: GameObject) => {
      b.x += b.vx * deltaMs;
      b.y += b.vy * deltaMs;
      return b;
    })
    .filter((b: GameObject) => b.y > -20);
  bulletsSignal.set(bullets);

  const enemyBullets = enemyBulletsSignal
    .get()
    .map((b: GameObject) => {
      b.y += b.vy * deltaMs;
      return b;
    })
    .filter((b: GameObject) => b.y < h + 20);
  enemyBulletsSignal.set(enemyBullets);

  updateEnemies(deltaMs);
  checkCollisions();
  updatePowerUps(deltaMs);
  updatePowerUpTimers(deltaMs);

  if (comboTimerSignal.get() > 0) {
    comboTimerSignal.set(comboTimerSignal.get() - deltaMs);
    if (comboTimerSignal.get() <= 0) comboSignal.set(0);
  }

  clearKeyboardFrame();
}

function updateEnemies(deltaMs: number): void {
  const enemies = [...enemiesSignal.get()];
  const w = viewportWidthSignal.get();
  const player = playerSignal.get();

  if (enemies.length === 0) {
    levelSignal.set(levelSignal.get() + 1);
    scoreSignal.set(scoreSignal.get() + 1000 * levelSignal.get());
    enemySpeedSignal.set(enemySpeedSignal.get() + 0.2);
    spawnEnemies();
    return;
  }

  let leftMost = w,
    rightMost = 0;
  for (const e of enemies) {
    leftMost = Math.min(leftMost, e.x);
    rightMost = Math.max(rightMost, e.x + e.width);
  }

  const dir = enemyDirectionSignal.get();
  if (rightMost >= w - 10 && dir > 0) {
    enemyDirectionSignal.set(-1);
    enemyDropAmountSignal.set(12);
  } else if (leftMost <= 10 && dir < 0) {
    enemyDirectionSignal.set(1);
    enemyDropAmountSignal.set(12);
  }

  const drop = enemyDropAmountSignal.get();
  const direction = enemyDirectionSignal.get();

  for (const e of enemies) {
    e.x += e.vx * direction * deltaMs * 0.05;
    e.y += drop;
  }
  enemiesSignal.set(enemies);
  enemyDropAmountSignal.set(0);

  if (player && enemies.some((e: GameObject) => e.y > player.y - 20)) loseLife();
}

function checkCollisions(): void {
  const bullets = [...bulletsSignal.get()];
  const enemies = [...enemiesSignal.get()];
  const enemyBullets = enemyBulletsSignal.get();
  const player = playerSignal.get();
  const powerUps = [...powerUpsSignal.get()];

  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      if (rectIntersect(b, e)) {
        bullets.splice(i, 1);
        e.hp--;
        if (e.hp <= 0) {
          enemies.splice(j, 1);
          comboSignal.set(comboSignal.get() + 1);
          comboTimerSignal.set(2000);
          const mult = Math.min(Math.floor(comboSignal.get() / 5) + 1, 5);
          const pts = e.type === 'tank' ? 30 : e.type === 'soldier' ? 20 : 10;
          scoreSignal.set(scoreSignal.get() + pts * mult);
          if (Math.random() < 0.15) spawnPowerUp(e.x + e.width / 2, e.y + e.height / 2);
        }
        break;
      }
    }
  }

  for (const b of enemyBullets) {
    if (player && rectIntersect(b, player)) {
      if (hasShieldSignal.get()) hasShieldSignal.set(false);
      else loseLife();
      break;
    }
  }

  for (let i = powerUps.length - 1; i >= 0; i--) {
    const pu = powerUps[i];
    if (player && rectIntersect({ ...pu, vx: 0, vy: 0, type: '', hp: 1, maxHp: 1 }, player)) {
      activatePowerUp(pu.type);
      powerUps.splice(i, 1);
    }
  }

  bulletsSignal.set(bullets);
  enemiesSignal.set(enemies);
  powerUpsSignal.set(powerUps);
}

function spawnPowerUp(x: number, y: number): void {
  const types: PowerUp['type'][] = ['shield', 'triple-shot', 'speed', 'bomb'];
  const type = types[Math.floor(Math.random() * types.length)];
  const pu: PowerUp = { id: ++gameId, x, y, width: 20, height: 20, type, vy: 0.08 };
  powerUpsSignal.set([...powerUpsSignal.get(), pu]);
}

function updatePowerUps(deltaMs: number): void {
  const powerUps = powerUpsSignal
    .get()
    .map((pu: PowerUp) => {
      pu.y += pu.vy * deltaMs;
      return pu;
    })
    .filter((pu: PowerUp) => pu.y < viewportHeightSignal.get() + 20);
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
    if (shieldTimerSignal.get() <= 0) hasShieldSignal.set(false);
  }
  if (hasTripleShotSignal.get()) {
    tripleShotTimerSignal.set(tripleShotTimerSignal.get() - deltaMs);
    if (tripleShotTimerSignal.get() <= 0) hasTripleShotSignal.set(false);
  }
  if (hasSpeedBoostSignal.get()) {
    speedTimerSignal.set(speedTimerSignal.get() - deltaMs);
    if (speedTimerSignal.get() <= 0) hasSpeedBoostSignal.set(false);
  }
}

function loseLife(): void {
  livesSignal.set(livesSignal.get() - 1);
  comboSignal.set(0);
  if (livesSignal.get() <= 0) {
    gameOverSignal.set(true);
  } else {
    const player = playerSignal.get();
    if (player) {
      player.x = viewportWidthSignal.get() / 2 - 20;
      player.y = viewportHeightSignal.get() - 80;
      playerSignal.set({ ...player });
    }
    enemyBulletsSignal.set([]);
  }
}

export function resetGame(): void {
  scoreSignal.set(0);
  levelSignal.set(1);
  livesSignal.set(3);
  comboSignal.set(0);
  gameOverSignal.set(false);
  pausedSignal.set(false);
  enemySpeedSignal.set(0.8);
  hasShieldSignal.set(false);
  hasTripleShotSignal.set(false);
  hasSpeedBoostSignal.set(false);
  initGame();
}

export const gameScene = pixora.scene({
  key: 'game',
  render: (context: ApplicationContext) => {
    const viewport = context.viewport.get();
    viewportWidthSignal.set(viewport.width);
    viewportHeightSignal.set(viewport.height);

    if (!initializedSignal.get()) {
      keyboard = createKeyboardInput();
      initGame();
      initializedSignal.set(true);

      tickerCallback = () => update(context.app.ticker.deltaMS);
      context.app.ticker.add(tickerCallback as never);
    }

    context.events.emit('game.score', { score: scoreSignal.get(), level: levelSignal.get() });

    const score = scoreSignal.get();
    const level = levelSignal.get();
    const lives = livesSignal.get();
    const combo = comboSignal.get();
    const paused = pausedSignal.get();
    const gameOver = gameOverSignal.get();
    const player = playerSignal.get();
    const bullets = bulletsSignal.get();
    const enemyBullets = enemyBulletsSignal.get();
    const enemies = enemiesSignal.get();
    const powerUps = powerUpsSignal.get();

    const scoreText = `SCORE: ${score.toLocaleString()}`;
    const levelText = `LEVEL: ${level}`;
    const livesStr = 'LIVES:' + ' ♥'.repeat(lives);
    const comboText = combo > 1 ? `COMBO x${Math.min(Math.floor(combo / 5) + 1, 5)} (${combo})` : '';
    const comboX = centeredTextX(viewport.width, comboText, 16, 0.56);
    const levelX = centeredTextX(viewport.width, levelText, 20, 0.56);
    const livesX = rightAlignedTextX(viewport.width, livesStr, 18, 20, 0.58);

    return pixora.container(
      { x: 0, y: 0 },
      pixora.box({ backgroundColor: 0x0a0a1a, height: viewport.height, width: viewport.width, x: 0, y: 0 }),
      pixora.container(
        { x: 0, y: 0 },
        pixora.text({
          style: { fill: '#00ffaa', fontFamily: 'Orbitron, monospace', fontSize: 20, fontWeight: 'bold' },
          text: scoreText,
          x: 20,
          y: 16,
        }),
        pixora.text({
          style: { fill: '#ff00aa', fontFamily: 'Orbitron, monospace', fontSize: 20, fontWeight: 'bold' },
          text: levelText,
          x: levelX,
          y: 16,
        }),
        pixora.text({
          style: { fill: '#ffff00', fontFamily: 'Orbitron, monospace', fontSize: 16, fontWeight: 'bold' },
          text: comboText,
          x: comboX,
          y: 20,
        }),
        pixora.text({
          style: { fill: '#ff6644', fontFamily: 'Orbitron, monospace', fontSize: 18 },
          text: livesStr,
          x: livesX,
          y: 18,
        }),
      ),
      paused
        ? pixora.container(
            { x: 0, y: 0 },
            pixora.text({
              style: { fill: '#ffffff', fontFamily: 'Orbitron, monospace', fontSize: 48, fontWeight: 'bold' },
              text: 'PAUSED',
              x: viewport.width / 2,
              y: viewport.height / 2 - 40,
            }),
            pixora.button({
              backgroundColor: 0x00ffaa,
              height: 48,
              label: 'CONTINUE',
              onPointerTap: () => pausedSignal.set(false),
              width: 200,
              x: viewport.width / 2 - 100,
              y: viewport.height / 2 + 40,
            }),
            pixora.button({
              backgroundColor: 0xff6644,
              height: 48,
              label: 'RESTART',
              onPointerTap: () => resetGame(),
              width: 200,
              x: viewport.width / 2 - 100,
              y: viewport.height / 2 + 100,
            }),
          )
        : null,
      gameOver
        ? pixora.container(
            { x: 0, y: 0 },
            pixora.text({
              style: { fill: '#ff4444', fontFamily: 'Orbitron, sans-serif', fontSize: 72, fontWeight: '900' },
              text: 'GAME OVER',
              x: viewport.width / 2,
              y: viewport.height / 2 - 100,
            }),
            pixora.button({
              backgroundColor: 0x00ffaa,
              height: 56,
              label: 'PLAY AGAIN',
              onPointerTap: () => resetGame(),
              width: 280,
              x: viewport.width / 2 - 140,
              y: viewport.height / 2 + 50,
            }),
            pixora.button({
              backgroundColor: 0x666688,
              height: 48,
              label: 'MAIN MENU',
              onPointerTap: () => {
                resetGame();
                void context.scenes.goTo('main-menu');
              },
              width: 280,
              x: viewport.width / 2 - 140,
              y: viewport.height / 2 + 120,
            }),
          )
        : null,
      player
        ? pixora.box({ backgroundColor: 0x00ffaa, height: player.height, width: player.width, x: player.x, y: player.y })
        : null,
      ...bullets.map((b: GameObject) =>
        pixora.box({ backgroundColor: 0x00ffaa, height: b.height, width: b.width, x: b.x, y: b.y }),
      ),
      ...enemyBullets.map((b: GameObject) =>
        pixora.box({
          backgroundColor: b.type === 'tank' ? 0xff00ff : 0xff4444,
          height: b.height,
          width: b.width,
          x: b.x,
          y: b.y,
        }),
      ),
      ...enemies.map((e: GameObject) =>
        pixora.box({
          backgroundColor: e.type === 'tank' ? 0xff00ff : e.type === 'soldier' ? 0xffaa00 : 0xff4444,
          height: e.height,
          width: e.width,
          x: e.x,
          y: e.y,
        }),
      ),
      ...powerUps.map((pu: PowerUp) => {
        const color =
          pu.type === 'shield'
            ? 0x00aaff
            : pu.type === 'triple-shot'
              ? 0xffaa00
              : pu.type === 'speed'
                ? 0xffff00
                : 0xff00ff;
        return pixora.box({ backgroundColor: color, height: pu.height, width: pu.width, x: pu.x, y: pu.y });
      }),
    );
  },
});
