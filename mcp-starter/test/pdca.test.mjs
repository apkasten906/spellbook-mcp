import assert from 'assert';
import { generatePdca } from '../lib/pdca.mjs';

function testBasicPdca() {
  const md = generatePdca({ phase: 'plan', artifact: 'feature-x', scope: 'feature', metrics: 'p95', risk: 'med' });
  assert.ok(md.includes('# PDCA · PLAN · feature-x'), 'header present');
  assert.ok(md.includes('**Scope:** feature'), 'scope present');
  assert.ok(md.includes('**Risk:** med'), 'risk present');
}

try {
  testBasicPdca();
  console.log('ok');
  process.exit(0);
} catch (err) {
  console.error('pdca test failed', err);
  process.exit(2);
}
