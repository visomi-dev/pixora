import { ContainerNode, effect, pixora } from 'pixora';

import { bulletsSignal, enemiesSignal, enemyBulletsSignal, playerSignal, powerUpsSignal } from './game-state';
import { getEnemyBulletColor, getEnemyColor, getPowerUpColor } from './game.types';

import type { GameObject, PowerUp } from './game.types';
import type { ApplicationContext, PixoraNode } from 'pixora';

const inPlayNodes = new WeakMap<ApplicationContext, PixoraNode>();

export function inPlay(context: ApplicationContext): PixoraNode {
  const existing = inPlayNodes.get(context);

  if (existing) {
    return existing;
  }

  const node = pixora.island({
    context,
    key: 'in-play',
    setup: ({ root }) => {
      const playerLayer = new ContainerNode();
      const bulletLayer = new ContainerNode();
      const enemyBulletLayer = new ContainerNode();
      const enemyLayer = new ContainerNode();
      const powerUpLayer = new ContainerNode();

      root.addChild(playerLayer);
      root.addChild(bulletLayer);
      root.addChild(enemyBulletLayer);
      root.addChild(enemyLayer);
      root.addChild(powerUpLayer);

      let playerNode: ContainerNode | null = null;
      const bulletNodes = new Map<number, ContainerNode>();
      const enemyBulletNodes = new Map<number, ContainerNode>();
      const enemyNodes = new Map<number, ContainerNode>();
      const powerUpNodes = new Map<number, ContainerNode>();

      root.addDisposable(
        effect(() => {
          const player = playerSignal.get();

          if (!player) {
            if (playerNode) {
              playerLayer.removeChild(playerNode);
              playerNode.destroy();
              playerNode = null;
            }

            return;
          }

          if (!playerNode) {
            playerNode = new ContainerNode();
            playerLayer.addChild(playerNode);
          }

          syncBox(playerNode, player, 0x00ffaa);
        }),
      );

      root.addDisposable(
        effect(() => {
          syncCollection(bulletsSignal.get(), bulletNodes, bulletLayer, 'bullets', () => 0x00ffaa);
        }),
      );

      root.addDisposable(
        effect(() => {
          syncCollection(enemyBulletsSignal.get(), enemyBulletNodes, enemyBulletLayer, 'enemy bullets', (bullet) =>
            getEnemyBulletColor(bullet.type),
          );
        }),
      );

      root.addDisposable(
        effect(() => {
          syncCollection(enemiesSignal.get(), enemyNodes, enemyLayer, 'enemies', (enemy) => getEnemyColor(enemy.type));
        }),
      );

      root.addDisposable(
        effect(() => {
          syncCollection(powerUpsSignal.get(), powerUpNodes, powerUpLayer, 'power-ups', (powerUp) =>
            getPowerUpColor(powerUp.type),
          );
        }),
      );
    },
  });

  inPlayNodes.set(context, node);

  return node;
}

function assertUniqueIds(items: readonly { id: number }[], collectionName: string): void {
  const ids = new Set<number>();

  for (const item of items) {
    if (ids.has(item.id)) {
      throw new Error(`InPlay ${collectionName} contains duplicate id "${item.id}".`);
    }

    ids.add(item.id);
  }
}

function syncBox(
  node: ContainerNode,
  item: { height: number; width: number; x: number; y: number },
  backgroundColor: number,
): void {
  node.updateProps({ style: { backgroundColor } });
  node.setLayoutSize(item.width, item.height);
  node.setLayoutPosition(item.x, item.y);
}

function syncCollection<T extends GameObject | PowerUp>(
  items: readonly T[],
  nodes: Map<number, ContainerNode>,
  layer: ContainerNode,
  collectionName: string,
  getColor: (item: T) => number,
): void {
  assertUniqueIds(items, collectionName);

  const activeIds = new Set<number>();

  for (const item of items) {
    activeIds.add(item.id);

    let node = nodes.get(item.id);

    if (!node) {
      node = new ContainerNode();
      nodes.set(item.id, node);
      layer.addChild(node);
    }

    syncBox(node, item, getColor(item));
  }

  for (const [id, node] of nodes) {
    if (activeIds.has(id)) {
      continue;
    }

    layer.removeChild(node);
    node.destroy();
    nodes.delete(id);
  }
}
