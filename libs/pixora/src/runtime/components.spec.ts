import { describe, expect, it } from 'vitest';

import {
  registerComponent,
  getComponent,
  hasComponent,
  unregisterComponent,
  clearComponents,
  resolveComponent,
  isComponentType,
  createComponent,
} from './components';

import type { PixoraComponent, PixoraComponentProps, PixoraNode  } from './types';

// Helper to create properly typed PixoraNode components
const makeComponent = (node: PixoraNode): PixoraComponent<PixoraComponentProps> => {
  return () => node;
};

describe('components', () => {
  afterEach(() => {
    clearComponents();
  });

  describe('registerComponent', () => {
    it('registers a component under a name', () => {
      const component = makeComponent({ type: 'container', props: {}, children: [] });
      registerComponent('MyComponent', component);

      expect(hasComponent('MyComponent')).toBe(true);
    });
  });

  describe('getComponent', () => {
    it('retrieves a registered component', () => {
      const component = makeComponent({ type: 'container', props: {}, children: [] });
      registerComponent('MyComponent', component);

      expect(getComponent('MyComponent')).toBe(component);
    });

    it('returns undefined for unregistered component', () => {
      expect(getComponent('NonExistent')).toBeUndefined();
    });
  });

  describe('hasComponent', () => {
    it('returns true for registered component', () => {
      const component = makeComponent({ type: 'container', props: {}, children: [] });
      registerComponent('MyComponent', component);

      expect(hasComponent('MyComponent')).toBe(true);
    });

    it('returns false for unregistered component', () => {
      expect(hasComponent('NonExistent')).toBe(false);
    });
  });

  describe('unregisterComponent', () => {
    it('removes a registered component', () => {
      const component = makeComponent({ type: 'container', props: {}, children: [] });
      registerComponent('MyComponent', component);

      expect(unregisterComponent('MyComponent')).toBe(true);
      expect(hasComponent('MyComponent')).toBe(false);
    });

    it('returns false for unregistered component', () => {
      expect(unregisterComponent('NonExistent')).toBe(false);
    });

    it('works with symbol keys', () => {
      const sym = Symbol('my-symbol');
      const component = makeComponent({ type: 'container', props: {}, children: [] });
      registerComponent(sym, component);

      expect(hasComponent(sym)).toBe(true);
      expect(unregisterComponent(sym)).toBe(true);
      expect(hasComponent(sym)).toBe(false);
    });
  });

  describe('clearComponents', () => {
    it('removes all registered components', () => {
      const component = makeComponent({ type: 'container', props: {}, children: [] });
      registerComponent('Comp1', component);
      registerComponent('Comp2', component);

      clearComponents();

      expect(hasComponent('Comp1')).toBe(false);
      expect(hasComponent('Comp2')).toBe(false);
    });
  });

  describe('resolveComponent', () => {
    it('returns the component as-is if it is a function', () => {
      const component = makeComponent({ type: 'container', props: {}, children: [] });

      expect(resolveComponent(component)).toBe(component);
    });

    it('looks up string keys in the registry', () => {
      const component = makeComponent({ type: 'container', props: {}, children: [] });
      registerComponent('MyComp', component);

      expect(resolveComponent('MyComp')).toBe(component);
    });

    it('looks up symbol keys in the registry', () => {
      const sym = Symbol('sym-comp');
      const component = makeComponent({ type: 'container', props: {}, children: [] });
      registerComponent(sym, component);

      expect(resolveComponent(sym)).toBe(component);
    });

    it('returns undefined for unknown string keys', () => {
      expect(resolveComponent('Unknown')).toBeUndefined();
    });
  });

  describe('isComponentType', () => {
    it('returns true for functions', () => {
      const component = makeComponent({ type: 'container', props: {}, children: [] });

      expect(isComponentType(component)).toBe(true);
    });

    it('returns false for non-function types', () => {
      expect(isComponentType('container')).toBe(false);
      expect(isComponentType(123)).toBe(false);
      expect(isComponentType(null)).toBe(false);
      expect(isComponentType({})).toBe(false);
    });
  });

  describe('createComponent', () => {
    it('returns the component as-is', () => {
      const component = makeComponent({ type: 'container', props: {}, children: [] });

      expect(createComponent(component)).toBe(component);
    });
  });
});
