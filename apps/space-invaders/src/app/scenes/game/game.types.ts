export type GameObject = {
  height: number;
  hp: number;
  id: number;
  maxHp: number;
  type: string;
  vx: number;
  vy: number;
  width: number;
  x: number;
  y: number;
};

export type PowerUp = {
  height: number;
  id: number;
  type: 'shield' | 'triple-shot' | 'speed' | 'bomb';
  vy: number;
  width: number;
  x: number;
  y: number;
};

export function getEnemyColor(type: string): number {
  if (type === 'tank') {
    return 0xff00ff;
  }

  if (type === 'soldier') {
    return 0xffaa00;
  }

  return 0xff4444;
}

export function getEnemyBulletColor(type: string): number {
  return type === 'tank' ? 0xff00ff : 0xff4444;
}

export function getPowerUpColor(type: PowerUp['type']): number {
  if (type === 'shield') {
    return 0x00aaff;
  }

  if (type === 'triple-shot') {
    return 0xffaa00;
  }

  if (type === 'speed') {
    return 0xffff00;
  }

  return 0xff00ff;
}
