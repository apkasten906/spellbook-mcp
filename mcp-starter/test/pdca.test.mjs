import { test, expect } from 'vitest';

import { generatePdca } from '../lib/pdca.mjs';

test('pdca generates markdown with expected fields', () => {
  const md = generatePdca({ phase: 'plan', artifact: 'feature-x', scope: 'feature', metrics: 'p95', risk: 'med' });
  expect(md).toContain('# PDCA · PLAN · feature-x');
  expect(md).toContain('**Scope:** feature');
  expect(md).toContain('**Risk:** med');
});
