describe('catfe-express bootstrap', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.resetModules();
    vi.clearAllMocks();
    vi.unmock('pixora');
  });

  it('mounts Pixora with the expected game configuration when #game exists', async () => {
    document.body.innerHTML = '<div id="game"></div>';

    const pixoraMock = vi.fn().mockResolvedValue({});

    vi.doMock('pixora', async () => {
      const actual = await vi.importActual<typeof import('pixora')>('pixora');

      return {
        ...actual,
        pixora: Object.assign(pixoraMock, actual.pixora),
      };
    });

    const { mainMenuScene } = await import('./scenes/main-menu-scene');

    await import('./catfe-express');
    await Promise.resolve();

    expect(pixoraMock).toHaveBeenCalledTimes(1);
    expect(pixoraMock).toHaveBeenCalledWith(
      expect.objectContaining({
        assets: {
          fonts: [
            expect.objectContaining({ family: 'Fredoka' }),
            expect.objectContaining({ family: 'Nunito' }),
            expect.objectContaining({ family: 'Baloo2' }),
          ],
        },
        autoStart: true,
        backgroundColor: 0xffb6c1,
        initialScene: 'main-menu',
        loadingScreen: {
          backgroundColor: 0xffb6c1,
          text: 'Loading Catfé Express...',
          textColor: 0x4a3728,
        },
        mount: document.querySelector('#game'),
        preload: [expect.objectContaining({ key: 'buttonIdle' }), expect.objectContaining({ key: 'buttonPressed' })],
        scenes: [mainMenuScene],
      }),
    );
  });

  it('does not auto-mount when #game is missing', async () => {
    const pixoraMock = vi.fn().mockResolvedValue({});

    vi.doMock('pixora', async () => {
      const actual = await vi.importActual<typeof import('pixora')>('pixora');

      return {
        ...actual,
        pixora: Object.assign(pixoraMock, actual.pixora),
      };
    });

    await import('./catfe-express');
    await Promise.resolve();

    expect(pixoraMock).not.toHaveBeenCalled();
  });
});
