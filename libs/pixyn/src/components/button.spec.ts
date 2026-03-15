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
});
