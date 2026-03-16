import { applyLayout, Box, Button, layout, Scene, TextNode } from 'pixora';
import type { Viewport } from 'pixora';

export class InstructionsScene extends Scene {
  readonly key = 'instructions';

  private readonly background = new Box();
  private readonly container = new Box();

  private readonly title = new TextNode({
    style: {
      fill: '#00ffaa',
      fontFamily: 'Orbitron, sans-serif',
      fontSize: 48,
      fontWeight: '900',
    },
    text: 'INSTRUCTIONS',
  });

  private readonly controlsTitle = new TextNode({
    style: {
      fill: '#ff00aa',
      fontFamily: 'Orbitron, sans-serif',
      fontSize: 24,
      fontWeight: 'bold',
    },
    text: 'CONTROLS',
  });

  private readonly controls = new TextNode({
    style: {
      fill: '#ffffff',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 16,
    },
    text: '← → or A/D - Move Ship\nSPACE - Fire\nP - Pause\nESC - Pause',
  });

  private readonly powerUpsTitle = new TextNode({
    style: {
      fill: '#ff00aa',
      fontFamily: 'Orbitron, sans-serif',
      fontSize: 24,
      fontWeight: 'bold',
    },
    text: 'POWER-UPS',
  });

  private readonly powerUps = new TextNode({
    style: {
      fill: '#ffffff',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 16,
    },
    text: '⚡ Speed Boost - Move faster\n🛡️ Shield - Invincibility\n🔥 Triple Shot - Fire 3 bullets\n💣 Smart Bomb - Clear row',
  });

  private readonly tipsTitle = new TextNode({
    style: {
      fill: '#ff00aa',
      fontFamily: 'Orbitron, sans-serif',
      fontSize: 24,
      fontWeight: 'bold',
    },
    text: 'TIPS',
  });

  private readonly tips = new TextNode({
    style: {
      fill: '#ffffff',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 16,
    },
    text: '• Combo kills for score multipliers\n• Destroy enemies quickly for bonus points\n• Watch for falling power-ups\n• Each level gets harder!',
  });

  private readonly backButton = new Button({
    backgroundColor: 0x00ffaa,
    label: 'BACK',
    onPress: () => {
      void this.getContext().scenes.goTo('main-menu');
    },
    width: 200,
    height: 56,
  });

  constructor() {
    super();
  }

  override mount(): void {
    this.root.addChild(this.background.displayObject);
    this.root.addChild(this.container.displayObject);

    this.container.addChild(this.title);
    this.container.addChild(this.controlsTitle);
    this.container.addChild(this.controls);
    this.container.addChild(this.powerUpsTitle);
    this.container.addChild(this.powerUps);
    this.container.addChild(this.tipsTitle);
    this.container.addChild(this.tips);
    this.container.addChild(this.backButton);
  }

  override resize(viewport: Viewport): void {
    this.background.updateProps({
      backgroundColor: 0x0a0a1a,
      height: viewport.height,
      width: viewport.width,
    });

    applyLayout(
      this.container,
      layout.stack({
        align: 'center',
        direction: 'vertical',
        fitContent: true,
        gap: 16,
        padding: 32,
      }),
      { height: viewport.height, width: viewport.width, x: 0, y: 0 },
      viewport,
    );

    applyLayout(
      this.container,
      layout.anchor({
        horizontal: 'center',
        vertical: 'center',
      }),
      { height: viewport.height, width: viewport.width, x: 0, y: 0 },
      viewport,
    );
  }
}
