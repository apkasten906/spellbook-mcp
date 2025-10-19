import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

export function writeFiles(cwd, files = []) {
  for (const f of files) {
    const abs = path.resolve(cwd, f.path);
    ensureDirForFile(abs);
    fs.writeFileSync(abs, f.content, 'utf8');
  }
}

export function hasGitRepo(cwd) {
  try {
    const out = execSync('git rev-parse --is-inside-work-tree', { cwd, stdio: 'pipe' })
      .toString()
      .trim();
    return out === 'true';
  } catch {
    return false;
  }
}

export function initGitIfNeeded(cwd) {
  if (!hasGitRepo(cwd)) {
    execSync('git init', { cwd, stdio: 'inherit' });
  }
}

export function gitCommit(cwd, message) {
  execSync('git add -A', { cwd, stdio: 'inherit' });
  try {
    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd, stdio: 'inherit' });
  } catch {
    // commit may fail if no changes; that's okay
  }
}

export function gitCreateBranch(cwd, branch) {
  if (!branch) return;
  try {
    execSync(`git checkout -B ${branch}`, { cwd, stdio: 'inherit' });
  } catch {
    // ignore
  }
}

export function gitHasRemoteOrigin(cwd) {
  try {
    execSync('git remote get-url origin', { cwd, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function gitPush(cwd, branch) {
  if (!gitHasRemoteOrigin(cwd)) return { pushed: false, reason: 'no-remote' };
  try {
    execSync(`git push -u origin ${branch}`, { cwd, stdio: 'inherit' });
    return { pushed: true };
  } catch (e) {
    return { pushed: false, error: String(e) };
  }
}

export function commitAndPush(cwd, { files = [], branch = null, message = 'auto commit' } = {}) {
  writeFiles(cwd, files);
  initGitIfNeeded(cwd);
  gitCreateBranch(cwd, branch || 'main');
  gitCommit(cwd, message);
  const pushRes = gitPush(cwd, branch || 'main');
  return { ok: true, push: pushRes };
}
