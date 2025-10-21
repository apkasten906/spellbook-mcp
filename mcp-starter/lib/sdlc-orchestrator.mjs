import { execSync } from 'child_process';

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function getGitShortSha(cwd = process.cwd()) {
  try {
    const out = execSync('git rev-parse --short HEAD', { cwd, stdio: ['ignore', 'pipe', 'ignore'] });
    return String(out).trim();
  } catch {
    return null;
  }
}

function isoNow() {
  return new Date().toISOString().replace(/[:.]/g, '').slice(0, 15) + 'Z';
}

export function planSdlc({ scope = 'feature', goal = '', phases = null, cwd = process.cwd() } = {}) {
  const allPhases = [
    'requirements',
    'analysis',
    'architecture',
    'implementation',
    'testing',
    'deployment',
    'maintenance',
  ];
  const usePhases = Array.isArray(phases) && phases.length ? phases : allPhases;
  const goalSlug = slugify(goal || 'artifact');

  const plan = usePhases.map((p) => {
    switch (p) {
      case 'requirements':
        return {
          phase: 'requirements',
          prompt: 'prompts/v0.3.0/1_requirements_planning.md',
          toolCalls: [
            { tool: 'pdca_generate', args: { phase: 'plan', artifact: `${goal || 'work'} PDCA` } },
          ],
          artifact: `docs/PDCA/${goalSlug}-${p}.md`,
        };
      case 'analysis':
        return {
          phase: 'analysis',
          prompt: 'prompts/v0.3.0/2_analysis_specification.md',
          toolCalls: [
            { tool: 'prompt_read', args: { file: 'prompts/v0.3.0/2_analysis_specification.md' } },
          ],
          artifact: `docs/API/${goalSlug}-${p}.md`,
        };
      case 'architecture':
        return {
          phase: 'architecture',
          prompt: 'prompts/v0.3.0/3_architecture_design.md',
          toolCalls: [{ tool: 'api_scaffold', args: { name: goal || 'service' } }],
          artifact: `docs/ADR/${goalSlug}-${p}.md`,
        };
      case 'implementation':
        return {
          phase: 'implementation',
          prompt: 'prompts/v0.3.0/4_implementation_development.md',
          toolCalls: [],
          artifact: null,
        };
      case 'testing':
        return {
          phase: 'testing',
          prompt: 'prompts/v0.3.0/5_testing_quality_assurance.md',
          toolCalls: [{ tool: 'tests_plan', args: { scope: 'file', target: 'server.js' } }],
          artifact: `docs/TESTS/${goalSlug}-${p}.md`,
        };
      case 'deployment':
        return {
          phase: 'deployment',
          prompt: 'prompts/v0.3.0/6_deployment_release.md',
          toolCalls: [{ tool: 'ci_configure', args: { service: 'github', env: 'dev' } }],
          artifact: `docs/CI/${goalSlug}-${p}.yaml`,
        };
      case 'maintenance':
        return {
          phase: 'maintenance',
          prompt: 'prompts/v0.3.0/7_maintenance_monitoring.md',
          toolCalls: [{ tool: 'due_check', args: { path: '.', strict: false } }],
          artifact: `docs/RCA/${goalSlug}-${p}.md`,
        };
      default:
        return { phase: p, prompt: null, toolCalls: [], artifact: null };
    }
  });
  return { scope, goal, plan };
}

export default { planSdlc };
