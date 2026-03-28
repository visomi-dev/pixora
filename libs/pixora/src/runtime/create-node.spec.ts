import { container, sprite, text } from './create-node';

describe('create-node helpers', () => {
  it('creates object-shaped container nodes', () => {
    const child = text({ content: 'hello' });
    const node = container({ key: 'root', label: 'RootContainer', style: { width: 100 }, children: [child] });

    expect(node.type).toBe('container');
    expect(node.key).toBe('root');
    expect(node.props).toEqual({ label: 'RootContainer', style: { width: 100 } });
    expect(node.children).toEqual([child]);
  });

  it('creates text nodes with content', () => {
    const node = text({ content: 'Hello World', style: { color: '#fff', fontSize: 24 } });

    expect(node.type).toBe('text');
    expect(node.props).toEqual({ content: 'Hello World', style: { color: '#fff', fontSize: 24 } });
  });

  it('creates sprite nodes with texture source props', () => {
    const node = sprite({ asset: '/ship.png', style: { width: 32, height: 16 } });

    expect(node.type).toBe('sprite');
    expect(node.props).toEqual({ asset: '/ship.png', style: { width: 32, height: 16 } });
  });
});
