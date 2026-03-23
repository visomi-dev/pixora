import { TextNode } from './text-node';

describe('TextNode', () => {
  it('initializes text properly', () => {
    const node = new TextNode({ content: 'Hello' });
    expect(node.displayObject.text).toBe('Hello');
  });

  it('updates text properly', () => {
    const node = new TextNode({ content: 'Hello' });
    node.setContent('World');
    expect(node.displayObject.text).toBe('World');
    expect(node.getProps().content).toBe('World');
  });
});
