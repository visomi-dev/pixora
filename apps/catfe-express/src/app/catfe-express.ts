import { pixora } from 'pixora';

import fredoka from '../assets/fonts/Fredoka.ttf';
import nunito from '../assets/fonts/Nunito.ttf';
import baloo2 from '../assets/fonts/Baloo2.ttf';
import buttonDefault from '../assets/textures/button-default.png';
import buttonPressed from '../assets/textures/button-pressed.png';

import { mainMenuScene } from './scenes/main-menu-scene';

export async function mount(root: HTMLElement): Promise<void> {
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
    loadingScreen: {
      backgroundColor: 0xffb6c1,
      text: 'Loading Catfé Express...',
      textColor: 0x4a3728,
    },
    mount: root,
    preload: [
      { key: 'buttonDefault', src: buttonDefault },
      { key: 'buttonPressed', src: buttonPressed },
    ],
    scenes: [mainMenuScene],
  });
}

const root = document.querySelector<HTMLElement>('#game');

if (root) {
  mount(root);
}
