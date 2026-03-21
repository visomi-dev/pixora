import type {
  BoxNodeProps,
  ButtonNodeProps,
  ContainerNodeProps,
  HostType,
  PixoraChild,
  PixoraNode,
  ScrollBoxNodeProps,
  SpriteNodeProps,
  TextNodeProps,
} from './types';

function createNode<T extends HostType>(
  type: T,
  props: BoxNodeProps | ButtonNodeProps | ContainerNodeProps | ScrollBoxNodeProps | SpriteNodeProps | TextNodeProps,
  key: string | number | undefined,
  ...children: PixoraChild[]
): PixoraNode<T> {
  return Object.freeze({
    children: Object.freeze(children),
    key,
    props,
    type,
  }) as PixoraNode<T>;
}

// ---------------------------------------------------------------------------
// Node factory helpers
// ---------------------------------------------------------------------------

/**
 * Creates a declarative container node.
 */
export function container(props: ContainerNodeProps = {}, ...children: PixoraChild[]): PixoraNode<'container'> {
  return createNode('container', props, undefined, ...children);
}

/**
 * Creates a declarative container node with an explicit key for reconciliation.
 */
export function keyedContainer(
  key: string | number,
  props: ContainerNodeProps = {},
  ...children: PixoraChild[]
): PixoraNode<'container'> {
  return createNode('container', props, key, ...children);
}

export function keyedBox(
  key: string | number,
  props: BoxNodeProps = {},
  ...children: PixoraChild[]
): PixoraNode<'box'> {
  return createNode('box', props, key, ...children);
}

export function keyedSprite(key: string | number, props: SpriteNodeProps = {}): PixoraNode<'sprite'> {
  return createNode('sprite', props, key);
}

export function keyedText(key: string | number, props: TextNodeProps): PixoraNode<'text'> {
  return createNode('text', props, key);
}

/**
 * Creates a declarative text node.
 */
export function text(props: TextNodeProps): PixoraNode<'text'> {
  return createNode('text', props, undefined);
}

/**
 * Creates a declarative sprite node.
 */
export function sprite(props: SpriteNodeProps = {}): PixoraNode<'sprite'> {
  return createNode('sprite', props, undefined);
}

/**
 * Creates a declarative box node.
 */
export function box(props: BoxNodeProps = {}, ...children: PixoraChild[]): PixoraNode<'box'> {
  return createNode('box', props, undefined, ...children);
}

/**
 * Creates a declarative button node.
 */
export function button(props: ButtonNodeProps): PixoraNode<'button'> {
  return createNode('button', props, undefined);
}

/**
 * Creates a declarative scroll box node.
 */
export function scrollBox(props: ScrollBoxNodeProps = {}, ...children: PixoraChild[]): PixoraNode<'scroll-box'> {
  return createNode('scroll-box', props, undefined, ...children);
}
