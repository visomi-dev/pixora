// @vitest-environment jsdom

import { Texture } from 'pixi.js';

import { SpriteNode } from '../components/sprite-node';
import { TextNode } from '../components/text-node';

import { button } from './button';
import { withApplicationContext } from './current-context';

import type { ApplicationContext } from '../app/types';
import type { ContainerNode } from '../components/container-node';
import type { ImperativeNodeProps } from './types';

function createMockContext(): ApplicationContext {
  return {
    app: {} as ApplicationContext['app'],
    assets: {} as ApplicationContext['assets'],
    events: {} as ApplicationContext['events'],
    mount: {
      getBoundingClientRect: () => ({ width: 800, height: 600, x: 0, y: 0, left: 0, top: 0, right: 800, bottom: 600 }),
    } as unknown as HTMLElement,
    scenes: {} as ApplicationContext['scenes'],
    services: {} as ApplicationContext['services'],
    viewport: {
      get: () => ({ width: 800, height: 600, aspectRatio: 4 / 3, orientation: 'landscape' as const }),
    } as ApplicationContext['viewport'],
  } as ApplicationContext;
}

function createTexture(label: string): Texture {
  return Object.assign(Texture.EMPTY, { label }) as Texture;
}

function getIslandRoot(node: ReturnType<typeof button>): ContainerNode {
  return (node.props as ImperativeNodeProps).node as ContainerNode;
}

const originalGetContext = HTMLCanvasElement.prototype.getContext;

describe('button', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    globalThis.CanvasRenderingContext2D = class CanvasRenderingContext2D {} as typeof CanvasRenderingContext2D;
    HTMLCanvasElement.prototype.getContext = (() => {
      return {
        font: '',
        measureText: (text: string) => ({
          actualBoundingBoxAscent: 10,
          actualBoundingBoxDescent: 4,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxRight: text.length * 8,
          width: text.length * 8,
        }),
      } as CanvasRenderingContext2D;
    }) as unknown as HTMLCanvasElement['getContext'];
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    vi.useRealTimers();
  });

  it('creates a composed button with default sizing and label styling', () => {
    const idle = createTexture('idle');
    const context = createMockContext();

    const node = withApplicationContext(context, () =>
      button({
        key: 'cta',
        label: 'PrimaryButton',
        onPointerTap: vi.fn(),
        text: { content: 'Play' },
        textures: { idle },
      }),
    );

    const root = getIslandRoot(node);
    const [background, label] = root.getChildren();

    expect(node.key).toBe('cta');
    expect(root.displayObject.label).toBe('PrimaryButton');
    expect(root.layoutStyles).toEqual(
      expect.objectContaining({ cursor: 'pointer', opacity: 1, width: 280, height: 72 }),
    );
    expect(background).toBeInstanceOf(SpriteNode);
    expect((background as SpriteNode).displayObject.label).toBe('PrimaryButton.Background');
    expect((background as SpriteNode).displayObject.texture).toBe(idle);
    expect(label).toBeInstanceOf(TextNode);
    expect((label as TextNode).displayObject.label).toBe('PrimaryButton.Text');
    expect((label as TextNode).displayObject.text).toBe('Play');
    expect((label as TextNode).displayObject.style.fontFamily).toBe('Fredoka, sans-serif');
  });

  it('uses disabled state styling and texture fallback', () => {
    const idle = createTexture('idle');
    const disabled = createTexture('disabled');
    const context = createMockContext();

    const node = withApplicationContext(context, () =>
      button({
        disabled: true,
        label: 'DisabledButton',
        text: {
          content: 'Options',
          style: { color: '#123456', fontFamily: 'Nunito, sans-serif', fontSize: 20, fontWeight: '800' },
        },
        onPointerTap: vi.fn(),
        style: { height: 80, opacity: 0.5, width: 320 },
        textures: { disabled, idle },
      }),
    );

    const root = getIslandRoot(node);
    const [background, label] = root.getChildren();

    expect(root.layoutStyles).toEqual(expect.objectContaining({ width: 320, height: 80 }));
    expect(root.displayObject.cursor).toBe('default');
    expect(root.displayObject.eventMode).toBe('none');
    expect((background as SpriteNode).displayObject.texture).toBe(disabled);
    expect((label as TextNode).displayObject.style.fill).toBe('#8e7866');
    expect((label as TextNode).displayObject.style.fontFamily).toBe('Nunito, sans-serif');
  });

  it('reacts to hover, press, and tap events', () => {
    const idle = createTexture('idle');
    const hovered = createTexture('hovered');
    const pressed = createTexture('pressed');
    const onPointerDown = vi.fn();
    const onPointerOut = vi.fn();
    const onPointerOver = vi.fn();
    const onPointerTap = vi.fn();
    const onPointerUp = vi.fn();
    const context = createMockContext();

    const node = withApplicationContext(context, () =>
      button({
        animation: { durationMs: 50, easing: 'linear' },
        text: { content: 'Play' },
        onPointerDown,
        onPointerOut,
        onPointerOver,
        onPointerTap,
        onPointerUp,
        textures: { hovered, idle, pressed },
      }),
    );

    const root = getIslandRoot(node);
    const [background, label] = root.getChildren();

    root.displayObject.emit('pointerover', {} as never);
    vi.advanceTimersByTime(60);
    expect(onPointerOver).toHaveBeenCalledTimes(1);
    expect((background as SpriteNode).displayObject.texture).toBe(hovered);
    expect((label as TextNode).displayObject.style.fill).toBe('#362519');

    root.displayObject.emit('pointerdown', {} as never);
    vi.advanceTimersByTime(60);
    expect(onPointerDown).toHaveBeenCalledTimes(1);
    expect((background as SpriteNode).displayObject.texture).toBe(pressed);

    root.displayObject.emit('pointerup', {} as never);
    vi.advanceTimersByTime(60);
    expect(onPointerTap).toHaveBeenCalledTimes(1);
    expect(onPointerUp).toHaveBeenCalledTimes(1);
    expect((background as SpriteNode).displayObject.texture).toBe(hovered);

    root.displayObject.emit('pointerout', {} as never);
    vi.advanceTimersByTime(60);
    expect(onPointerOut).toHaveBeenCalledTimes(1);
    expect((background as SpriteNode).displayObject.texture).toBe(idle);
  });

  it('throws when used outside an active application context', () => {
    expect(() =>
      button({
        text: { content: 'Invalid' },
        onPointerTap: vi.fn(),
        textures: { idle: createTexture('idle') },
      }),
    ).toThrow('Pixora composed components can only be created while rendering a scene or reactive subtree.');
  });
});
