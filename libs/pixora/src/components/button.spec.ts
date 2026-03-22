import { Sprite, Texture } from 'pixi.js';

import { Button } from './button';

describe('Button', () => {
  it('initializes text and updates disabled state', () => {
    const button = new Button({ label: 'Click Me' });

    expect(button.label.getProps().text).toBe('Click Me');
    expect(button.displayObject.eventMode).toBe('static');
    expect(button.displayObject.cursor).toBe('pointer');

    button.setDisabled(true);

    expect(button.displayObject.eventMode).toBe('none');
    expect(button.displayObject.cursor).toBe('default');
  });

  it('updates text when label prop changes', () => {
    const button = new Button({ label: 'Click Me' });

    button.updateProps({ label: 'Clicked' });
    expect(button.label.getProps().text).toBe('Clicked');
  });

  it('creates sprite background when textures are provided', () => {
    const idleTexture = Texture.WHITE;
    const button = new Button({
      label: 'Sprite',
      textures: { idle: idleTexture },
    });

    const sprite = button.background.displayObject as Sprite;
    expect(sprite.texture).toBe(idleTexture);
  });

  it('swaps texture on state change', () => {
    const idleTexture = Texture.WHITE;
    const hoveredTexture = Texture.from('hovered');
    const pressedTexture = Texture.from('pressed');

    const button = new Button({
      label: 'Sprite',
      textures: {
        idle: idleTexture,
        hovered: hoveredTexture,
        pressed: pressedTexture,
      },
    });

    const sprite = button.background.displayObject as Sprite;
    expect(sprite.texture).toBe(idleTexture);

    button.setDisabled(true);
    expect(sprite.texture).toBe(idleTexture);

    button.setDisabled(false);
    button.updateProps({ disabled: false });
  });

  it('falls back to idle texture when state texture is missing', () => {
    const idleTexture = Texture.WHITE;

    const button = new Button({
      label: 'Sprite',
      textures: { idle: idleTexture },
    });

    const sprite = button.background.displayObject as Sprite;
    expect(sprite.texture).toBe(idleTexture);

    button.setDisabled(true);
    expect(sprite.texture).toBe(idleTexture);
  });

  it('disposes tweens when button is disposed', () => {
    const button = new Button({
      animation: { durationMs: 100 },
      label: 'Test',
    });

    button.setDisabled(true);
    button.dispose();
  });
});
