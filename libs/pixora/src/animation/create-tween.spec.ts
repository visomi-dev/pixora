import { createTween, createTransition } from './create-tween';

describe('createTween', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls onUpdate with interpolated values', () => {
    const updates: number[] = [];
    const tween = createTween({
      durationMs: 100,
      from: 0,
      onUpdate: (value) => updates.push(value),
      to: 100,
    });

    vi.advanceTimersByTime(150);
    tween.dispose();

    expect(updates.length).toBeGreaterThan(0);
    expect(updates[0]).toBeCloseTo(0, 0);
    expect(updates[updates.length - 1]).toBeCloseTo(100, 0);
  });

  it('respects delayMs option', () => {
    const updates: number[] = [];
    const tween = createTween({
      delayMs: 50,
      durationMs: 100,
      from: 0,
      onUpdate: (value) => updates.push(value),
      to: 100,
    });

    vi.advanceTimersByTime(30);
    expect(updates).toHaveLength(0);

    vi.advanceTimersByTime(50);
    tween.dispose();

    expect(updates.length).toBeGreaterThan(0);
  });

  it('calls onComplete when finished', () => {
    const onComplete = vi.fn();
    const tween = createTween({
      durationMs: 100,
      from: 0,
      onComplete,
      onUpdate: vi.fn(),
      to: 100,
    });

    vi.advanceTimersByTime(200);
    tween.dispose();

    expect(onComplete).toHaveBeenCalled();
  });

  it('disposes without calling onComplete if not finished', () => {
    const onComplete = vi.fn();
    const tween = createTween({
      durationMs: 100,
      from: 0,
      onComplete,
      onUpdate: vi.fn(),
      to: 100,
    });

    vi.advanceTimersByTime(50);
    tween.dispose();
    vi.advanceTimersByTime(200);

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('can be disposed multiple times safely', () => {
    const tween = createTween({
      durationMs: 100,
      from: 0,
      onUpdate: vi.fn(),
      to: 100,
    });

    tween.dispose();
    tween.dispose();
  });

  it('applies ease-in easing', () => {
    const updates: number[] = [];
    const tween = createTween({
      durationMs: 100,
      easing: 'ease-in',
      from: 0,
      onUpdate: (value) => updates.push(value),
      to: 100,
    });

    vi.advanceTimersByTime(150);
    tween.dispose();

    const halfwayIndex = Math.floor(updates.length / 2);
    expect(updates[halfwayIndex]).toBeLessThan(50);
  });

  it('applies ease-out easing', () => {
    const updates: number[] = [];
    const tween = createTween({
      durationMs: 100,
      easing: 'ease-out',
      from: 0,
      onUpdate: (value) => updates.push(value),
      to: 100,
    });

    vi.advanceTimersByTime(150);
    tween.dispose();

    const halfwayIndex = Math.floor(updates.length / 2);
    expect(updates[halfwayIndex]).toBeGreaterThan(50);
  });

  it('applies ease-in-out easing', () => {
    const updates: number[] = [];
    const tween = createTween({
      durationMs: 100,
      easing: 'ease-in-out',
      from: 0,
      onUpdate: (value) => updates.push(value),
      to: 100,
    });

    vi.advanceTimersByTime(150);
    tween.dispose();

    expect(updates.length).toBeGreaterThan(0);
  });

  it('applies linear easing', () => {
    const updates: number[] = [];
    const tween = createTween({
      durationMs: 100,
      easing: 'linear',
      from: 0,
      onUpdate: (value) => updates.push(value),
      to: 100,
    });

    vi.advanceTimersByTime(150);
    tween.dispose();

    expect(updates.length).toBeGreaterThan(0);
  });
});

describe('createTransition', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('defaults from to 0 and to to 1', () => {
    const updates: number[] = [];
    const transition = createTransition({
      durationMs: 100,
      onUpdate: (value) => updates.push(value),
    });

    vi.advanceTimersByTime(150);
    transition.dispose();

    expect(updates[0]).toBeCloseTo(0, 1);
    expect(updates[updates.length - 1]).toBeCloseTo(1, 1);
  });

  it('uses custom from and to values', () => {
    const updates: number[] = [];
    const transition = createTransition({
      durationMs: 100,
      from: 10,
      onUpdate: (value) => updates.push(value),
      to: 20,
    });

    vi.advanceTimersByTime(150);
    transition.dispose();

    expect(updates[0]).toBeCloseTo(10, 1);
    expect(updates[updates.length - 1]).toBeCloseTo(20, 1);
  });

  it('respects delayMs option', () => {
    const updates: number[] = [];
    const transition = createTransition({
      delayMs: 50,
      durationMs: 100,
      onUpdate: () => updates.push(1),
    });

    vi.advanceTimersByTime(30);
    expect(updates).toHaveLength(0);

    vi.advanceTimersByTime(60);
    transition.dispose();
  });

  it('disposes cleanly', () => {
    const transition = createTransition({
      durationMs: 100,
      onUpdate: vi.fn(),
    });

    transition.dispose();
    transition.dispose();
  });
});
