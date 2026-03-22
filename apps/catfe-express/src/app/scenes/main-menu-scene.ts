import { pixora } from 'pixora';

export const mainMenuScene = pixora.scene({
  key: 'main-menu',
  render() {
    return pixora.container(
      { x: 0, y: 0 },
      pixora.text({
        text: 'Main Menu',
        font: 'Fredoka',
      }),
    );
  },
});
