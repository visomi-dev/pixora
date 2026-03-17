import type { Container, TextStyleOptions } from 'pixi.js';

import type { BaseNode } from '../components/base-node';
import { Box } from '../components/box';
import { Button } from '../components/button';
import { ContainerNode } from '../components/container-node';
import { SpriteNode } from '../components/sprite-node';
import { TextNode } from '../components/text-node';
import type { LayoutSpec } from '../layout/layout';
import type { LayoutStyles } from '../layout/layout-types';

import type {
  BoxNodeProps,
  ButtonNodeProps,
  ContainerNodeProps,
  HostPropsMap,
  HostType,
  SpriteNodeProps,
  TextNodeProps,
} from './types';
import { bindInteractive } from './interaction';
import { setLayoutSpec, setLayoutStyles } from './layout-runtime';

// ---------------------------------------------------------------------------
// Host type descriptor
// ---------------------------------------------------------------------------

export type HostTypeDescriptor<T extends HostType = HostType> = {
  create(props: HostPropsMap[T]): BaseNode;
  patch(node: BaseNode, previous: HostPropsMap[T], next: HostPropsMap[T]): void;
};

export type HostTypeRegistry = {
  readonly [K in HostType]: HostTypeDescriptor<K>;
};

// ---------------------------------------------------------------------------
// Common props application
// ---------------------------------------------------------------------------

export function applyCommonProps(displayObject: Container, props: ContainerNodeProps): void {
  if (props.x !== undefined) {
    displayObject.x = props.x;
  }

  if (props.y !== undefined) {
    displayObject.y = props.y;
  }

  if (props.alpha !== undefined) {
    displayObject.alpha = props.alpha;
  }

  if (props.visible !== undefined) {
    displayObject.visible = props.visible;
  }

  if (props.scale !== undefined) {
    if (typeof props.scale === 'number') {
      displayObject.scale.set(props.scale);
    } else {
      displayObject.scale.set(props.scale.x, props.scale.y);
    }
  }
}

// ---------------------------------------------------------------------------
// Per-type descriptors
// ---------------------------------------------------------------------------

function createContainerDescriptor(): HostTypeDescriptor<'container'> {
  return {
    create(props: ContainerNodeProps): BaseNode {
      const node = new ContainerNode();

      applyCommonProps(node.displayObject, props);

      if (props.layout) {
        if ('type' in props.layout) {
          setLayoutSpec(node, props.layout as LayoutSpec);
        } else {
          setLayoutStyles(node, props.layout as LayoutStyles);
        }
      }

      return node;
    },
    patch(node: BaseNode, previous: ContainerNodeProps, next: ContainerNodeProps): void {
      applyCommonProps(node.displayObject, next);

      if (next.layout !== previous.layout) {
        if (next.layout && 'type' in next.layout) {
          setLayoutSpec(node, next.layout as LayoutSpec);
        } else if (next.layout) {
          setLayoutStyles(node, next.layout as LayoutStyles);
        } else {
          setLayoutSpec(node, null);
          setLayoutStyles(node, null);
        }
      }
    },
  };
}

function createTextDescriptor(): HostTypeDescriptor<'text'> {
  return {
    create(props: TextNodeProps): BaseNode {
      const style = buildTextStyle(props);
      const node = new TextNode({ text: props.text, style });

      applyCommonProps(node.displayObject, props);

      return node;
    },
    patch(node: BaseNode, _previous: TextNodeProps, next: TextNodeProps): void {
      const style = buildTextStyle(next);
      (node as TextNode).updateProps({ text: next.text, style });
      applyCommonProps(node.displayObject, next);
    },
  };
}

function buildTextStyle(props: TextNodeProps): Partial<TextStyleOptions> {
  const style = { ...props.style };

  if (props.color !== undefined) {
    style.fill = props.color;
  }

  if (props.size !== undefined) {
    style.fontSize = props.size;
  }

  if (props.weight !== undefined) {
    style.fontWeight = props.weight as TextStyleOptions['fontWeight'];
  }

  if (props.font !== undefined) {
    style.fontFamily = props.font;
  }

  return style;
}

function createSpriteDescriptor(): HostTypeDescriptor<'sprite'> {
  return {
    create(props: SpriteNodeProps): BaseNode {
      const node = new SpriteNode({ texture: props.texture });

      applyCommonProps(node.displayObject, props);

      return node;
    },
    patch(node: BaseNode, _previous: SpriteNodeProps, next: SpriteNodeProps): void {
      if (next.texture !== undefined) {
        (node as SpriteNode).displayObject.texture = next.texture;
      }

      applyCommonProps(node.displayObject, next);
    },
  };
}

function createBoxDescriptor(): HostTypeDescriptor<'box'> {
  return {
    create(props: BoxNodeProps): BaseNode {
      const node = new Box({
        backgroundColor: props.backgroundColor,
        height: props.height,
        radius: props.radius,
        width: props.width,
      });

      applyCommonProps(node.displayObject, props);

      return node;
    },
    patch(node: BaseNode, _previous: BoxNodeProps, next: BoxNodeProps): void {
      (node as Box).updateProps({
        backgroundColor: next.backgroundColor,
        height: next.height,
        radius: next.radius,
        width: next.width,
      });
      applyCommonProps(node.displayObject, next);
    },
  };
}

function createButtonDescriptor(): HostTypeDescriptor<'button'> {
  return {
    create(props: ButtonNodeProps): BaseNode {
      const node = new Button({
        backgroundColor: props.backgroundColor,
        disabled: props.disabled,
        height: props.height,
        label: props.label,
        radius: props.radius,
        width: props.width,
      });

      const eventHandlers = {
        onPointerDown: props.onPointerDown,
        onPointerOut: props.onPointerOut,
        onPointerOver: props.onPointerOver,
        onPointerTap: props.onPointerTap,
        onPointerUp: props.onPointerUp,
        disabled: props.disabled,
      };

      if (
        eventHandlers.onPointerDown ||
        eventHandlers.onPointerOut ||
        eventHandlers.onPointerOver ||
        eventHandlers.onPointerTap ||
        eventHandlers.onPointerUp
      ) {
        bindInteractive(node.displayObject, eventHandlers);
      }

      applyCommonProps(node.displayObject, props);

      return node;
    },
    patch(node: BaseNode, _previous: ButtonNodeProps, next: ButtonNodeProps): void {
      (node as Button).updateProps({
        backgroundColor: next.backgroundColor,
        disabled: next.disabled,
        height: next.height,
        label: next.label,
        radius: next.radius,
        width: next.width,
      });

      const eventHandlers = {
        onPointerDown: next.onPointerDown,
        onPointerOut: next.onPointerOut,
        onPointerOver: next.onPointerOver,
        onPointerTap: next.onPointerTap,
        onPointerUp: next.onPointerUp,
        disabled: next.disabled,
      };

      if (
        eventHandlers.onPointerDown ||
        eventHandlers.onPointerOut ||
        eventHandlers.onPointerOver ||
        eventHandlers.onPointerTap ||
        eventHandlers.onPointerUp
      ) {
        bindInteractive(node.displayObject, eventHandlers);
      }

      applyCommonProps(node.displayObject, next);
    },
  };
}

// ---------------------------------------------------------------------------
// Registry factory
// ---------------------------------------------------------------------------

export function createHostTypeRegistry(): HostTypeRegistry {
  return {
    box: createBoxDescriptor(),
    button: createButtonDescriptor(),
    container: createContainerDescriptor(),
    sprite: createSpriteDescriptor(),
    text: createTextDescriptor(),
  };
}
