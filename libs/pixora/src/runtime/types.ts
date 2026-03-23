import type { Texture } from 'pixi.js';
import type { BaseNode } from '../components/base-node';
import type { PixoraStyle } from '../layout/layout-types';

export type HostType = 'container' | 'sprite' | 'text';

export type PixoraComponentProps = Record<string, unknown>;

export type PixoraComponent<Props extends PixoraComponentProps = PixoraComponentProps> = (props: Props) => PixoraNode;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyPixoraComponent = PixoraComponent<any>;

export type AssetRef<T extends string = string> = {
  key: T;
  preload?: boolean;
};

export function isAssetRef<T extends string>(value: unknown): value is AssetRef<T> {
  return (
    typeof value === 'object' && value !== null && 'key' in value && typeof (value as AssetRef<T>).key === 'string'
  );
}

export type PixoraInteractionEvent = {
  nativeEvent: unknown;
  target: unknown;
  type: string;
};

export type InteractiveNodeProps = {
  onPointerDown?: (event: PixoraInteractionEvent) => void;
  onPointerOut?: (event: PixoraInteractionEvent) => void;
  onPointerOver?: (event: PixoraInteractionEvent) => void;
  onPointerTap?: (event: PixoraInteractionEvent) => void;
  onPointerUp?: (event: PixoraInteractionEvent) => void;
};

export type NodeCreationProps = {
  children?: readonly PixoraChild[];
  key?: string | number;
  label?: string;
  style?: PixoraStyle;
};

export type ContainerNodeProps = NodeCreationProps & InteractiveNodeProps;

export type TextNodeProps = NodeCreationProps &
  InteractiveNodeProps & {
    anchor?: number | { x: number; y: number };
    content: string;
  };

export type SpriteNodeProps = NodeCreationProps &
  InteractiveNodeProps & {
    anchor?: number | { x: number; y: number };
    asset?: string;
    texture?: Texture;
  };

export type HostPropsMap = {
  container: ContainerNodeProps;
  sprite: SpriteNodeProps;
  text: TextNodeProps;
};

export const IMPERATIVE_MARKER: unique symbol = Symbol('pixora.imperative');

export type ImperativeNodeProps = {
  readonly [IMPERATIVE_MARKER]: true;
  readonly managed?: boolean;
  readonly node: BaseNode;
};

export type PixoraChild = PixoraNode | string | number | boolean | null | undefined | readonly PixoraChild[];

export type PixoraChildren = readonly PixoraChild[];

export type PixoraNodeType = HostType | typeof IMPERATIVE_MARKER;

export type PixoraNodeProps<T extends PixoraNodeType> = T extends HostType
  ? HostPropsMap[T]
  : T extends typeof IMPERATIVE_MARKER
    ? ImperativeNodeProps
    : never;

export type PixoraNode<T extends PixoraNodeType = PixoraNodeType> = {
  readonly children: PixoraChildren;
  readonly key?: string | number;
  readonly props: PixoraNodeProps<T>;
  readonly type: T;
};

export function isPixoraNode(value: unknown): value is PixoraNode {
  return typeof value === 'object' && value !== null && 'type' in value && 'props' in value && 'children' in value;
}
