# Animation Spec

## Goal

Provide the minimum animation layer needed for menu polish, feedback, and scene transitions.

## Responsibilities

- interpolate numeric values over time;
- manage tween lifecycle;
- provide simple enter and exit helpers;
- support button feedback and overlay transitions.

## API direction

```ts
type TweenOptions = {
  from: number;
  to: number;
  durationMs: number;
  easing?: string;
  delayMs?: number;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
};

type Tween = Disposable;

const tween = createTween({
  from: 0,
  to: 1,
  durationMs: 200,
  easing: 'ease-out',
  onUpdate: (value) => {
    panel.alpha = value;
  },
});
```

`createTransition` is a higher-level helper that coordinates common enter and exit animations for scenes, overlays, and panels.

## Supported MVP features

- numeric tweens;
- linear and a small set of easing functions;
- delay;
- completion callback;
- cancellation through disposables;
- scene and overlay transition helpers built on top of tweens.

## Rules

- tweens are driven by the shared ticker;
- tweens must be disposable;
- starting a replacement tween may cancel a previous conflicting tween on the same property if the helper opts into that behavior;
- animation helpers must not hide expensive per-frame layout work.

## MVP deliverables

- fade and slide transitions for overlays or panels;
- scale or alpha feedback for buttons;
- simple sprite movement helpers.
