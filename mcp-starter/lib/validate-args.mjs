// Simple wrapper: accepts a Zod schema and returns
// { ok: true, value } or { ok: false, errors }
export function validateWithZod(schema, data) {
  if (!schema) return { ok: true, value: data };
  try {
    const result = schema.parse(data);
    return { ok: true, value: result };
  } catch (e) {
    const errs = e?.errors ?? e?.issues ?? [{ message: String(e?.message ?? e) }];
    return { ok: false, errors: errs };
  }
}
