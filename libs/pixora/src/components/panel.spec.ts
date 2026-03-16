import { Panel } from './panel';

describe('Panel', () => {
  it('initializes and updates props correctly', () => {
    const panel = new Panel({ alpha: 0.5, height: 100, width: 200 });

    expect(panel.displayObject.alpha).toBe(0.5);
    expect(panel.displayObject.width).toBe(200);
    expect(panel.displayObject.height).toBe(100);

    panel.updateProps({ alpha: 1, height: 50, width: 50 });

    expect(panel.displayObject.alpha).toBe(1);
    expect(panel.displayObject.width).toBe(50);
    expect(panel.displayObject.height).toBe(50);
  });
});
