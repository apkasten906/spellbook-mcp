import { test, expect } from 'vitest';
import { z } from 'zod';
import { validateWithZod } from '../lib/validate-args.mjs';

test('validateWithZod accepts valid data', () => {
  const schema = z.object({ name: z.string() });
  const res = validateWithZod(schema, { name: 'x' });
  expect(res.ok).toBe(true);
  expect(res.value).toEqual({ name: 'x' });
});

test('validateWithZod rejects invalid data', () => {
  const schema = z.object({ name: z.string() });
  const res = validateWithZod(schema, { name: 123 });
  expect(res.ok).toBe(false);
  expect(res.errors.length).toBeGreaterThan(0);
});
