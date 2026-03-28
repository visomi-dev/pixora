import { pixora } from 'pixora';

import { getMenuMetrics } from '../layout';

import { mainMenuScene } from './main-menu-scene';

import type { ApplicationContext, PixoraNode, Viewport } from 'pixora';

function createContext(viewport: Viewport): ApplicationContext {
  return {
    app: {} as ApplicationContext['app'],
    assets: {} as ApplicationContext['assets'],
    events: {} as ApplicationContext['events'],
    scenes: {} as ApplicationContext['scenes'],
    services: {} as ApplicationContext['services'],
    viewport: { get: () => viewport },
  } as ApplicationContext;
}

describe('mainMenuScene', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the main menu layout and button configuration', () => {
    const viewport: Viewport = {
      aspectRatio: 16 / 9,
      height: 720,
      orientation: 'landscape',
      width: 1280,
    };
    const textureSpy = vi
      .spyOn(pixora, 'texture')
      .mockImplementation((src) => ({ label: src }) as unknown as ReturnType<typeof pixora.texture>);
    const buttonSpy = vi.spyOn(pixora, 'button').mockImplementation((props) => {
      return pixora.container({
        key: props.key,
        style: props.style,
        children: [pixora.text({ content: props.text.content })],
      }) as unknown as ReturnType<typeof pixora.button>;
    });

    const tree = mainMenuScene.render(createContext(viewport));
    const metrics = getMenuMetrics(viewport);

    expect(mainMenuScene.key).toBe('main-menu');
    expect(tree.type).toBe('container');
    expect((tree as PixoraNode<'container'>).props.style).toEqual(
      expect.objectContaining({
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        height: 720,
        justifyContent: 'center',
        padding: metrics.padding,
        width: 1280,
      }),
    );

    const children = tree.children as PixoraNode[];

    expect(children).toHaveLength(2);
    expect((children[0] as PixoraNode<'container'>).props.style).toEqual(
      expect.objectContaining({
        backgroundColor: 0xffeef4,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: metrics.contentWidth,
      }),
    );

    const introChildren = (children[0] as PixoraNode<'container'>).children as PixoraNode[];

    expect((introChildren[0] as PixoraNode<'text'>).props.content).toBe('Catfe Express');
    expect((introChildren[1] as PixoraNode<'text'>).props.content).toBe(
      'A cozy train ride full of cats, coffee, and tiny decisions.',
    );

    expect(textureSpy).toHaveBeenCalledWith('buttonPressed');
    expect(textureSpy).toHaveBeenCalledWith('buttonDefault');
    expect(buttonSpy).toHaveBeenCalledTimes(1);
    expect(buttonSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        animation: { durationMs: 100, hoverScale: 1, pressedScale: 1 },
        key: 'play-button',
        label: 'PlayButton',
        style: expect.objectContaining({ width: metrics.buttonWidth, height: metrics.buttonHeight }),
        text: expect.objectContaining({ content: 'Play' }),
      }),
    );
  });

  it('uses a flex content container and keeps button sizing stable across viewports', () => {
    const viewport: Viewport = {
      aspectRatio: 9 / 16,
      height: 844,
      orientation: 'portrait',
      width: 390,
    };
    const buttonSpy = vi.spyOn(pixora, 'button').mockImplementation((props) => {
      return pixora.container({ key: props.key }) as unknown as ReturnType<typeof pixora.button>;
    });
    vi.spyOn(pixora, 'texture').mockImplementation(
      (src) => ({ label: src }) as unknown as ReturnType<typeof pixora.texture>,
    );

    const tree = mainMenuScene.render(createContext(viewport));
    const metrics = getMenuMetrics(viewport);

    expect((tree as PixoraNode<'container'>).props.style).toEqual(
      expect.objectContaining({
        display: 'flex',
        height: 844,
        width: 390,
      }),
    );

    expect(buttonSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        style: expect.objectContaining({ width: metrics.buttonWidth, height: metrics.buttonHeight }),
      }),
    );
  });
});
