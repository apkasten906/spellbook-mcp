import { test, expect } from 'vitest';

import { planSdlc } from '../lib/sdlc-orchestrator.mjs';

test('planSdlc returns default phases and toolCalls', () => {
  const res = planSdlc({ goal: 'example-service' });
  expect(res).toBeTruthy();
  expect(res.goal).toBe('example-service');
  expect(Array.isArray(res.plan)).toBe(true);
  // expect at least requirements and maintenance phases
  const phases = res.plan.map((p) => p.phase);
  expect(phases).toContain('requirements');
  expect(phases).toContain('maintenance');
  // toolCalls exist for some phases
  const hasToolCalls = res.plan.some((p) => Array.isArray(p.toolCalls) && p.toolCalls.length > 0);
  expect(hasToolCalls).toBe(true);
  // verify artifact filenames follow pattern: goal-phase-<shortsha|ISOdate>
  const artifactRegex = /^.+-requirements-(?:[0-9a-f]{7,}|\d{8}T\d{6}Z)\.md$/i;
  const art = res.plan.find((p) => p.phase === 'requirements')?.artifact;
  expect(typeof art).toBe('string');
  expect(artifactRegex.test(art)).toBe(true);
});
