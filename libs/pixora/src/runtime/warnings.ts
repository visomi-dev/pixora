export enum WarningCode {
  DEPRECATED_API = 'PIXORA_DEPRECATED_API',
  INVALID_CHILD = 'PIXORA_INVALID_CHILD',
  INVALID_KEY = 'PIXORA_INVALID_KEY',
  INVALID_PROP = 'PIXORA_INVALID_PROP',
  MISSING_REQUIRED_PROP = 'PIXORA_MISSING_REQUIRED_PROP',
  UNKNOWN_HOST_TYPE = 'PIXORA_UNKNOWN_HOST_TYPE',
}

export type WarningOptions = {
  code: WarningCode;
  message: string;
  node?: unknown;
  payload?: Record<string, unknown>;
};

export type WarningHandler = (options: WarningOptions) => void;

let warningHandler: WarningHandler | null = null;

export function setWarningHandler(handler: WarningHandler): void {
  warningHandler = handler;
}

export function getWarningHandler(): WarningHandler | null {
  return warningHandler;
}

export function warn(options: WarningOptions): void {
  const message = `[${options.code}] ${options.message}`;

  if (warningHandler) {
    warningHandler(options);
  } else if (typeof console !== 'undefined' && console.warn) {
    console.warn(message, options.payload ?? '');
  }
}

export function warnDeprecated(message: string, payload?: Record<string, unknown>): void {
  warn({
    code: WarningCode.DEPRECATED_API,
    message,
    payload,
  });
}

export function warnInvalidChild(parentType: string, childType: string, index: number): void {
  warn({
    code: WarningCode.INVALID_CHILD,
    message: `Invalid child type "${childType}" at index ${index} in "${parentType}". Expected a valid PixoraNode or primitive.`,
    payload: { parentType, childType, index },
  });
}

export function warnInvalidKey(key: string | number): void {
  warn({
    code: WarningCode.INVALID_KEY,
    message: `Invalid or duplicate key "${key}". Keys must be unique within their parent.`,
    payload: { key },
  });
}

export function warnInvalidProp(hostType: string, propName: string): void {
  warn({
    code: WarningCode.INVALID_PROP,
    message: `Unknown prop "${propName}" for host type "${hostType}". This prop will be ignored.`,
    payload: { hostType, propName },
  });
}

export function warnMissingRequiredProp(hostType: string, propName: string): void {
  warn({
    code: WarningCode.MISSING_REQUIRED_PROP,
    message: `Missing required prop "${propName}" for host type "${hostType}".`,
    payload: { hostType, propName },
  });
}

export function warnUnknownHostType(type: string): void {
  warn({
    code: WarningCode.UNKNOWN_HOST_TYPE,
    message: `Unknown host type "${type}". Valid types are: container, sprite, text`,
    payload: { type },
  });
}

const VALID_HOST_TYPES = new Set(['container', 'sprite', 'text']);

export function validateHostType(type: unknown): boolean {
  return typeof type === 'string' && VALID_HOST_TYPES.has(type);
}

export function validateKey(key: unknown): key is string | number {
  return typeof key === 'string' || typeof key === 'number';
}

export function validateProps(props: unknown, hostType: string): string[] {
  const warnings: string[] = [];

  if (typeof props !== 'object' || props === null) {
    return warnings;
  }

  const validProps = getValidPropsForType(hostType);

  for (const key of Object.keys(props as Record<string, unknown>)) {
    if (!validProps.has(key)) {
      warnings.push(key);
    }
  }

  return warnings;
}

function getValidPropsForType(hostType: string): Set<string> {
  const baseProps = new Set([
    'children',
    'key',
    'label',
    'onPointerDown',
    'onPointerOut',
    'onPointerOver',
    'onPointerTap',
    'onPointerUp',
    'style',
  ]);

  switch (hostType) {
    case 'container':
      return baseProps;
    case 'text':
      return new Set([...baseProps, 'anchor', 'content']);
    case 'sprite':
      return new Set([...baseProps, 'anchor', 'asset', 'texture']);
    default:
      return baseProps;
  }
}
