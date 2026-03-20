import type {
  BoxNodeProps,
  ButtonNodeProps,
  ContainerNodeProps,
  PixoraChild,
  PixoraNode,
  ScrollBoxNodeProps,
  SpriteNodeProps,
  TextNodeProps,
} from './types';

// ---------------------------------------------------------------------------
// Node factory helpers
// ---------------------------------------------------------------------------

/**
 * Creates a declarative container node.
 */
export function container(props: ContainerNodeProps = {}, ...children: PixoraChild[]): PixoraNode<'container'> {
  return Object.freeze({
    children: Object.freeze(children),
    key: undefined,
    props,
    type: 'container' as const,
  });
}

/**
 * Creates a declarative container node with an explicit key for reconciliation.
 */
export function keyedContainer(
  key: string | number,
  props: ContainerNodeProps = {},
  ...children: PixoraChild[]
): PixoraNode<'container'> {
  return Object.freeze({
    children: Object.freeze(children),
    key,
    props,
    type: 'container' as const,
  });
}

/**
 * Creates a declarative text node.
 */
export function text(props: TextNodeProps): PixoraNode<'text'> {
  return Object.freeze({
    children: Object.freeze([]),
    key: undefined,
    props,
    type: 'text' as const,
  });
}

/**
 * Creates a declarative sprite node.
 */
export function sprite(props: SpriteNodeProps = {}): PixoraNode<'sprite'> {
  return Object.freeze({
    children: Object.freeze([]),
    key: undefined,
    props,
    type: 'sprite' as const,
  });
}

/**
 * Creates a declarative box node.
 */
export function box(props: BoxNodeProps = {}, ...children: PixoraChild[]): PixoraNode<'box'> {
  return Object.freeze({
    children: Object.freeze(children),
    key: undefined,
    props,
    type: 'box' as const,
  });
}

/**
 * Creates a declarative button node.
 */
export function button(props: ButtonNodeProps): PixoraNode<'button'> {
  return Object.freeze({
    children: Object.freeze([]),
    key: undefined,
    props,
    type: 'button' as const,
  });
}

/**
 * Creates a declarative scroll box node.
 */
export function scrollBox(props: ScrollBoxNodeProps = {}, ...children: PixoraChild[]): PixoraNode<'scroll-box'> {
  return Object.freeze({
    children: Object.freeze(children),
    key: undefined,
    props,
    type: 'scroll-box' as const,
  });
}
