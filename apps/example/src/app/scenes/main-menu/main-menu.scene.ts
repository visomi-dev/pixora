import { applyLayout, Button, layout, Panel, Scene, TextNode } from 'pixora';
import type { Viewport } from 'pixora';

export class MainMenuScene extends Scene {
  readonly key = 'main-menu';

  private readonly backdrop = new Panel();
  private readonly menu = new Panel();
  private readonly title = new TextNode({
    style: {
      fill: '#fff8ef',
      fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
      fontSize: 64,
      fontWeight: '600',
    },
    text: 'pixora Demo',
  });
  private readonly playButton = new Button({
    backgroundColor: 0xef8d5e,
    label: 'Play Game',
    onPress: () => {
      void this.getContext().scenes.goTo('gameplay');
    },
    width: 200,
  });

  override mount(): void {
    this.root.addChild(this.backdrop.displayObject, this.menu.displayObject);

    this.menu.addChild(this.title);
    this.menu.addChild(this.playButton);
  }

  override resize(viewport: Viewport): void {
    this.backdrop.updateProps({
      backgroundColor: 0x172033,
      height: viewport.height,
      width: viewport.width,
    });

    applyLayout(
      this.menu,
      layout.stack({
        align: 'center',
        direction: 'vertical',
        fitContent: true,
        gap: 48,
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
        offsetY: -viewport.height * 0.1,
      }),
      { height: viewport.height, width: viewport.width, x: 0, y: 0 },
      viewport,
    );
  }
}
