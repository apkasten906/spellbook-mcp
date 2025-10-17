import path from 'path';

import { test, expect } from 'vitest';

import { generateDueCheck } from '../lib/due_check.mjs';

test('due_check generates report and markdown', async () => {
  const promptsRoot = path.resolve(new URL('..', import.meta.url).pathname, '..');
  const { report, md } = await generateDueCheck(promptsRoot, { path: '.', format: 'md' });
  expect(report.path).toBeTruthy();
  expect(md).toContain('# Due Diligence Report');
});
