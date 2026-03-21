import { layout } from './layout';

describe('layout', () => {
  describe('anchor', () => {
    it('creates an anchor layout spec', () => {
      const spec = layout.anchor({
        horizontal: 'center',
        vertical: 'center',
      });

      expect(spec.type).toBe('anchor');
      expect(spec.horizontal).toBe('center');
      expect(spec.vertical).toBe('center');
    });

    it('accepts optional offset properties', () => {
      const spec = layout.anchor({
        horizontal: 'center',
        vertical: 'center',
        offsetX: 10,
        offsetY: 20,
        relativeWidth: 0.5,
        relativeHeight: 0.5,
      });

      expect(spec.offsetX).toBe(10);
      expect(spec.offsetY).toBe(20);
      expect(spec.relativeWidth).toBe(0.5);
      expect(spec.relativeHeight).toBe(0.5);
    });

    it('accepts breakpoints', () => {
      const spec = layout.anchor({
        horizontal: 'center',
        vertical: 'center',
        breakpoints: [{ maxWidth: 600, override: { type: 'anchor', horizontal: 'start', vertical: 'start' } }],
      });

      expect(spec.breakpoints).toHaveLength(1);
      expect(spec.breakpoints![0].maxWidth).toBe(600);
    });
  });

  describe('auto', () => {
    it('creates an auto layout spec', () => {
      const spec = layout.auto({});

      expect(spec.type).toBe('auto');
    });

    it('accepts size modes', () => {
      const spec = layout.auto({ width: 'fill', height: 'content' });

      expect(spec.width).toBe('fill');
      expect(spec.height).toBe('content');
    });
  });

  describe('fixed', () => {
    it('creates a fixed layout spec', () => {
      const spec = layout.fixed({ width: 100, height: 50 });

      expect(spec.type).toBe('fixed');
      expect(spec.width).toBe(100);
      expect(spec.height).toBe(50);
    });

    it('accepts scale and position', () => {
      const spec = layout.fixed({ width: 100, height: 50, scale: 2, x: 10, y: 20 });

      expect(spec.scale).toBe(2);
      expect(spec.x).toBe(10);
      expect(spec.y).toBe(20);
    });
  });

  describe('flex', () => {
    it('creates a flex layout spec', () => {
      const spec = layout.flex({ direction: 'horizontal' });

      expect(spec.type).toBe('flex');
      expect(spec.direction).toBe('horizontal');
    });

    it('accepts alignment and justification', () => {
      const spec = layout.flex({
        direction: 'horizontal',
        align: 'center',
        justify: 'space-between',
        gap: 8,
      });

      expect(spec.align).toBe('center');
      expect(spec.justify).toBe('space-between');
      expect(spec.gap).toBe(8);
    });
  });

  describe('percent', () => {
    it('creates a percent layout spec', () => {
      const spec = layout.percent({ width: 50 });

      expect(spec.type).toBe('percent');
      expect(spec.width).toBe(50);
    });

    it('accepts vertical and offset options', () => {
      const spec = layout.percent({
        width: 50,
        height: 25,
        vertical: 'center',
        horizontal: 'center',
        offsetX: 10,
        offsetY: 5,
      });

      expect(spec.height).toBe(25);
      expect(spec.vertical).toBe('center');
      expect(spec.horizontal).toBe('center');
      expect(spec.offsetX).toBe(10);
      expect(spec.offsetY).toBe(5);
    });
  });

  describe('stack', () => {
    it('creates a stack layout spec', () => {
      const spec = layout.stack({ direction: 'vertical' });

      expect(spec.type).toBe('stack');
      expect(spec.direction).toBe('vertical');
    });

    it('accepts alignment and gap', () => {
      const spec = layout.stack({
        direction: 'horizontal',
        align: 'end',
        gap: 4,
        padding: 16,
        fitContent: true,
      });

      expect(spec.align).toBe('end');
      expect(spec.gap).toBe(4);
      expect(spec.padding).toBe(16);
      expect(spec.fitContent).toBe(true);
    });
  });
});
