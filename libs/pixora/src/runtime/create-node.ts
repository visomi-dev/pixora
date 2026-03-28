import type { ContainerNodeProps, HostType, PixoraChild, PixoraNode, SpriteNodeProps, TextNodeProps } from './types';

type CreationProps = ContainerNodeProps | SpriteNodeProps | TextNodeProps;

function createNode<T extends HostType>(type: T, props: CreationProps): PixoraNode<T> {
  const { children = [], key, ...nodeProps } = props;

  return Object.freeze({
    children: Object.freeze(children) as readonly PixoraChild[],
    key,
    props: Object.freeze(nodeProps),
    type,
  }) as PixoraNode<T>;
}

export function container(props: ContainerNodeProps = {}): PixoraNode<'container'> {
  return createNode('container', props);
}

export function text(props: TextNodeProps): PixoraNode<'text'> {
  return createNode('text', props);
}

export function sprite(props: SpriteNodeProps = {}): PixoraNode<'sprite'> {
  return createNode('sprite', props);
}
