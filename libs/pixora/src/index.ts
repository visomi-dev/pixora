export { createPixoraApp } from './app/create-pixyn-app';

export type { ApplicationContext, pixoraApp, pixoraAppOptions, Viewport } from './app/types';

export { Scene } from './scenes/scene';
export { createSceneManager } from './scenes/scene-manager';

export type { SceneManager } from './scenes/scene-manager';
export type { SceneDefinition, SceneKey, ScenePayload } from './scenes/types';

export { computed, createStore, effect, signal } from './state/signal';

export type { ReadonlySignal, Signal, Store } from './state/signal';
export type { Disposable } from './utils/disposable';

export { createEventBus } from './events/create-event-bus';

export type { EventBus, EventMap } from './events/create-event-bus';

export { BaseComponent } from './components/base-component';
export { BaseNode } from './components/base-node';
export { Box } from './components/box';
export { Button } from './components/button';
export { ContainerNode } from './components/container-node';
export { InteractiveComponent } from './components/interactive-component';
export { ScrollBox } from './components/scroll-box';
export { SpriteNode } from './components/sprite-node';
export { TextNode } from './components/text-node';

export { applyLayout } from './layout/apply-layout';
export { layout } from './layout/layout';
export { Layout } from './layout/layout-node';
export { flexEngine, FlexEngine } from './layout/flex-engine';

export type {
  LayoutStyles,
  FlexItemStyle,
  FlexContainerStyle,
  JustifyContent,
  AlignItems,
  AlignSelf,
  AlignContent,
  FlexDirection,
  FlexWrap,
  Position,
  Display,
  BoxSizing,
  Overflow,
  ObjectFit,
  Direction,
  NumberValue,
  PositionSpecifier,
} from './layout/layout-types';

export type {
  AnchorLayoutSpec,
  AutoLayoutSpec,
  BreakpointRule,
  FixedLayoutSpec,
  LayoutSpec,
  PercentLayoutSpec,
  SizeMode,
  StackLayoutSpec,
} from './layout/layout';

export type { ComputedLayout, ComputedPixiLayout, LayoutBounds } from './layout/computed-layout';

export { bindInteractive } from './input/bind-interactive';
export { createKeyboardInput, clearKeyboardFrame, Keys } from './input/create-keyboard-input';

export type { BindInteractiveOptions, ButtonState, InteractionState } from './input/bind-interactive';
export type { KeyboardState } from './input/create-keyboard-input';

export { createTransition, createTween } from './animation/create-tween';

export type { TransitionOptions, Tween, TweenOptions } from './animation/create-tween';

export { createAssetRegistry } from './assets/create-asset-registry';

export type { AssetKey, AssetManifest, AssetRegistry } from './assets/create-asset-registry';

export { createServiceRegistry, createServiceToken } from './services/create-service-registry';

export type { ServiceDescriptor, ServiceRegistry, ServiceToken } from './services/create-service-registry';

export { Entity } from './entities/entity';

export type { EntityOptions } from './entities/entity';

// ---------------------------------------------------------------------------
// Declarative runtime (Phase 10)
// ---------------------------------------------------------------------------

export { pixora } from './runtime/pixora';

export type {
  DeclarativeScene,
  ImperativeSceneDefinition,
  PixoraAppOptions,
  PixoraComponentAPI,
  PixoraFn,
  PixoraRuntime,
  PixoraScene,
} from './runtime/pixora';

export { isPixoraNode } from './runtime/types';

export type {
  BoxNodeProps,
  ButtonNodeProps,
  ContainerNodeProps,
  HostPropsMap,
  HostType,
  PixoraChild,
  PixoraChildren,
  PixoraNode,
  ScrollBoxNodeProps,
  SpriteNodeProps,
  TextNodeProps,
} from './runtime/types';

export {
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
} from './runtime/create-node';

export { imperative } from './runtime/compat';
export { island } from './runtime/island';
export type { IslandOptions, IslandSetupContext } from './runtime/island';

export { mountTree, unmountTree } from './runtime/renderer';

export { updateTree } from './runtime/reconcile';

export { Scheduler, createScheduler, getScheduler } from './runtime/scheduler';

export {
  LifecyclePhase,
  InvalidationFlag,
  markVisualDirty,
  markLayoutDirty,
  clearVisualDirty,
  clearLayoutDirty,
  isVisuallyDirty,
  isLayoutDirty,
  hasDirtyDescendants,
} from './runtime/lifecycle';

export type { MountedNode, MountedTree } from './runtime/mounted-node';

export { default as pixoraApi, api } from './runtime/api';

export {
  registerComponent,
  getComponent,
  hasComponent,
  unregisterComponent,
  clearComponents,
  resolveComponent,
  isComponentType,
  createComponent,
} from './runtime/components';

export { isSignal, unwrapSignal } from './runtime/reactive';
