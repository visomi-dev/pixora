import type { LayoutStyles, NumberValue } from './layout-types';

type ResolvedDimensions = {
  height: number;
  width: number;
};

type ResolveDimensionsOptions = {
  fallbackHeight?: number;
  fallbackWidth?: number;
};

export function normalizeLayoutStyle(style: LayoutStyles): LayoutStyles {
  const original = { ...style };
  const normalized: LayoutStyles = { ...style };
  const direction = normalized.direction ?? 'ltr';
  const inlineStart = direction === 'rtl' ? 'right' : 'left';
  const inlineEnd = direction === 'rtl' ? 'left' : 'right';

  applySpacingShorthand(normalized, 'margin', ['Top', 'Bottom', 'Left', 'Right']);
  applySpacingShorthand(normalized, 'padding', ['Top', 'Bottom', 'Left', 'Right']);

  applyAxisSpacing(normalized, original, 'margin', 'Block', ['Top', 'Bottom']);
  applyAxisSpacing(normalized, original, 'margin', 'Inline', ['Left', 'Right']);
  applyAxisSpacing(normalized, original, 'padding', 'Block', ['Top', 'Bottom']);
  applyAxisSpacing(normalized, original, 'padding', 'Inline', ['Left', 'Right']);

  applyLogicalSide(normalized, original, 'margin', 'Start', inlineStart === 'left' ? 'Left' : 'Right');
  applyLogicalSide(normalized, original, 'margin', 'End', inlineEnd === 'right' ? 'Right' : 'Left');
  applyLogicalSide(normalized, original, 'padding', 'Start', inlineStart === 'left' ? 'Left' : 'Right');
  applyLogicalSide(normalized, original, 'padding', 'End', inlineEnd === 'right' ? 'Right' : 'Left');

  if (original.inset !== undefined) {
    assignIfUndefined(normalized, 'top', original.inset);
    assignIfUndefined(normalized, 'right', original.inset);
    assignIfUndefined(normalized, 'bottom', original.inset);
    assignIfUndefined(normalized, 'left', original.inset);
  }

  if (original.insetBlock !== undefined) {
    if (original.top === undefined) {
      normalized.top = original.insetBlock;
    }

    if (original.bottom === undefined) {
      normalized.bottom = original.insetBlock;
    }
  }

  if (original.insetInline !== undefined) {
    if (original.left === undefined) {
      normalized.left = original.insetInline;
    }

    if (original.right === undefined) {
      normalized.right = original.insetInline;
    }
  }

  if (original.start !== undefined && original[inlineStart] === undefined) {
    normalized[inlineStart] = original.start;
  }

  if (original.end !== undefined && original[inlineEnd] === undefined) {
    normalized[inlineEnd] = original.end;
  }

  if (normalized.flex !== undefined) {
    if (normalized.flexGrow === undefined) {
      normalized.flexGrow = normalized.flex;
    }

    if (normalized.flexShrink === undefined) {
      normalized.flexShrink = normalized.flex === 0 ? 0 : 1;
    }

    if (normalized.flexBasis === undefined) {
      normalized.flexBasis = normalized.flex === 0 ? 'auto' : 0;
    }
  }

  return normalized;
}

export function resolveStyleDimensions(
  style: LayoutStyles,
  parentWidth: number,
  parentHeight: number,
  options: ResolveDimensionsOptions = {},
): ResolvedDimensions {
  const fallbackWidth = options.fallbackWidth ?? 0;
  const fallbackHeight = options.fallbackHeight ?? 0;

  let width = resolveDimension(style.width, parentWidth);
  let height = resolveDimension(style.height, parentHeight);

  if (style.aspectRatio !== undefined && style.aspectRatio > 0) {
    if (width !== null && height === null) {
      height = width / style.aspectRatio;
    } else if (height !== null && width === null) {
      width = height * style.aspectRatio;
    }
  }

  width ??= fallbackWidth;
  height ??= fallbackHeight;

  const minWidth = resolveDimension(style.minWidth, parentWidth);
  const maxWidth = resolveDimension(style.maxWidth, parentWidth);
  const minHeight = resolveDimension(style.minHeight, parentHeight);
  const maxHeight = resolveDimension(style.maxHeight, parentHeight);

  if (minWidth !== null) {
    width = Math.max(width, minWidth);
  }

  if (maxWidth !== null) {
    width = Math.min(width, maxWidth);
  }

  if (minHeight !== null) {
    height = Math.max(height, minHeight);
  }

  if (maxHeight !== null) {
    height = Math.min(height, maxHeight);
  }

  return { height, width };
}

export function resolveDimension(
  value: LayoutStyles['width'] | LayoutStyles['height'] | undefined,
  parentSize: number,
): number | null {
  if (value === undefined || value === 'auto' || value === 'intrinsic') {
    return null;
  }

  return resolveNumberValue(value, parentSize);
}

export function resolveNumberValue(value: NumberValue | undefined, parentSize: number): number {
  if (value === undefined) {
    return 0;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (value.endsWith('%')) {
    return (parseFloat(value) / 100) * parentSize;
  }

  return parseFloat(value) || 0;
}

function applySpacingShorthand(
  style: LayoutStyles,
  prefix: 'margin' | 'padding',
  sides: readonly ['Top', 'Bottom', 'Left', 'Right'],
): void {
  const value = style[prefix];

  if (value === undefined) {
    return;
  }

  for (const side of sides) {
    assignIfUndefined(style, `${prefix}${side}`, value);
  }
}

function applyAxisSpacing(
  style: LayoutStyles,
  original: LayoutStyles,
  prefix: 'margin' | 'padding',
  axis: 'Block' | 'Inline',
  sides: readonly ['Top', 'Bottom'] | readonly ['Left', 'Right'],
): void {
  const key = `${prefix}${axis}` as 'marginBlock' | 'marginInline' | 'paddingBlock' | 'paddingInline';
  const value = original[key];

  if (value === undefined) {
    return;
  }

  for (const side of sides) {
    const physicalKey = `${prefix}${side}` as keyof LayoutStyles;

    if (original[physicalKey] === undefined) {
      assignLayoutValue(style, physicalKey, value);
    }
  }
}

function applyLogicalSide(
  style: LayoutStyles,
  original: LayoutStyles,
  prefix: 'margin' | 'padding',
  logical: 'Start' | 'End',
  physical: 'Left' | 'Right',
): void {
  const key = `${prefix}${logical}` as 'marginStart' | 'marginEnd' | 'paddingStart' | 'paddingEnd';
  const value = original[key];

  if (value === undefined) {
    return;
  }

  const physicalKey = `${prefix}${physical}` as keyof LayoutStyles;

  if (original[physicalKey] === undefined) {
    assignLayoutValue(style, physicalKey, value);
  }
}

function assignIfUndefined<Key extends keyof LayoutStyles>(
  style: LayoutStyles,
  key: Key,
  value: LayoutStyles[Key],
): void {
  if (style[key] === undefined) {
    style[key] = value;
  }
}

function assignLayoutValue(
  style: LayoutStyles,
  key: keyof LayoutStyles,
  value: LayoutStyles[keyof LayoutStyles],
): void {
  (style as Record<keyof LayoutStyles, LayoutStyles[keyof LayoutStyles] | undefined>)[key] = value;
}
