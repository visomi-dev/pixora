import { BaseNode } from '../components/base-node';
import { signal, type ReadonlySignal } from '../state/signal';

export type EntityOptions<State> = {
  id: string;
  initialState: State;
  node: BaseNode;
};

export class Entity<State = unknown> {
  private readonly stateSignal: ReturnType<typeof signal<State>>;
  readonly id: string;
  readonly node: BaseNode;
  readonly state: ReadonlySignal<State>;

  constructor(options: EntityOptions<State>) {
    this.id = options.id;
    this.node = options.node;
    this.stateSignal = signal(options.initialState);
    this.state = this.stateSignal.asReadonly();
  }

  destroy(): void {
    this.node.destroy();
  }

  getState(): State {
    return this.stateSignal.get();
  }

  setState(next: State): void {
    this.stateSignal.set(next);
  }

  update(_deltaMs: number): void {
    return;
  }
}
