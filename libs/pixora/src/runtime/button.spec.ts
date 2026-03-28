// @vitest-environment jsdom

import { Sprite, Texture } from 'pixi.js';
import { ButtonContainer } from '@pixi/ui';

import { BaseNode } from '../components/base-node';

import { button } from './button';
import { withApplicationContext } from './current-context';

import type { ApplicationContext } from '../app/types';
import type { ContainerNode } from '../components/container-node';
import type { ImperativeNodeProps } from './types';

type DisplayNode = {
  children?: DisplayNode[];
  label?: string | null;
  style?: { fill?: string; fontFamily?: string };
  text?: string;
};

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

function findByLabel(node: DisplayNode, label: string): DisplayNode | undefined {
  if (node.label === label) {
    return node;
  }

  for (const child of node.children ?? []) {
    const match = findByLabel(child, label);

    if (match) {
      return match;
    }
  }

  return undefined;
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
    const [widgetNode] = root.getChildren() as BaseNode<ButtonContainer>[];
    const widget = widgetNode.displayObject;
    const tree = widget as unknown as DisplayNode;
    const background = findByLabel(tree, 'PrimaryButton.Background');
    const label = findByLabel(tree, 'PrimaryButton.Text');

    expect(node.key).toBe('cta');
    expect(root.displayObject.label).toBe('PrimaryButton');
    expect(root.layoutStyles).toEqual(
      expect.objectContaining({ cursor: 'pointer', opacity: 1, width: 280, height: 72 }),
    );
    expect(widgetNode).toBeInstanceOf(BaseNode);
    expect(widget).toBeInstanceOf(ButtonContainer);
    expect(widget.label).toBe('PrimaryButton.Widget');
    expect(background?.label).toBe('PrimaryButton.Background');
    expect(label?.label).toBe('PrimaryButton.Text');
    expect(label?.text).toBe('Play');
    expect(label?.style?.fontFamily).toBe('Fredoka, sans-serif');
  });

  it('supports parent-controlled text offsets', () => {
    const idle = createTexture('idle');
    const context = createMockContext();

    const node = withApplicationContext(context, () =>
      button({
        text: { content: 'Play', offset: { y: -4 } },
        textures: { idle },
      }),
    );

    const root = getIslandRoot(node);
    const [widgetNode] = root.getChildren() as BaseNode<ButtonContainer>[];
    const label = findByLabel(widgetNode.displayObject as unknown as DisplayNode, 'Button.Text') as {
      y?: number;
    };

    expect(label.y).toBe(32);
  });

  it('supports background-color buttons without sprite textures', () => {
    const context = createMockContext();

    const node = withApplicationContext(context, () =>
      button({
        backgroundColor: {
          hovered: 0x336699,
          idle: 0x224466,
          pressed: 0x112233,
        },
        label: 'ColorButton',
        text: { content: 'Launch' },
      }),
    );

    const root = getIslandRoot(node);
    const [widgetNode] = root.getChildren() as BaseNode<ButtonContainer>[];
    const widget = widgetNode.displayObject;
    const background = findByLabel(widget as unknown as DisplayNode, 'ColorButton.Background') as Sprite;

    expect(background.texture).toBe(Texture.WHITE);
    expect(background.tint).toBe(0x224466);

    (widget.button as never as { processOver: (event?: unknown) => void }).processOver({});
    vi.advanceTimersByTime(60);
    expect(background.tint).toBe(0x336699);

    (widget.button as never as { processDown: (event?: unknown) => void }).processDown({});
    vi.advanceTimersByTime(60);
    expect(background.tint).toBe(0x112233);
  });

  it('supports per-button hover and press scale configuration', () => {
    const idle = createTexture('idle');
    const context = createMockContext();

    const node = withApplicationContext(context, () =>
      button({
        animation: { durationMs: 50, hoverScale: 1.04, pressedScale: 0.97 },
        text: { content: 'Play' },
        textures: { idle },
      }),
    );

    const root = getIslandRoot(node);
    const [widgetNode] = root.getChildren() as BaseNode<ButtonContainer>[];
    const widget = widgetNode.displayObject;

    (widget.button as never as { processOver: (event?: unknown) => void }).processOver({});
    vi.advanceTimersByTime(60);
    expect(widget.scale.x).toBeCloseTo(1.04, 1);

    (widget.button as never as { processDown: (event?: unknown) => void }).processDown({});
    vi.advanceTimersByTime(60);
    expect(widget.scale.x).toBeCloseTo(0.97, 1);
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
    const [widgetNode] = root.getChildren() as BaseNode<ButtonContainer>[];
    const widget = widgetNode.displayObject;
    const label = findByLabel(widget as unknown as DisplayNode, 'DisabledButton.Text');

    expect(root.layoutStyles).toEqual(expect.objectContaining({ width: 320, height: 80 }));
    expect(root.displayObject.cursor).toBe('default');
    expect(widget.enabled).toBe(false);
    expect(label?.style?.fill).toBe('#8e7866');
    expect(label?.style?.fontFamily).toBe('Nunito, sans-serif');
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
    const [widgetNode] = root.getChildren() as BaseNode<ButtonContainer>[];
    const widget = widgetNode.displayObject;
    const getLabel = () => findByLabel(widget as unknown as DisplayNode, 'Button.Text');

    (widget.button as never as { processOver: (event?: unknown) => void }).processOver({});
    vi.advanceTimersByTime(60);
    expect(onPointerOver).toHaveBeenCalledTimes(1);
    expect(getLabel()?.style?.fill).toBe('#362519');

    (widget.button as never as { processDown: (event?: unknown) => void }).processDown({});
    vi.advanceTimersByTime(60);
    expect(onPointerDown).toHaveBeenCalledTimes(1);

    (widget.button as never as { processPress: (event?: unknown) => void }).processPress({});
    (widget.button as never as { processUp: (event?: unknown) => void }).processUp({});
    vi.advanceTimersByTime(60);
    expect(onPointerTap).toHaveBeenCalledTimes(1);
    expect(onPointerUp).toHaveBeenCalledTimes(1);

    (widget.button as never as { processOut: (event?: unknown) => void }).processOut({});
    vi.advanceTimersByTime(60);
    expect(onPointerOut).toHaveBeenCalledTimes(1);
    expect(getLabel()?.style?.fill).toBe('#4a3728');
  });

  it('throws when used outside an active application context', () => {
    expect(() =>
      button({
        backgroundColor: 0x224466,
        text: { content: 'Invalid' },
        onPointerTap: vi.fn(),
      }),
    ).toThrow('Pixora composed components can only be created while rendering a scene or reactive subtree.');
  });
});
