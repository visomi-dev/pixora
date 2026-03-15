import { applyLayout, Button, layout, Panel, Scene, TextNode } from 'pixyn';
import type { Viewport } from 'pixyn';

export class PauseOverlay extends Scene {
  readonly key = 'pause-overlay';

  private readonly backdrop = new Panel();
  private readonly menu = new Panel();
  private readonly title = new TextNode({
    style: {
      fill: '#ffffff',
      fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
      fontSize: 64,
      fontWeight: '600',
    },
    text: 'Paused',
  });
  private readonly resumeButton = new Button({
    backgroundColor: 0xef8d5e,
    label: 'Resume',
    onPress: () => {
      this.getContext().scenes.hideOverlay('pause-overlay');
    },
    width: 200,
  });
  private readonly quitButton = new Button({
    backgroundColor: 0x31516b,
    label: 'Quit to Menu',
    onPress: () => {
      this.getContext().scenes.hideOverlay('pause-overlay');
      void this.getContext().scenes.goTo('main-menu');
    },
    width: 200,
  });

  override mount(): void {
    this.root.addChild(this.backdrop.displayObject, this.menu.displayObject);

    this.menu.addChild(this.title);
    this.menu.addChild(this.resumeButton);
    this.menu.addChild(this.quitButton);
  }

  override resize(viewport: Viewport): void {
    this.backdrop.updateProps({
      alpha: 0.85,
      backgroundColor: 0x0f172a,
      height: viewport.height,
      width: viewport.width,
    });

    applyLayout(
      this.menu,
      layout.stack({
        align: 'center',
        direction: 'vertical',
        fitContent: true,
        gap: 24,
        padding: 48,
      }),
      { height: viewport.height, width: viewport.width, x: 0, y: 0 },
      viewport,
    );

    applyLayout(
      this.menu,
      layout.anchor({
        horizontal: 'center',
        vertical: 'center',
      }),
      { height: viewport.height, width: viewport.width, x: 0, y: 0 },
      viewport,
    );
  }
}
