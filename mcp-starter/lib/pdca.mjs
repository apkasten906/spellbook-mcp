export function generatePdca(opts = {}) {
  const { phase, artifact, scope = 'feature', metrics = '', risk = 'low' } = opts;
  if (!phase) throw new Error('phase is required');
  if (!artifact) throw new Error('artifact is required');

  let phaseSection = '';
  switch (phase) {
    case 'plan':
      phaseSection = `## Hypothesis\n- …\n\n## Metrics\n- …\n\n## Risks & Mitigations\n- …\n`;
      break;
    case 'do':
      phaseSection = `## Change Set\n- …\n\n## Test Evidence\n- …\n\n## Rollback Plan\n- …\n`;
      break;
    case 'check':
      phaseSection = `## Findings\n- …\n\n## Data (table/snippets)\n- …\n\n## Decision\n- Proceed / Adjust / Rollback (why)\n`;
      break;
    case 'act':
      phaseSection = `## Actions\n- Owner: …  Due: …\n- …\n\n## Runbook / Prompt Updates\n- …\n`;
      break;
    default:
      phaseSection = `## Notes\n- …\n`;
  }

  const md = `# PDCA · ${String(phase).toUpperCase()} · ${artifact}\n\n**Scope:** ${scope}  |  **Risk:** ${risk}  |  **Metrics:** ${metrics || '—'}\n\n${phaseSection}\n`;
  return md;
}
