import { Container } from 'pixi.js';

import { TextNode } from './text-node';
import { Panel } from './panel';
import { InteractiveComponent } from './interactive-component';

export type ButtonOptions = {
  backgroundColor?: number;
  disabled?: boolean;
  height?: number;
  label: string;
  onPress?: () => void;
  radius?: number;
  width?: number;
};

export class Button extends InteractiveComponent<ButtonOptions, Container> {
  readonly background: Panel;
  readonly label: TextNode;

  constructor(options: ButtonOptions) {
    super(new Container(), options);

    this.background = new Panel({
      backgroundColor: options.backgroundColor ?? 0x3b82f6,
      height: options.height ?? 48,
      radius: options.radius ?? 8,
      width: options.width ?? 120,
    });
    this.label = new TextNode({
      style: {
        fill: 0xffffff,
        fontFamily: 'sans-serif',
        fontSize: 16,
        fontWeight: 'bold',
      },
      text: options.label,
    });

    this.label.displayObject.anchor.set(0.5);
    this.label.displayObject.x = this.background.getProps().width! / 2;
    this.label.displayObject.y = this.background.getProps().height! / 2;

    this.addChild(this.background);
    this.addChild(this.label);

    this.displayObject.eventMode = options.disabled ? 'none' : 'static';
    this.displayObject.cursor = options.disabled ? 'default' : 'pointer';

    this.bindInteraction({
      onHoverChange: (hovered) => {
        this.displayObject.alpha = hovered && !this.props.disabled ? 0.9 : 1;
      },
      onPress: () => {
        options.onPress?.();
      },
      onPressStart: () => {
        this.displayObject.scale.set(0.96);
      },
      onPressEnd: () => {
        this.displayObject.scale.set(1);
      },
    });

    this.setDisabled(options.disabled ?? false);
  }

  protected override onPropsChanged(): void {
    super.onPropsChanged();
    this.label.setText(this.props.label);
    this.background.updateProps({
      backgroundColor: this.props.backgroundColor,
      height: this.props.height,
      radius: this.props.radius,
      width: this.props.width,
    });

    this.label.displayObject.x = (this.props.width ?? 120) / 2;
    this.label.displayObject.y = (this.props.height ?? 48) / 2;
  }
}
