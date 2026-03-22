import { pixora } from 'pixora';

import fredoka from '../assets/fonts/Fredoka.ttf'; // buttons, titles, main ui
import nunito from '../assets/fonts/Nunito.ttf'; // secondary texts
import baloo2 from '../assets/fonts/Baloo2.ttf'; // numbers, money, score

import { mainMenuScene } from './scenes/main-menu-scene';

async function mount(root: HTMLElement): Promise<void> {
  await pixora({
    assets: {
      fonts: [
        { family: 'Fredoka', src: fredoka },
        { family: 'Nunito', src: nunito },
        { family: 'Baloo2', src: baloo2 },
      ],
    },
    autoStart: true,
    backgroundColor: 0xffb6c1,
    devtools: import.meta.env?.DEV ?? import.meta.env?.MODE === 'development',
    initialScene: 'main-menu',
    mount: root,
    scenes: [mainMenuScene],
  });
}

const root = document.querySelector<HTMLElement>('#game');

if (root) {
  mount(root);
}
