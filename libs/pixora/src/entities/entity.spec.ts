import { ContainerNode } from '../components/container-node';

import { Entity } from './entity';

describe('Entity', () => {
  it('creates an entity with initial state', () => {
    const node = new ContainerNode();
    const entity = new Entity({
      id: 'player-1',
      initialState: { health: 100 },
      node,
    });

    expect(entity.id).toBe('player-1');
    expect(entity.getState()).toEqual({ health: 100 });
    expect(entity.node).toBe(node);
    expect(entity.state.get()).toEqual({ health: 100 });

    entity.destroy();
  });

  it('updates state via setState', () => {
    const node = new ContainerNode();
    const entity = new Entity({
      id: 'player-1',
      initialState: { health: 100 },
      node,
    });

    entity.setState({ health: 50 });

    expect(entity.getState()).toEqual({ health: 50 });
    expect(entity.state.get()).toEqual({ health: 50 });

    entity.destroy();
  });

  it('destroy calls node destroy', () => {
    const node = new ContainerNode();
    const destroySpy = vi.spyOn(node, 'destroy');

    const entity = new Entity({
      id: 'player-1',
      initialState: {},
      node,
    });

    entity.destroy();

    expect(destroySpy).toHaveBeenCalled();
  });

  it('update is a no-op by default', () => {
    const node = new ContainerNode();
    const entity = new Entity({
      id: 'player-1',
      initialState: {},
      node,
    });

    expect(() => entity.update(16)).not.toThrow();

    entity.destroy();
  });

  it('accepts complex state types', () => {
    const node = new ContainerNode();
    const entity = new Entity({
      id: 'entity-1',
      initialState: { items: ['a', 'b'], position: { x: 1, y: 2 } },
      node,
    });

    expect(entity.getState()).toEqual({ items: ['a', 'b'], position: { x: 1, y: 2 } });

    entity.destroy();
  });
});
