import { describe, expect, it } from 'vitest';

import { normalizeLayoutStyle, resolveStyleDimensions } from './normalize-style';

describe('normalizeLayoutStyle', () => {
  it('expands logical spacing and inset properties', () => {
    const style = normalizeLayoutStyle({
      direction: 'rtl',
      end: 8,
      insetBlock: 12,
      marginInline: 4,
      padding: 10,
      paddingEnd: 6,
      paddingInline: 14,
      start: 16,
    });

    expect(style.left).toBe(8);
    expect(style.right).toBe(16);
    expect(style.top).toBe(12);
    expect(style.bottom).toBe(12);
    expect(style.marginLeft).toBe(4);
    expect(style.marginRight).toBe(4);
    expect(style.paddingTop).toBe(10);
    expect(style.paddingBottom).toBe(10);
    expect(style.paddingLeft).toBe(6);
    expect(style.paddingRight).toBe(14);
  });

  it('derives flex sub-properties from flex shorthand', () => {
    const style = normalizeLayoutStyle({ flex: 2 });

    expect(style.flexBasis).toBe(0);
    expect(style.flexGrow).toBe(2);
    expect(style.flexShrink).toBe(1);
  });
});

describe('resolveStyleDimensions', () => {
  it('derives the missing axis from aspect ratio', () => {
    const dimensions = resolveStyleDimensions({ aspectRatio: 2, width: '50%' }, 200, 100, {
      fallbackHeight: 0,
      fallbackWidth: 0,
    });

    expect(dimensions.width).toBe(100);
    expect(dimensions.height).toBe(50);
  });

  it('clamps resolved values to min and max sizes', () => {
    const dimensions = resolveStyleDimensions({ height: 20, maxWidth: 60, minWidth: 40, width: 100 }, 200, 100);

    expect(dimensions.width).toBe(60);
    expect(dimensions.height).toBe(20);
  });
});
