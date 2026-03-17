import type { PixoraChild, PixoraNode } from './types';
import { isPixoraNode } from './types';

/**
 * Normalizes a flexible children input into a flat array of `PixoraNode` objects.
 *
 * - `PixoraNode` values pass through as-is.
 * - `string` values are wrapped as `{ type: 'text', props: { text: value } }`.
 * - `number` values are converted to string, then wrapped as text nodes.
 * - `boolean`, `null`, and `undefined` values are filtered out.
 * - Nested arrays are recursively flattened.
 */
export function normalizeChildren(children: readonly PixoraChild[]): readonly PixoraNode[] {
  const result: PixoraNode[] = [];

  flattenInto(children, result);

  return result;
}

function flattenInto(children: readonly PixoraChild[], result: PixoraNode[]): void {
  for (const child of children) {
    if (child === null || child === undefined || typeof child === 'boolean') {
      continue;
    }

    if (typeof child === 'string') {
      result.push(createTextNode(child));

      continue;
    }

    if (typeof child === 'number') {
      result.push(createTextNode(String(child)));

      continue;
    }

    if (Array.isArray(child)) {
      flattenInto(child as readonly PixoraChild[], result);

      continue;
    }

    if (isPixoraNode(child)) {
      result.push(child);
    }
  }
}

function createTextNode(text: string): PixoraNode<'text'> {
  return Object.freeze({
    children: Object.freeze([]),
    key: undefined,
    props: Object.freeze({ text }),
    type: 'text' as const,
  });
}
