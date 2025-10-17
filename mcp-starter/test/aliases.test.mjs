import { test, expect } from 'vitest';
import { normalizeToolName } from '../lib/aliases.mjs';

test('normalize known dotted alias', () => {
  expect(normalizeToolName('prompt.read')).toBe('prompt_read');
});

test('normalize dotted generically', () => {
  expect(normalizeToolName('foo.bar.baz')).toBe('foo_bar_baz');
});
