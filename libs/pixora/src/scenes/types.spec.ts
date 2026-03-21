import { Scene } from './scene';

describe('Scene base class', () => {
  it('Scene can be subclassed', () => {
    class MyScene extends Scene {
      override readonly key: string = 'my-scene';
    }

    const scene = new MyScene();
    expect(scene.key).toBe('my-scene');
    expect(scene.root).toBeDefined();
  });

  it('attachContext stores context accessible via protected getContext', () => {
    class TestScene extends Scene {
      override readonly key: string = 'test';
      getContextViaInit(): boolean {
        try {
          this.getContext();
          return true;
        } catch {
          return false;
        }
      }
    }

    const scene = new TestScene();
    expect(scene.getContextViaInit()).toBe(false);

    scene.attachContext({ app: {} } as Parameters<typeof scene.attachContext>[0]);
    expect(scene.getContextViaInit()).toBe(true);
  });

  it('mount is a no-op by default', () => {
    class MyScene extends Scene {
      override readonly key: string = 'my-scene';
    }

    const scene = new MyScene();
    expect(() => scene.mount()).not.toThrow();
  });

  it('activate is a no-op by default', () => {
    class MyScene extends Scene {
      override readonly key: string = 'my-scene';
    }

    const scene = new MyScene();
    expect(() => scene.activate()).not.toThrow();
  });

  it('deactivate is a no-op by default', () => {
    class MyScene extends Scene {
      override readonly key: string = 'my-scene';
    }

    const scene = new MyScene();
    expect(() => scene.deactivate()).not.toThrow();
  });

  it('update is a no-op by default', () => {
    class MyScene extends Scene {
      override readonly key: string = 'my-scene';
    }

    const scene = new MyScene();
    expect(() => scene.update(16)).not.toThrow();
  });

  it('resize is a no-op by default', () => {
    class MyScene extends Scene {
      override readonly key: string = 'my-scene';
    }

    const scene = new MyScene();
    expect(() => scene.resize({ width: 800, height: 600, aspectRatio: 4 / 3, orientation: 'landscape' })).not.toThrow();
  });

  it('destroy is a no-op by default', () => {
    class MyScene extends Scene {
      override readonly key: string = 'my-scene';
    }

    const scene = new MyScene();
    expect(() => scene.destroy()).not.toThrow();
  });

  it('getViewport returns viewport via protected method', () => {
    class TestScene extends Scene {
      override readonly key: string = 'test';
      getViewportDirectly() {
        return this.getViewport();
      }
    }

    const scene = new TestScene();
    const viewport = { width: 800, height: 600, aspectRatio: 4 / 3, orientation: 'landscape' as const };
    const ctx = {
      app: {},
      viewport: { get: () => viewport },
    } as unknown as Parameters<typeof scene.attachContext>[0];

    scene.attachContext(ctx);
    expect(scene.getViewportDirectly()).toEqual(viewport);
  });
});
