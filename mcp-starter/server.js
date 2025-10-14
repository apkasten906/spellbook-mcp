#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import url from 'url';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import fg from 'fast-glob';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const promptsRoot = path.resolve(__dirname, '..');

function assertInside(base, candidate) {
  const rel = path.relative(base, candidate);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new McpError(ErrorCode.InvalidParams, 'Path escapes base directory');
  }
}

// Create server instance
const server = new Server(
  {
    name: 'spellbook-mcp',
    version: '0.3.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const shutdown = async (signal) => {
  console.error(`Received ${signal}. Shutting down...`);
  try {
    await server?.close?.();
  } finally {
    process.exit(0);
  }
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Define tools
const tools = [
  {
    name: 'prompt_read',
    description:
      'Read a prompt template by relative path (e.g., prompts/v0.3.0/1_requirements_planning.md).',
    inputSchema: {
      type: 'object',
      properties: {
        file: { type: 'string' },
      },
      required: ['file'],
    },
  },
  {
    name: 'prompt_list',
    description: 'List available prompt templates (markdown) under a base folder.',
    inputSchema: {
      type: 'object',
      properties: {
        base: { type: 'string', default: '.' },
      },
    },
  },
  {
    name: 'prompt_commands',
    description: 'List slash-style commands for quick prompting.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

tools.push(
  {
    name: 'pdca_generate',
    description: 'Generate a PDCA (Deming) artifact for a phase.',
    inputSchema: {
      type: 'object',
      properties: {
        phase: { type: 'string', enum: ['plan', 'do', 'check', 'act'] },
        artifact: { type: 'string' },
        scope: { type: 'string', enum: ['feature', 'service', 'repo'], default: 'feature' },
        metrics: { type: 'string', description: 'CSV e.g. p95,p99,error_rate' },
        risk: { type: 'string', enum: ['low', 'med', 'high'], default: 'low' },
      },
      required: ['phase', 'artifact'],
    },
  },
  {
    name: 'due_check',
    description: 'Run SDLC due-diligence checklist against a path.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', default: '.' },
        strict: { type: 'boolean', default: false },
        format: { type: 'string', enum: ['md', 'json'], default: 'md' },
      },
    },
  },
  {
    name: 'retro_create',
    description: 'Create a retrospective skeleton for iteration/incident/release.',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['iteration', 'incident', 'release'], default: 'iteration' },
        window: { type: 'string', description: 'e.g. 7d, 30d, YYYY-MM-DD:YYYY-MM-DD' },
        include: { type: 'string', description: 'commits,issues,alerts CSV' },
      },
    },
  },
  {
    name: 'api_scaffold',
    description: 'Draft API spec + stubs.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        style: { type: 'string', enum: ['openapi', 'grpc', 'tsoa'], default: 'openapi' },
        lang: { type: 'string', enum: ['ts', 'go', 'py', 'java'], default: 'ts' },
        tests: { type: 'boolean', default: false },
        client: { type: 'boolean', default: false },
        examples: { type: 'boolean', default: true },
      },
      required: ['name'],
    },
  },
  {
    name: 'ci_configure',
    description: 'Generate a CI/CD pipeline template with gates.',
    inputSchema: {
      type: 'object',
      properties: {
        service: { type: 'string', description: 'github, azure, gitlab, circle' },
        env: { type: 'string', description: 'dev, stage, prod' },
        template: { type: 'string', enum: ['minimal', 'full'], default: 'full' },
        gates: { type: 'string', description: 'CSV: lint,test,security,perf' },
        secrets: { type: 'string', description: 'CSV of secret names' },
      },
      required: ['service', 'env'],
    },
  },
  {
    name: 'tests_plan',
    description: 'Plan tests for a file/dir/changed set.',
    inputSchema: {
      type: 'object',
      properties: {
        scope: { type: 'string', enum: ['file', 'dir', 'changed'], default: 'changed' },
        target: { type: 'string', description: 'file or dir when scope != changed' },
        type: { type: 'string', enum: ['unit', 'integration', 'property', 'e2e'], default: 'unit' },
        framework: { type: 'string', enum: ['jest', 'vitest', 'pytest', 'junit'], default: 'jest' },
        coverage: { type: 'number', description: 'target percent', default: 80 },
      },
    },
  },
  {
    name: 'rca_analyze',
    description: 'Analyze logs/diff and suggest root cause + minimal fix.',
    inputSchema: {
      type: 'object',
      properties: {
        log: { type: 'string', description: 'path to log file' },
        since: { type: 'string', description: 'iso or 1h/24h' },
        diff: { type: 'string', description: 'commit or range e.g. HEAD~10:HEAD' },
        system: { type: 'string' },
      },
    },
  },
  {
    name: 'arch_adr',
    description: 'Generate an ADR (decision, options, tradeoffs, rollback).',
    inputSchema: {
      type: 'object',
      properties: {
        system: { type: 'string' },
        adr: { type: 'string', description: 'decision title' },
        diagram: { type: 'string', enum: ['sequence', 'c4', 'dfd'] },
        nfr: { type: 'string', description: 'CSV: latency,p99,availability,...' },
      },
      required: ['system'],
    },
  }
);

// Handler for listing tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

// Handler for calling tools
async function handlePromptRead(args) {
  const { file } = args || {};
  const abs = path.resolve(promptsRoot, file);
  assertInside(promptsRoot, abs);
  try {
    const content = await fs.readFile(abs, 'utf-8');
    return {
      content: [{ type: 'text', text: content }],
    };
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new McpError(
        ErrorCode.InvalidParams,
        `File not found: ${typeof file === 'string' ? file : JSON.stringify(file)}`
      );
    }
    throw new McpError(ErrorCode.InternalError, String(error?.message ?? error));
  }
}

async function handlePromptList(args) {
  const { base = '.' } = args || {};
  const baseAbs = path.resolve(promptsRoot, base);
  assertInside(promptsRoot, baseAbs);
  try {
    const files = await fg(['**/*.md'], {
      cwd: baseAbs,
      dot: false,
      ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
      absolute: false,
      followSymbolicLinks: false,
    });
    return {
      content: [{ type: 'text', text: files.join('\n') }],
    };
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new McpError(
        ErrorCode.InvalidParams,
        `File not found: ${typeof base === 'string' ? base : JSON.stringify(base)}`
      );
    }
    throw new McpError(ErrorCode.InternalError, String(error?.message ?? error));
  }
}

async function handlePromptCommands() {
  const content = await fs.readFile(path.resolve(promptsRoot, 'COMMANDS.md'), 'utf-8');
  return {
    content: [{ type: 'text', text: content }],
  };
}

async function handlePDCAGenerate(args) {
  const { phase, artifact, scope = 'feature', metrics = '', risk = 'low' } = args || {};
  let phaseSection = '';
  if (phase === 'plan') {
    phaseSection = `## Hypothesis
- …

## Metrics
- …

## Risks & Mitigations
- …
`;
  } else if (phase === 'do') {
    phaseSection = `## Change Set
- …

## Test Evidence
- …

## Rollback Plan
- …
`;
  } else if (phase === 'check') {
    phaseSection = `## Findings
- …

## Data (table/snippets)
- …

## Decision
- Proceed / Adjust / Rollback (why)
`;
  } else {
    phaseSection = `## Actions
- Owner: …  Due: …
- …

## Runbook / Prompt Updates
- …
`;
  }

  const md = `# PDCA · ${phase.toUpperCase()} · ${artifact}

**Scope:** ${scope}  |  **Risk:** ${risk}  |  **Metrics:** ${metrics || '—'}

${phaseSection}
`;
  return { content: [{ type: 'text', text: md }] };
}

async function handleDueCheck(args) {
  const base = args?.path
    ? path.resolve(promptsRoot, '..', args.path)
    : path.resolve(promptsRoot, '..');

  assertInside(path.resolve(promptsRoot, '..'), base);

  const strict = !!args?.strict;
  const format = args?.format || 'md';

  // very light repo checks
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

  if (format === 'json') {
    return { content: [{ type: 'text', text: JSON.stringify(report, null, 2) }] };
  }

  const md = `# Due Diligence Report

**Path:** ${report.path}

- Tests present: ${report.checks.tests_present ? '✅' : '❌'}
- README present: ${report.checks.readme_present ? '✅' : '❌'}
- CHANGELOG present: ${report.checks.changelog_present ? '✅' : '❌'}
- .github meta present: ${report.checks.github_meta ? '✅' : '❌'}

${strict ? '> **Strict:** all checks required before merge.\n' : ''}
`;
  return { content: [{ type: 'text', text: md }] };
}

async function handleRetroCreate(args) {
  const type = args?.type || 'iteration';
  const window = args?.window || '30d';
  const include = args?.include || '';
  const md = `# Retrospective (${type}) · Window: ${window}

## What went well
- …

## Risks / Issues
- …

## Proposals
- …

## Owners / Next steps
- …

_Inputs requested:_ ${include || '—'}
`;
  return { content: [{ type: 'text', text: md }] };
}

async function handleApiScaffold(args) {
  const {
    name,
    style = 'openapi',
    lang = 'ts',
    tests = false,
    client = false,
    examples = true,
  } = args || {};
  if (!name) throw new McpError(ErrorCode.InvalidParams, 'name is required');

  if (style === 'openapi') {
    const yaml = `openapi: 3.1.0
info:
  title: ${name} API
  version: 0.1.0
paths:
  /${name}:
    get:
      summary: List ${name}
      responses:
        "200":
          description: OK
`;
    const extras = [];
    if (client) extras.push('- Client SDK: outline generation step');
    if (tests) extras.push('- Contract tests: set up Dredd/Newman or jest-openapi');
    const md = `# ${name} · OpenAPI scaffold
\`\`\`yaml
${yaml}
\`\`\`
${examples ? '## Examples\n- curl GET /' + name + '\n' : ''}
${extras.join('\n')}`;
    return { content: [{ type: 'text', text: md }] };
  }
  // minimal stubs for grpc/tsoa:
  const md = `# ${name} · ${style.toUpperCase()} scaffold (skeleton)
- Language: ${lang}
- Tests: ${tests ? 'yes' : 'no'}  |  Client: ${client ? 'yes' : 'no'}  |  Examples: ${examples ? 'yes' : 'no'}
- TODO: generate proto/controller files and wire CI job.`;
  return { content: [{ type: 'text', text: md }] };
}

async function handleCIConfigure(args) {
  const {
    service,
    env,
    template = 'full',
    gates = 'lint,test,security',
    secrets = '',
  } = args || {};
  if (!service || !env) throw new McpError(ErrorCode.InvalidParams, 'service and env are required');
  const yamlGH = `name: ci-${env}
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --ci
      - run: npm run security:scan
`;
  const md = `# CI/CD Template (${service}, ${env})
Gates: ${gates}

\`\`\`yaml
${yamlGH}
\`\`\`

Secrets: ${secrets || '—'}
${template === 'minimal' ? '\n_Note: minimal template; expand gates as needed._' : ''}`;
  return { content: [{ type: 'text', text: md }] };
}

async function handleTestsPlan(args) {
  const {
    scope = 'changed',
    target = '',
    type = 'unit',
    framework = 'jest',
    coverage = 80,
  } = args || {};
  const md = `# Test Plan
Scope: ${scope} ${target ? `(${target})` : ''}  |  Type: ${type}  |  Framework: ${framework}  |  Coverage target: ${coverage}%

## Areas & Edge Cases
- …

## Fixtures/Mocks
- …

## Property-based ideas
- …

## Commands
- ${framework === 'jest' ? 'npm run test -- --coverage' : 'see project scripts'}
`;
  return { content: [{ type: 'text', text: md }] };
}

async function handleRCAAnalyze(args) {
  const { log, since = '', diff = '', system = '' } = args || {};
  let logTail = '';
  if (log) {
    try {
      const abs = path.resolve(promptsRoot, '..', log);
      assertInside(path.resolve(promptsRoot, '..'), abs);
      const text = await fs.readFile(abs, 'utf-8');
      const lines = text.trim().split(/\r?\n/);
      logTail = lines.slice(-200).join('\n');
    } catch {
      /* ignore */
    }
  }
  const md = `# RCA
System: ${system || '—'}  |  Since: ${since || '—'}  |  Diff: ${diff || '—'}

## Hypotheses
- …

## Minimal Fix
- …

## Confidence
- …

${logTail ? '## Log tail (last 200 lines)\n```\n' + logTail + '\n```' : ''}`;
  return { content: [{ type: 'text', text: md }] };
}

async function handleArchADR(args) {
  const { system, adr = 'Decision Title', diagram, nfr = '' } = args || {};
  if (!system) throw new McpError(ErrorCode.InvalidParams, 'system is required');
  const md = `# ADR: ${adr}
System: ${system}

## Context
- …

## Decision
- …

## Options & Tradeoffs
- Option A — …
- Option B — …

## Consequences
- …

## Rollback
- …

${
  diagram
    ? `## Diagram (${diagram})
_Text-first sketch_
`
    : ''
}${
    nfr
      ? `## NFRs\n- ${nfr
          .split(',')
          .map((s) => s.trim())
          .join('\n- ')}`
      : ''
  }`;
  return { content: [{ type: 'text', text: md }] };
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'prompt_read':
        return await handlePromptRead(args);
      case 'prompt_list':
        return await handlePromptList(args);
      case 'prompt_commands':
        return await handlePromptCommands();
      case 'pdca_generate':
        return await handlePDCAGenerate(args);
      case 'due_check':
        return await handleDueCheck(args);
      case 'retro_create':
        return await handleRetroCreate(args);
      case 'api_scaffold':
        return await handleApiScaffold(args);
      case 'ci_configure':
        return await handleCIConfigure(args);
      case 'tests_plan':
        return await handleTestsPlan(args);
      case 'rca_analyze':
        return await handleRCAAnalyze(args);
      case 'arch_adr':
        return await handleArchADR(args);

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    throw new McpError(ErrorCode.InternalError, `Error executing tool ${name}: ${error.message}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP server started: spellbook-mcp v0.3.0');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
