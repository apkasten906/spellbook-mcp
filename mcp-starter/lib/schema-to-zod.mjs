import { z } from 'zod';

// Minimal JSON-schema-like -> Zod converter supporting object properties,
// required, string/boolean/number, and enum.
export function jsonSchemaToZod(schema = {}) {
  if (!schema || schema.type !== 'object') {
    // For primitive schemas, return a permissive z.any
    return z.any();
  }

  const props = schema.properties || {};
  const required = new Set(schema.required || []);

  const shape = {};
  for (const [k, v] of Object.entries(props)) {
    let ztype = z.any();
    if (v.type === 'string') {
      ztype = z.string();
      if (v.enum) ztype = z.enum(v.enum);
    } else if (v.type === 'boolean') {
      ztype = z.boolean();
    } else if (v.type === 'number' || v.type === 'integer') {
      ztype = z.number();
    } else if (v.type === 'object') {
      ztype = jsonSchemaToZod(v);
    } else if (v.type === 'array') {
      const items = v.items ? jsonSchemaToZod(v.items) : z.any();
      ztype = z.array(items);
    }

    if (!required.has(k)) {
      ztype = ztype.optional();
    }
    if (v.default !== undefined) {
      ztype = ztype.default(v.default);
    }
    shape[k] = ztype;
  }

  return z.object(shape);
}
