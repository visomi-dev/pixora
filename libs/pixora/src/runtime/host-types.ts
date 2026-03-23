import { ContainerNode } from '../components/container-node';
import { SpriteNode } from '../components/sprite-node';
import { TextNode } from '../components/text-node';

import { bindInteractive } from './interaction';

import type { Container } from 'pixi.js';
import type { BaseNode } from '../components/base-node';
import type { HostPropsMap, HostType, InteractiveNodeProps, SpriteNodeProps, TextNodeProps } from './types';

export type HostTypeDescriptor<T extends HostType = HostType> = {
  create(props: HostPropsMap[T]): BaseNode;
  patch(node: BaseNode, previous: HostPropsMap[T], next: HostPropsMap[T]): void;
};

export type HostTypeRegistry = {
  readonly [K in HostType]: HostTypeDescriptor<K>;
};

function applyInteractiveProps(displayObject: Container, props: InteractiveNodeProps): void {
  if (props.onPointerDown || props.onPointerOut || props.onPointerOver || props.onPointerTap || props.onPointerUp) {
    bindInteractive(displayObject, {
      onPointerDown: props.onPointerDown,
      onPointerOut: props.onPointerOut,
      onPointerOver: props.onPointerOver,
      onPointerTap: props.onPointerTap,
      onPointerUp: props.onPointerUp,
    });
  } else {
    displayObject.eventMode = 'passive';
    displayObject.cursor = 'default';
  }
}

function applyStyleCursor(displayObject: Container, cursor: string | undefined): void {
  if (cursor) {
    displayObject.cursor = cursor;
  }
}

function applyLabel(displayObject: Container, label: string | undefined): void {
  if (label !== undefined) {
    displayObject.label = label;
  }
}

function createContainerDescriptor(): HostTypeDescriptor<'container'> {
  return {
    create(props) {
      const node = new ContainerNode({ style: props.style });
      node.layout = props.style ?? null;
      applyInteractiveProps(node.displayObject, props);
      applyStyleCursor(node.displayObject, props.style?.cursor);
      applyLabel(node.displayObject, props.label);

      return node;
    },
    patch(node, _previous, next) {
      (node as ContainerNode).updateProps({ style: next.style });
      node.layout = next.style ?? null;
      applyInteractiveProps(node.displayObject, next);
      applyStyleCursor(node.displayObject, next.style?.cursor);
      applyLabel(node.displayObject, next.label);
    },
  };
}

function createTextDescriptor(): HostTypeDescriptor<'text'> {
  return {
    create(props: TextNodeProps) {
      const node = new TextNode({ content: props.content, style: props.style });
      node.layout = props.style ?? null;

      if (props.anchor !== undefined) {
        if (typeof props.anchor === 'number') {
          node.displayObject.anchor.set(props.anchor);
        } else {
          node.displayObject.anchor.set(props.anchor.x, props.anchor.y);
        }
      }

      applyInteractiveProps(node.displayObject, props);
      applyStyleCursor(node.displayObject, props.style?.cursor);
      applyLabel(node.displayObject, props.label);

      return node;
    },
    patch(node, _previous, next: TextNodeProps) {
      (node as TextNode).updateProps({ content: next.content, style: next.style });
      node.layout = next.style ?? null;

      if (next.anchor !== undefined) {
        if (typeof next.anchor === 'number') {
          (node as TextNode).displayObject.anchor.set(next.anchor);
        } else {
          (node as TextNode).displayObject.anchor.set(next.anchor.x, next.anchor.y);
        }
      }

      applyInteractiveProps(node.displayObject, next);
      applyStyleCursor(node.displayObject, next.style?.cursor);
      applyLabel(node.displayObject, next.label);
    },
  };
}

function createSpriteDescriptor(): HostTypeDescriptor<'sprite'> {
  return {
    create(props: SpriteNodeProps) {
      const node = new SpriteNode({ asset: props.asset, style: props.style, texture: props.texture });
      node.layout = props.style ?? null;

      if (props.anchor !== undefined) {
        if (typeof props.anchor === 'number') {
          node.displayObject.anchor.set(props.anchor);
        } else {
          node.displayObject.anchor.set(props.anchor.x, props.anchor.y);
        }
      }

      applyInteractiveProps(node.displayObject, props);
      applyStyleCursor(node.displayObject, props.style?.cursor);
      applyLabel(node.displayObject, props.label);

      return node;
    },
    patch(node, _previous, next: SpriteNodeProps) {
      (node as SpriteNode).updateProps({ asset: next.asset, style: next.style, texture: next.texture });
      node.layout = next.style ?? null;

      if (next.anchor !== undefined) {
        if (typeof next.anchor === 'number') {
          (node as SpriteNode).displayObject.anchor.set(next.anchor);
        } else {
          (node as SpriteNode).displayObject.anchor.set(next.anchor.x, next.anchor.y);
        }
      }

      applyInteractiveProps(node.displayObject, next);
      applyStyleCursor(node.displayObject, next.style?.cursor);
      applyLabel(node.displayObject, next.label);
    },
  };
}

export function createHostTypeRegistry(): HostTypeRegistry {
  return {
    container: createContainerDescriptor(),
    sprite: createSpriteDescriptor(),
    text: createTextDescriptor(),
  };
}
