import { TextNode } from './text-node';

describe('TextNode', () => {
  it('initializes text properly', () => {
    const node = new TextNode({ text: 'Hello' });
    expect(node.displayObject.text).toBe('Hello');
  });

  it('updates text properly', () => {
    const node = new TextNode({ text: 'Hello' });
    node.setText('World');
    expect(node.displayObject.text).toBe('World');
    expect(node.getProps().text).toBe('World');
  });
});
