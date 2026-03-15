

import { GameplayScene } from './scenes/gameplay/gameplay.scene';
import { MainMenuScene } from './scenes/main-menu/main-menu.scene';
import { PauseOverlay } from './scenes/pause-overlay/pause-overlay.scene';

import type { Disposable, PixynApp, Viewport } from 'pixyn';
import { createPixynApp } from 'pixyn';

import './app.element.css';

type SceneChangePayload = {
  nextScene: string;
  previousScene: string | null;
};

export class AppElement extends HTMLElement {
  private readonly sceneSubscriptions = new Set<Disposable>();
  private runtime?: PixynApp;

  connectedCallback() {
    if (!this.hasChildNodes()) {
      this.renderShell();
    }

    void this.bootstrap();
  }

  disconnectedCallback() {
    for (const subscription of this.sceneSubscriptions) {
      subscription.dispose();
    }

    this.sceneSubscriptions.clear();

    if (this.runtime) {
      void this.runtime.destroy();
      this.runtime = undefined;
    }
  }

  private async bootstrap(): Promise<void> {
    if (this.runtime) {
      return;
    }

    const stageHost = this.querySelector<HTMLElement>('[data-stage-host]');
    const sceneName = this.querySelector<HTMLElement>('[data-scene-name]');
    const overlayList = this.querySelector<HTMLElement>('[data-overlay-list]');
    const viewportLabel = this.querySelector<HTMLElement>('[data-viewport]');

    if (!stageHost || !sceneName || !overlayList || !viewportLabel) {
      return;
    }

    this.runtime = await createPixynApp({
      autoStart: false,
      backgroundColor: 0x172033,
      initialScene: 'main-menu',
      mount: stageHost,
      scenes: [
        {
          create: () => new MainMenuScene(),
          key: 'main-menu',
        },
        {
          create: () => new GameplayScene(),
          key: 'gameplay',
        },
        {
          create: () => new PauseOverlay(),
          key: 'pause-overlay',
          kind: 'overlay',
        },
      ],
    });

    this.sceneSubscriptions.add(
      this.runtime.context.events.on('scene.changed', (payload) => {
        const change = payload as SceneChangePayload;

        sceneName.textContent = change.nextScene;
      }),
    );
    this.sceneSubscriptions.add(
      this.runtime.context.events.on('overlay.shown', (payload) => {
        const event = payload as { overlay: string };
        const items = overlayList.textContent ? overlayList.textContent.split(', ').filter(Boolean) : [];

        items.push(event.overlay);
        overlayList.textContent = items.join(', ');
      }),
    );
    this.sceneSubscriptions.add(
      this.runtime.context.events.on('overlay.hidden', (payload) => {
        const event = payload as { overlay: string };
        const items = overlayList.textContent ? overlayList.textContent.split(', ').filter(Boolean) : [];
        const filtered = items.filter((item) => item !== event.overlay);

        overlayList.textContent = filtered.length > 0 ? filtered.join(', ') : 'none';
      }),
    );
    this.sceneSubscriptions.add(
      this.runtime.context.viewport.subscribe((viewport) => {
        viewportLabel.textContent = `${viewport.width} x ${viewport.height} ${viewport.orientation}`;
      }),
    );

    viewportLabel.textContent = this.formatViewport(this.runtime.context.viewport.get());
    sceneName.textContent = this.runtime.context.scenes.getActiveSceneKey() ?? 'booting';

    await this.runtime.start();
    sceneName.textContent = this.runtime.context.scenes.getActiveSceneKey() ?? 'main-menu';
  }

  private formatViewport(viewport: Viewport): string {
    return `${viewport.width} x ${viewport.height} ${viewport.orientation}`;
  }

  private renderShell(): void {
    this.innerHTML = `
      <main class="shell">
        <section class="panel hero">
          <div>
            <p class="eyebrow">Pixyn example app</p>
            <h1>Phase 8 example app MVP.</h1>
            <p class="lede">
              The app now builds a real menu, gameplay scene, and pause overlay using Pixyn primitives.
            </p>
          </div>
          <div class="status-grid">
            <article class="status-card">
              <span class="status-label">Active scene</span>
              <strong data-scene-name>booting</strong>
            </article>
            <article class="status-card">
              <span class="status-label">Overlays</span>
              <strong data-overlay-list>none</strong>
            </article>
            <article class="status-card">
              <span class="status-label">Viewport</span>
              <strong data-viewport>pending</strong>
            </article>
            <article class="status-card">
              <span class="status-label">Runtime</span>
              <strong>Pixi + Pixyn MVP</strong>
            </article>
          </div>
        </section>

        <section class="panel split-panel">
          <div>
            <div class="section-heading">
              <p class="eyebrow">Canvas stage</p>
              <h2>Pixyn MVP integration</h2>
            </div>
            <p class="copy-block">
              Interact with the canvas to test the scene navigation, buttons, and responsive layout.
            </p>
          </div>
          <div>
            <div class="stage-shell">
              <div class="stage-host" data-stage-host></div>
            </div>
          </div>
        </section>
      </main>
    `;
  }
}

if (!customElements.get('app-root')) {
  customElements.define('app-root', AppElement);
}
