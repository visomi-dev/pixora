import { Sprite, Text } from 'pixi.js';

import type { Container } from 'pixi.js';
import type { LayoutStyles as PixiLayoutStyles } from '@pixi/layout';
import type { PixoraStyle } from './layout-types';

const PIXI_LAYOUT_KEYS = [
  'alignContent',
  'alignItems',
  'alignSelf',
  'aspectRatio',
  'backgroundColor',
  'borderRadius',
  'borderWidth',
  'bottom',
  'boxSizing',
  'columnGap',
  'direction',
  'display',
  'end',
  'flex',
  'flexBasis',
  'flexDirection',
  'flexGrow',
  'flexShrink',
  'flexWrap',
  'gap',
  'height',
  'inset',
  'insetBlock',
  'insetInline',
  'isLeaf',
  'justifyContent',
  'left',
  'margin',
  'marginBlock',
  'marginBottom',
  'marginEnd',
  'marginInline',
  'marginLeft',
  'marginRight',
  'marginStart',
  'marginTop',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'objectFit',
  'objectPosition',
  'overflow',
  'padding',
  'paddingBlock',
  'paddingBottom',
  'paddingEnd',
  'paddingInline',
  'paddingLeft',
  'paddingRight',
  'paddingStart',
  'paddingTop',
  'position',
  'right',
  'rowGap',
  'start',
  'top',
  'transformOrigin',
  'width',
] as const satisfies readonly (keyof PixoraStyle)[];

export function applyPixiLayout(target: Container, style: PixoraStyle | null): void {
  if (!style) {
    target.layout = null;

    return;
  }

  target.layout = translateToPixiLayout(target, style);
}

export function translateToPixiLayout(target: Container, style: PixoraStyle): Partial<PixiLayoutStyles> {
  const translated: Partial<PixiLayoutStyles> = {};
  const source = style as Record<string, unknown>;

  for (const key of PIXI_LAYOUT_KEYS) {
    const value = source[key];

    if (value !== undefined) {
      translated[key] = value as never;
    }
  }

  if (style.display === 'contents') {
    translated.display = 'flex';
  }

  if (target instanceof Sprite || target instanceof Text) {
    translated.isLeaf ??= true;
  }

  return translated;
}
