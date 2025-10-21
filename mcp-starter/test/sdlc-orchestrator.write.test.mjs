import fs from 'fs';
import os from 'os';
import path from 'path';
import { execSync } from 'child_process';

import { test, expect } from 'vitest';

import { planSdlc } from '../lib/sdlc-orchestrator.mjs';
import { commitAndPush } from '../lib/git-ops.mjs';

function initTempGitRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdlc-write-test-'));
  execSync('git init -q', { cwd: dir });
  // set user config to allow commits
  execSync('git config user.email test@example.com', { cwd: dir });
  execSync('git config user.name test', { cwd: dir });
  return dir;
}

test('sdlc write flow creates files and commits locally', () => {
  const cwd = initTempGitRepo();
  const goal = 'Example Service';
  const plan = planSdlc({ goal, phases: ['requirements'], cwd });
  // prepare files same way server does
  const files = [];
  for (const p of plan.plan) {
    if (!p.artifact) continue;
    const artifactPath = path.resolve(cwd, p.artifact);
    const dir = path.dirname(artifactPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(artifactPath, `# ${goal} - ${p.phase}\n`);
    files.push({
      path: path.relative(cwd, artifactPath),
      content: fs.readFileSync(artifactPath, 'utf-8'),
    });
  }
  commitAndPush(cwd, { files, branch: 'test/sdlc', message: 'test commit', push: false });
  // assert files exist
  for (const f of files) {
    expect(fs.existsSync(path.resolve(cwd, f.path))).toBe(true);
  }
  // assert a commit exists
  const log = execSync('git log --oneline -n 1', { cwd }).toString('utf-8').trim();
  expect(log.length).toBeGreaterThan(0);
});
