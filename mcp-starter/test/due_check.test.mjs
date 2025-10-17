import path from 'path';
import assert from 'assert';

import { generateDueCheck } from '../lib/due_check.mjs';

async function testDueCheckBasic() {
  const promptsRoot = path.resolve(new URL('..', import.meta.url).pathname, '..');
  const { report, md } = await generateDueCheck(promptsRoot, { path: '.', format: 'md' });
  assert.ok(report.path, 'report.path present');
  assert.ok(typeof md === 'string' && md.includes('# Due Diligence Report'), 'md generated');
}

testDueCheckBasic()
  .then(() => {
    console.log('ok');
    process.exit(0);
  })
  .catch((e) => {
    console.error('due_check test failed', e);
    process.exit(2);
  });
