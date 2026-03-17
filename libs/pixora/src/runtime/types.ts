import type { Texture, TextStyleOptions } from 'pixi.js';

import type { BaseNode } from '../components/base-node';

// ---------------------------------------------------------------------------
// Host types
// ---------------------------------------------------------------------------

export type HostType = 'box' | 'button' | 'container' | 'sprite' | 'text';

// ---------------------------------------------------------------------------
// Functional component types
// ---------------------------------------------------------------------------

export type PixoraComponentProps = Record<string, unknown>;

export type PixoraComponent<Props extends PixoraComponentProps = PixoraComponentProps> = (props: Props) => PixoraNode;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyPixoraComponent = PixoraComponent<any>;

// ---------------------------------------------------------------------------
// Declarative asset types
// ---------------------------------------------------------------------------

export type AssetRef<T extends string = string> = {
  key: T;
  preload?: boolean;
};

export function isAssetRef<T extends string>(value: unknown): value is AssetRef<T> {
  return (
    typeof value === 'object' && value !== null && 'key' in value && typeof (value as AssetRef<T>).key === 'string'
  );
}

// ---------------------------------------------------------------------------
// Per-host-type props
// ---------------------------------------------------------------------------

export type ContainerNodeProps = {
  alpha?: number;
  layout?: unknown;
  scale?: number | { x: number; y: number };
  visible?: boolean;
  x?: number;
  y?: number;
};

export type TextNodeProps = ContainerNodeProps & {
  color?: string;
  font?: string;
  size?: number;
  style?: Partial<TextStyleOptions>;
  text: string;
  weight?: string;
};

export type SpriteNodeProps = ContainerNodeProps & {
  asset?: string;
  texture?: Texture;
};

export type BoxNodeProps = ContainerNodeProps & {
  backgroundColor?: number;
  height?: number;
  radius?: number;
  width?: number;
};

export type ButtonNodeProps = ContainerNodeProps & {
  backgroundColor?: number;
  disabled?: boolean;
  height?: number;
  label: string;
  onPointerDown?: (event: PixoraInteractionEvent) => void;
  onPointerOut?: (event: PixoraInteractionEvent) => void;
  onPointerOver?: (event: PixoraInteractionEvent) => void;
  onPointerTap?: (event: PixoraInteractionEvent) => void;
  onPointerUp?: (event: PixoraInteractionEvent) => void;
  radius?: number;
  width?: number;
};

export type PixoraInteractionEvent = {
  nativeEvent: unknown;
  target: unknown;
  type: string;
};

export type HostPropsMap = {
  box: BoxNodeProps;
  button: ButtonNodeProps;
  container: ContainerNodeProps;
  sprite: SpriteNodeProps;
  text: TextNodeProps;
};

// ---------------------------------------------------------------------------
// Imperative bridge marker
// ---------------------------------------------------------------------------

/**
 * Internal symbol used to identify nodes created via the `imperative()` bridge.
 * The renderer checks for this symbol rather than a string type, keeping
 * `HostType` a closed union of built-in types only.
 */
export const IMPERATIVE_MARKER: unique symbol = Symbol('pixora.imperative');

export type ImperativeNodeProps = {
  readonly [IMPERATIVE_MARKER]: true;
  readonly node: BaseNode;
};

// ---------------------------------------------------------------------------
// Declarative node
// ---------------------------------------------------------------------------

export type PixoraChild = PixoraNode | string | number | boolean | null | undefined | readonly PixoraChild[];

export type PixoraChildren = readonly PixoraChild[];

/**
 * A declarative element descriptor. Plain frozen object — cheap to create,
 * immutable once defined. The renderer translates these into mounted instances.
 *
 * `type` is either:
 * - A `HostType` string for built-in host elements
 * - The `IMPERATIVE_MARKER` symbol for escape-hatch imperative nodes
 * - A function component for user-defined components
 */
export type PixoraNode<T extends HostType = HostType> = {
  readonly children: PixoraChildren;
  readonly key?: string | number;
  readonly props: T extends HostType ? HostPropsMap[T] : ImperativeNodeProps;
  readonly type: T | typeof IMPERATIVE_MARKER | AnyPixoraComponent;
};

/**
 * Type guard to check if a value is a `PixoraNode`.
 */
export function isPixoraNode(value: unknown): value is PixoraNode {
  return typeof value === 'object' && value !== null && 'type' in value && 'props' in value && 'children' in value;
}
