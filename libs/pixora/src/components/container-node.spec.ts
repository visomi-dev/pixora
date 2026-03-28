import { ContainerNode } from './container-node';

describe('ContainerNode', () => {
  it('keeps layout bounds even without a background color', () => {
    const node = new ContainerNode();

    node.setLayoutSize(375, 667);

    expect(node.displayObject.width).toBe(375);
    expect(node.displayObject.height).toBe(667);
    expect(node.displayObject.getLocalBounds().width).toBe(375);
    expect(node.displayObject.getLocalBounds().height).toBe(667);
    expect(node.displayObject.hitArea).toBeDefined();
    expect(node.displayObject.boundsArea).toBeDefined();
  });
});
