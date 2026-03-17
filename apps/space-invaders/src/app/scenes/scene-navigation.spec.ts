import { gameOverScene } from './game-over/game-over.scene';
import { gameScene } from './game/game.scene';
import { instructionsScene } from './instructions/instructions.scene';
import { mainMenuScene } from './main-menu/main-menu.scene';
import { victoryScene } from './victory/victory.scene';

import { isPixoraNode, type ApplicationContext, type ButtonNodeProps, type PixoraNode, type Viewport } from 'pixora';

function createContext() {
  const goTo = vi.fn();
  const viewport: Viewport = {
    aspectRatio: 16 / 9,
    height: 720,
    orientation: 'landscape',
    width: 1280,
  };

  const context = {
    scenes: { goTo },
    viewport: { get: () => viewport },
  } as unknown as ApplicationContext;

  return { context, goTo };
}

function visitNode(node: PixoraNode, visitor: (node: PixoraNode) => void): void {
  visitor(node);

  for (const child of node.children) {
    visitChild(child, visitor);
  }
}

function visitChild(child: unknown, visitor: (node: PixoraNode) => void): void {
  if (Array.isArray(child)) {
    for (const nestedChild of child) {
      visitChild(nestedChild, visitor);
    }
    return;
  }

  if (isPixoraNode(child)) {
    visitNode(child, visitor);
  }
}

function getButton(tree: PixoraNode, label: string): ButtonNodeProps {
  let buttonProps: ButtonNodeProps | undefined;

  visitNode(tree, (node) => {
    if (node.type === 'button') {
      const buttonNode = node as PixoraNode<'button'>;
      if (buttonNode.props.label === label) {
        buttonProps = buttonNode.props;
      }
    }
  });

  expect(buttonProps).toBeDefined();

  return buttonProps!;
}

function getTextContent(tree: PixoraNode): string[] {
  const textContent: string[] = [];

  visitNode(tree, (node) => {
    if (node.type === 'text') {
      textContent.push((node as PixoraNode<'text'>).props.text);
    }
  });

  return textContent;
}

describe('space invaders scene navigation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('routes from the main menu to gameplay and instructions', () => {
    localStorage.setItem('spaceInvadersHighScore', '4200');

    const { context, goTo } = createContext();
    const tree = mainMenuScene.render(context);

    getButton(tree, 'START GAME').onPointerTap?.(undefined as never);
    getButton(tree, 'INSTRUCTIONS').onPointerTap?.(undefined as never);

    expect(mainMenuScene.key).toBe('main-menu');
    expect(goTo).toHaveBeenNthCalledWith(1, 'game');
    expect(goTo).toHaveBeenNthCalledWith(2, 'instructions');
    expect(getTextContent(tree)).toContain('GALACTIC DEFENSE v2.0 | HIGH SCORE: 4,200');
  });

  it('routes back to the main menu from instructions', () => {
    const { context, goTo } = createContext();
    const tree = instructionsScene.render(context);

    getButton(tree, 'BACK').onPointerTap?.(undefined as never);

    expect(instructionsScene.key).toBe('instructions');
    expect(goTo).toHaveBeenCalledWith('main-menu');
  });

  it('uses a stable gameplay scene key', () => {
    expect(gameScene.key).toBe('game');
  });

  it('routes from end screens back into gameplay or the main menu', () => {
    localStorage.setItem('spaceInvadersHighScore', '18000');

    const gameOver = createContext();
    const gameOverTree = gameOverScene.render(gameOver.context);

    getButton(gameOverTree, 'PLAY AGAIN').onPointerTap?.(undefined as never);
    getButton(gameOverTree, 'MAIN MENU').onPointerTap?.(undefined as never);

    expect(gameOverScene.key).toBe('game-over');
    expect(gameOver.goTo).toHaveBeenNthCalledWith(1, 'game');
    expect(gameOver.goTo).toHaveBeenNthCalledWith(2, 'main-menu');
    expect(getTextContent(gameOverTree)).toContain('HIGH SCORE: 18,000');

    const victory = createContext();
    const victoryTree = victoryScene.render(victory.context);

    getButton(victoryTree, 'PLAY AGAIN').onPointerTap?.(undefined as never);
    getButton(victoryTree, 'MAIN MENU').onPointerTap?.(undefined as never);

    expect(victoryScene.key).toBe('victory');
    expect(victory.goTo).toHaveBeenNthCalledWith(1, 'game');
    expect(victory.goTo).toHaveBeenNthCalledWith(2, 'main-menu');
  });
});
