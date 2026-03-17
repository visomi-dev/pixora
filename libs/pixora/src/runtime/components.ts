import type { AnyPixoraComponent, PixoraComponent, PixoraComponentProps } from './types';

type ComponentRegistry = Map<string | symbol, AnyPixoraComponent>;

const globalRegistry: ComponentRegistry = new Map();

export function registerComponent<Props extends PixoraComponentProps>(
  name: string | symbol,
  component: PixoraComponent<Props>,
): void {
  globalRegistry.set(name, component);
}

export function getComponent(name: string | symbol): AnyPixoraComponent | undefined {
  return globalRegistry.get(name);
}

export function hasComponent(name: string | symbol): boolean {
  return globalRegistry.has(name);
}

export function unregisterComponent(name: string | symbol): boolean {
  return globalRegistry.delete(name);
}

export function clearComponents(): void {
  globalRegistry.clear();
}

export function resolveComponent(type: AnyPixoraComponent | string | symbol): AnyPixoraComponent | undefined {
  if (typeof type === 'function') {
    return type;
  }

  return getComponent(type);
}

export function isComponentType(type: unknown): boolean {
  return typeof type === 'function';
}

export function createComponent<Props extends PixoraComponentProps>(
  component: PixoraComponent<Props>,
): PixoraComponent<Props> {
  return component;
}
