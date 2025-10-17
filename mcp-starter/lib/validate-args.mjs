import { z } from 'zod';

// Simple wrapper: accepts a Zod schema or a JSON-schema-like object and returns
// { ok: true, value } or { ok: false, errors }
export function validateWithZod(schema, data) {
  if (!schema) return { ok: true, value: data };
  try {
    const result = schema.parse(data);
    return { ok: true, value: result };
  } catch (e) {
    return { ok: false, errors: e.errors || [{ message: e.message }] };
  }
}
