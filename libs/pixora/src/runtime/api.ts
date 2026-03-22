import { applyLayout } from '../layout/apply-layout';
import {
  layout,
  type AnchorLayoutSpec,
  type AutoLayoutSpec,
  type BreakpointRule,
  type FixedLayoutSpec,
  type FlexLayoutSpec,
  type LayoutSpec,
  type PercentLayoutSpec,
  type StackLayoutSpec,
} from '../layout/layout';


import {
  box,
  button,
  container,
  keyedBox,
  keyedContainer,
  keyedSprite,
  keyedText,
  scrollBox,
  sprite,
  text,
} from './create-node';
import { imperative } from './compat';
import { island, type IslandOptions, type IslandSetupContext } from './island';
import { registerComponent } from './components';
import { createScheduler, getScheduler, Scheduler } from './scheduler';
import {
  InvalidationFlag,
  markVisualDirty,
  markLayoutDirty,
  clearVisualDirty,
  clearLayoutDirty,
  isVisuallyDirty,
  isLayoutDirty,
} from './lifecycle';
import { mountTree, unmountTree } from './renderer';
import { updateTree } from './reconcile';
import {
  isPixoraNode,
  type PixoraNode,
  BoxNodeProps,
  ButtonNodeProps,
  ContainerNodeProps,
  PixoraChild,
  PixoraComponent,
  PixoraComponentProps,
  ScrollBoxNodeProps,
  SpriteNodeProps,
  TextNodeProps,
} from './types';
import { clearSharedCache, createAssetContext } from './asset-context';
import { pixora } from './pixora';

import type { MountedNode, MountedTree } from './mounted-node';
import type { ApplicationContext } from '../app/types';

export { pixora };
export { isPixoraNode };
export { box, button, container, keyedBox, keyedContainer, keyedSprite, keyedText, scrollBox, sprite, text };
export { imperative };
export { island };
export { mountTree, unmountTree };
export { updateTree };
export { Scheduler, createScheduler, getScheduler };
export {
  InvalidationFlag,
  markVisualDirty,
  markLayoutDirty,
  clearVisualDirty,
  clearLayoutDirty,
  isVisuallyDirty,
  isLayoutDirty,
};
export type { MountedNode, MountedTree };
export { applyLayout } from '../layout/apply-layout';
export { layout } from '../layout/layout';
export {
  getOrCreateLayoutNode,
  markLayoutNodeDirty,
  markSubtreeLayoutDirty,
  measureNode,
  removeLayoutNode,
  runLayout,
  setLayoutSpec,
} from './layout-runtime';
export { AssetState, clearSharedCache, createAssetContext } from './asset-context';
export {
  bindInteractive,
  getInteractiveState,
  isInteractive,
  type InteractionCallback,
  type InteractionEventType,
  type InteractiveState,
  type PixoraInteractionEvent,
} from './interaction';
export {
  findNodeByKey,
  findNodesByType,
  formatTree,
  getTreeStats,
  inspectNode,
  inspectTree,
  type DebugNodeInfo,
  type DebugTreeStats,
} from './debug';
export {
  getWarningHandler,
  setWarningHandler,
  validateHostType,
  validateKey,
  validateProps,
  warn,
  warnDeprecated,
  warnInvalidChild,
  warnInvalidKey,
  warnInvalidProp,
  warnMissingRequiredProp,
  warnUnknownHostType,
  WarningCode,
} from './warnings';
export type {
  AnchorLayoutSpec,
  AutoLayoutSpec,
  BreakpointRule,
  FixedLayoutSpec,
  FlexLayoutSpec,
  LayoutSpec,
  PercentLayoutSpec,
  StackLayoutSpec,
};
export type {
  PixoraNode,
  ContainerNodeProps,
  TextNodeProps,
  SpriteNodeProps,
  BoxNodeProps,
  ButtonNodeProps,
  ScrollBoxNodeProps,
  PixoraChild,
};
export type { IslandOptions, IslandSetupContext };

export const api = {
  container(props?: ContainerNodeProps, ...children: PixoraChild[]) {
    return container(props, ...children);
  },

  text(props: TextNodeProps) {
    return text(props);
  },

  sprite(props?: SpriteNodeProps) {
    return sprite(props);
  },

  box(props?: BoxNodeProps, ...children: PixoraChild[]) {
    return box(props, ...children);
  },

  keyedBox,

  button(props: ButtonNodeProps) {
    return button(props);
  },

  scrollBox(props?: ScrollBoxNodeProps, ...children: PixoraChild[]) {
    return scrollBox(props, ...children);
  },

  keyedContainer(key: string | number, props?: ContainerNodeProps, ...children: PixoraChild[]) {
    return keyedContainer(key, props, ...children);
  },

  keyedSprite,

  keyedText,

  component<Props extends PixoraComponentProps>(
    renderFn: PixoraComponent<Props>,
    name?: string | symbol,
  ): PixoraComponent<Props> {
    if (name) {
      registerComponent(name, renderFn);
    }
    return renderFn;
  },

  scene(
    sceneDef:
      | { key: string; render: (context: ApplicationContext) => PixoraNode }
      | ((context: ApplicationContext) => PixoraNode),
  ): { key: string; render: (context: ApplicationContext) => PixoraNode } {
    if (typeof sceneDef === 'function') {
      return { key: `scene_${Math.random().toString(36).substring(2, 9)}`, render: sceneDef };
    }
    return sceneDef;
  },

  imperative,

  island,

  layout: {
    apply: applyLayout,
    create: layout,
    types: {
      anchor: (spec: Omit<AnchorLayoutSpec, 'type'>): AnchorLayoutSpec => ({ ...spec, type: 'anchor' }),
      auto: (spec: Omit<AutoLayoutSpec, 'type'>): AutoLayoutSpec => ({ ...spec, type: 'auto' }),
      fixed: (spec: Omit<FixedLayoutSpec, 'type'>): FixedLayoutSpec => ({ ...spec, type: 'fixed' }),
      flex: (spec: Omit<FlexLayoutSpec, 'type'>): FlexLayoutSpec => ({ ...spec, type: 'flex' }),
      percent: (spec: Omit<PercentLayoutSpec, 'type'>): PercentLayoutSpec => ({ ...spec, type: 'percent' }),
      stack: (spec: Omit<StackLayoutSpec, 'type'>): StackLayoutSpec => ({ ...spec, type: 'stack' }),
    },
  },

  assets: {
    create: createAssetContext,
    clearCache: clearSharedCache,
  },

  runtime: {
    mount: mountTree,
    unmount: unmountTree,
    update: updateTree,
    scheduler: {
      create: createScheduler,
      get: getScheduler,
    },
    lifecycle: {
      markVisualDirty,
      markLayoutDirty,
      clearVisualDirty,
      clearLayoutDirty,
      isVisuallyDirty,
      isLayoutDirty,
    },
  },
};

export default api;
