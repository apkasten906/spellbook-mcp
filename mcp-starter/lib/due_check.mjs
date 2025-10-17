import path from 'path';
import fg from 'fast-glob';

export async function generateDueCheck(promptsRoot, args = {}) {
  const base = args.path ? path.resolve(promptsRoot, args.path) : path.resolve(promptsRoot);

  // Prevent path escaping the base
  const rel = path.relative(promptsRoot, base);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error('Path escapes base directory');
  }

  const strict = !!args.strict;
  const format = args.format || 'md';

  const patterns = [
    '**/*.{test,spec}.{js,jsx,ts,tsx}',
    '**/README.md',
    '**/CHANGELOG.md',
    '**/.github/**/*',
  ];
  const found = {};
  for (const p of patterns) {
    const files = await fg(p, { cwd: base, dot: true, onlyFiles: true });
    found[p] = files.length;
  }

  const report = {
    path: base,
    checks: {
      tests_present: found['**/*.{test,spec}.{js,jsx,ts,tsx}'] > 0,
      readme_present: found['**/README.md'] > 0,
      changelog_present: found['**/CHANGELOG.md'] > 0,
      github_meta: found['**/.github/**/*'] > 0,
    },
    notes: strict ? ['Strict mode: enforce all checks before merge.'] : [],
  };

  const md = `# Due Diligence Report\n\n**Path:** ${report.path}\n\n- Tests present: ${report.checks.tests_present ? '✅' : '❌'}\n- README present: ${report.checks.readme_present ? '✅' : '❌'}\n- CHANGELOG present: ${report.checks.changelog_present ? '✅' : '❌'}\n- .github meta present: ${report.checks.github_meta ? '✅' : '❌'}\n\n${strict ? '> **Strict:** all checks required before merge.\n' : ''}\n`;

  return { report, md, format };
}
