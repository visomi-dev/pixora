import { vi } from 'vitest';

const goTo = vi.fn(async () => undefined);
const createpixoraApp = vi.fn(async () => ({
  app: {},
  context: {
    events: {
      on: vi.fn(() => ({
        dispose: vi.fn(),
      })),
    },
    scenes: {
      getActiveSceneKey: vi.fn(() => 'foundation'),
      goTo,
    },
    viewport: {
      get: vi.fn(() => ({
        height: 720,
        orientation: 'landscape',
        width: 1280,
      })),
      subscribe: vi.fn(() => ({
        dispose: vi.fn(),
      })),
    },
  },
  destroy: vi.fn(async () => undefined),
  start: vi.fn(async () => undefined),
}));

vi.mock('pixora', async (importOriginal) => {
  const actual = await importOriginal<typeof import('pixora')>();

  return {
    ...actual,
    createpixoraApp,
  };
});

describe('AppElement', () => {
  let AppElementCtor: typeof import('./app.element').AppElement;
  let app: InstanceType<typeof AppElementCtor>;

  beforeAll(async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null);
    ({ AppElement: AppElementCtor } = await import('./app.element'));
  });

  beforeEach(() => {
    createpixoraApp.mockClear();
    goTo.mockClear();
    app = new AppElementCtor();
  });

  it('should create successfully', () => {
    expect(app).toBeTruthy();
  });

  it('renders the pixora phase 8 heading and boots the runtime', async () => {
    app.connectedCallback();
    await Promise.resolve();

    expect(app.querySelector('h1')?.textContent).toContain('Phase 8 example app MVP.');
    expect(app.textContent).toContain('Canvas stage');
    expect(createpixoraApp).toHaveBeenCalledTimes(1);
    expect(createpixoraApp).toHaveBeenCalledWith(
      expect.objectContaining({
        initialScene: 'main-menu',
      }),
    );
  });
});
