#!/usr/bin/env node
import 'dotenv/config';
import fsPromises from 'fs/promises';
import path from 'path';
import url from 'url';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  InitializeRequestSchema,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
// fast-glob was used in earlier implementations; current handlers use prompt.catalog.json

import { info as logMessage, debug as logDebug } from './lib/logger.mjs';
import { createShutdown } from './lib/graceful-shutdown.mjs';
import { generateDueCheck } from './lib/due_check.mjs';
import { generatePdca } from './lib/pdca.mjs';
import { normalizeToolName } from './lib/aliases.mjs';
import { jsonSchemaToZod } from './lib/schema-to-zod.mjs';
import { validateWithZod } from './lib/validate-args.mjs';
import { commitAndPush } from './lib/git-ops.mjs';
import { planSdlc } from './lib/sdlc-orchestrator.mjs';

const LOG_MCP =
  process.env.LOG_MCP === '1' ||
  process.env.LOG_MCP === 'true' ||
  process.env.LOG_MCP === 'yes' ||
  process.env.LOG_MCP === 'on';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const promptsRoot = path.resolve(__dirname, '..');

// Record raw environment values to the file
logDebug('[DEBUG] Raw LOG_MCP value:', process.env.LOG_MCP);
logDebug('[DEBUG] Raw MCP_CMD value:', process.env.MCP_CMD);
logDebug('[DEBUG] Raw MCP_ARGS value:', process.env.MCP_ARGS);
if (LOG_MCP) {
  logMessage('[MCP] Logging enabled');
} else {
  logMessage('[MCP] Logging is disabled');
}

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

// Create a shutdown controller and install default signal handlers.
// For tests we can import createShutdown and call shutdown directly.
const { installHandlers } = createShutdown(server);
installHandlers();

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
  ,
  {
    name: 'sdlc_orchestrate',
    description: 'Produce an SDLC plan and optionally write per-phase artifacts (safe by default).',
    inputSchema: {
      type: 'object',
      properties: {
        scope: { type: 'string', enum: ['feature', 'service', 'repo'], default: 'feature' },
        goal: { type: 'string' },
        phases: { type: 'array', items: { type: 'string' } },
        write: { type: 'boolean', default: false },
        branch: { type: 'string' },
        message: { type: 'string' },
        push: { type: 'boolean', default: false },
      },
    },
  }
);

tools.push({
  name: 'repo_commit',
  description: 'Write files and optionally commit/push in a repository (safe by default).',
  inputSchema: {
    type: 'object',
    properties: {
      files: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            path: { type: 'string' },
            content: { type: 'string' },
          },
          required: ['path', 'content'],
        },
      },
      branch: { type: 'string' },
      message: { type: 'string' },
      push: { type: 'boolean', default: false },
    },
    required: ['files'],
  },
});

// Handler for initialization (required by MCP protocol)
server.setRequestHandler(InitializeRequestSchema, async (request) => {
  logMessage('[MCP] Received initialize request:', request);
  return {
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: {},
    },
    serverInfo: {
      name: 'spellbook-mcp',
      version: '0.3.0',
    },
  };
});

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
async function handlePromptRead(args = {}) {
  const { file } = args;
  const abs = path.resolve(promptsRoot, file);
  assertInside(promptsRoot, abs);
  try {
    const content = await fsPromises.readFile(abs, 'utf-8');
    // try to find metadata in prompt.catalog.json
    let meta = null;
    try {
      const catalog = JSON.parse(
        await fsPromises.readFile(path.resolve(promptsRoot, '..', 'prompt.catalog.json'), 'utf-8')
      );
      meta = (catalog.items || []).find((it) => it.file === file) || null;
    } catch {
      /* ignore */
    }
    return {
      content: [{ type: 'application/json', text: JSON.stringify({ meta, content }) }],
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

async function handlePromptList(args = {}) {
  const { tag, phase, q, page = 1, perPage = 50 } = args || {};
  try {
    const catalog = JSON.parse(
      await fsPromises.readFile(path.resolve(promptsRoot, '..', 'prompt.catalog.json'), 'utf-8')
    );
    let items = (catalog.items || []).slice();
    if (tag) {
      items = items.filter((it) => Array.isArray(it.tags) && it.tags.includes(tag));
    }
    if (phase) {
      items = items.filter((it) => it.phase === phase);
    }
    if (q) {
      const qq = String(q).toLowerCase();
      items = items.filter(
        (it) =>
          (it.title || '').toLowerCase().includes(qq) ||
          (it.description || '').toLowerCase().includes(qq) ||
          (it.tags || []).join(' ').includes(qq)
      );
    }
    const total = items.length;
    const pageNum = Math.max(1, Number(page) || 1);
    const size = Math.max(1, Math.min(200, Number(perPage) || 50));
    const start = (pageNum - 1) * size;
    const pageItems = items.slice(start, start + size);
    return {
      content: [
        {
          type: 'application/json',
          text: JSON.stringify({ total, page: pageNum, perPage: size, items: pageItems }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new McpError(ErrorCode.InternalError, String(error?.message ?? error));
  }
}

async function handlePromptCommands() {
  const content = await fsPromises.readFile(path.resolve(promptsRoot, 'COMMANDS.md'), 'utf-8');
  return {
    content: [{ type: 'text', text: content }],
  };
}

async function handlePDCAGenerate(args = {}) {
  try {
    const md = generatePdca(args);
    return { content: [{ type: 'text', text: md }] };
  } catch (err) {
    throw new McpError(ErrorCode.InvalidParams, String(err?.message ?? err));
  }
}

async function handleDueCheck(args = {}) {
  try {
    const { report, md, format } = await generateDueCheck(promptsRoot, args);
    if (format === 'json') {
      return { content: [{ type: 'text', text: JSON.stringify(report, null, 2) }] };
    }
    return { content: [{ type: 'text', text: md }] };
  } catch (err) {
    throw new McpError(ErrorCode.InvalidParams, String(err?.message ?? err));
  }
}

async function handleRetroCreate(args = {}) {
  const type = args.type || 'iteration';
  const window = args.window || '30d';
  const include = args.include || '';
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

async function handleApiScaffold(args = {}) {
  const {
    name,
    style = 'openapi',
    lang = 'ts',
    tests = false,
    client = false,
    examples = true,
  } = args;
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

async function handleCIConfigure(args = {}) {
  const { service, env, template = 'full', gates = 'lint,test,security', secrets = '' } = args;
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

async function handleTestsPlan(args = {}) {
  const { scope = 'changed', target = '', type = 'unit', framework = 'jest', coverage = 80 } = args;
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

async function handleRCAAnalyze(args = {}) {
  const { log, since = '', diff = '', system = '' } = args;
  let logTail = '';
  if (log) {
    try {
      const abs = path.resolve(promptsRoot, '..', log);
      assertInside(path.resolve(promptsRoot, '..'), abs);
      const text = await fsPromises.readFile(abs, 'utf-8');
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

async function handleArchADR(args = {}) {
  const { system, adr = 'Decision Title', diagram, nfr = '' } = args;
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
  const { name: rawName } = request.params;
  let args = request.params.arguments;
  const name = normalizeToolName(rawName);
  logMessage('[MCP] Tool call:', rawName, '->', name, 'args:', args);
  try {
    // find tool schema and validate
    const tool = tools.find((t) => t.name === name);
    if (tool && tool.inputSchema) {
      const zschema = jsonSchemaToZod(tool.inputSchema);
      const validation = validateWithZod(zschema, args || {});
      if (!validation.ok) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Invalid arguments: ${JSON.stringify(validation.errors)}`
        );
      }
      // use parsed args
      args = validation.value;
    }
    let result;
    switch (name) {
      case 'prompt_read':
        result = await handlePromptRead(args);
        break;
      case 'prompt_list':
        result = await handlePromptList(args);
        break;
      case 'prompt_commands':
        result = await handlePromptCommands();
        break;
      case 'pdca_generate':
        result = await handlePDCAGenerate(args);
        break;
      case 'due_check':
        result = await handleDueCheck(args);
        break;
      case 'retro_create':
        result = await handleRetroCreate(args);
        break;
      case 'api_scaffold':
        result = await handleApiScaffold(args);
        break;
      case 'ci_configure':
        result = await handleCIConfigure(args);
        break;
      case 'tests_plan':
        result = await handleTestsPlan(args);
        break;
      case 'rca_analyze':
        result = await handleRCAAnalyze(args);
        break;
      case 'arch_adr':
        result = await handleArchADR(args);
        break;
      case 'sdlc_orchestrate': {
        // produce structured plan; optionally write artifacts when write: true
        const { scope, goal, phases, write = false, branch, message, push = false } = args || {};

        // If no args provided or no goal specified, return the interactive form YAML so clients
        // can present a form and collect inputs before calling the tool again.
        if (!args || !goal) {
          try {
            const formRel = 'prompts/v0.3.0/orchestrators/sdlc_orchestrator.form.yaml';
            const formPath = path.resolve(promptsRoot, formRel);
            assertInside(promptsRoot, formPath);
            const formText = await fsPromises.readFile(formPath, 'utf-8');
            return {
              content: [
                {
                  type: 'application/json',
                  text: JSON.stringify({ form: formText, file: formRel }),
                },
              ],
            };
          } catch (err) {
            throw new McpError(ErrorCode.InternalError, `Failed to load form: ${String(err?.message ?? err)}`);
          }
        }

        const plan = planSdlc({ scope, goal, phases, cwd: process.cwd() });
        if (!write) {
          return { content: [{ type: 'text', text: JSON.stringify(plan, null, 2) }] };
        }

        // prepare files for writing
        const files = [];
        for (const p of plan.plan || plan) {
          if (!p.artifact) continue;
          const pathStr = typeof p.artifact === 'string' ? p.artifact : p.artifact;
          // read the prompt referenced and use the prompt content as body if available, otherwise a small scaffold
          let body = `# ${goal || 'artifact'} · ${p.phase}\n\n`;
          try {
            const promptPath = path.resolve(promptsRoot, p.prompt || '');
            body += await fsPromises.readFile(promptPath, 'utf-8');
          } catch {
            body += `Generated artifact for ${p.phase}`;
          }
          files.push({ path: pathStr, content: body });
        }

        // commit files safely (no push unless requested)
        const cwd = process.cwd();
        const res = commitAndPush(cwd, {
          files,
          branch,
          message: message || `sdlc-orchestrate: ${goal || 'artifact'}`,
          push,
        });
        const pushed = Boolean(res?.push?.pushed);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { plan, commit: { pushed, details: res?.push || null } },
                null,
                2
              ),
            },
          ],
        };
      }
      case 'repo_commit': {
        // safe repo commit: write files, commit, optionally push when remote present and push flag true
        const cwd = process.cwd();
        const _res = commitAndPush(cwd, {
          files: args.files || [],
          branch: args.branch,
          message: args.message || 'mcp commit',
        });
        const pushed = Boolean(_res?.push?.pushed);
        if (args.push && !_res?.push?.pushed) {
          if (_res?.push?.reason === 'no-remote') {
            return {
              content: [
                { type: 'text', text: 'Committed locally. No remote configured; not pushed.' },
              ],
            };
          }
          return {
            content: [
              {
                type: 'text',
                text: `Committed locally. Push attempted but failed: ${_res?.push?.error || 'unknown'}`,
              },
            ],
          };
        }
        return { content: [{ type: 'text', text: `Committed${pushed ? ' and pushed' : ''}` }] };
      }
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
    logMessage('[MCP] Tool result for', name, result);
    return result;
  } catch (error) {
    logMessage('[MCP] Tool error for', name, error);
    throw new McpError(ErrorCode.InternalError, `Error executing tool ${name}: ${error.message}`);
  }
});

// Start the server
async function main() {
  logMessage('[MCP] About to construct StdioServerTransport');
  const transport = new StdioServerTransport();
  logMessage('[MCP] StdioServerTransport constructed');
  await server.connect(transport);
  logMessage('[MCP] server.connect(transport) resolved, transport should be alive and reading');
  logMessage('MCP server started: spellbook-mcp v0.3.0');
}

main().catch((error) => {
  // Fatal startup errors should always go to stderr (and also to file)
  console.error('Server error:', error);
  logMessage('Server error:', error);
  process.exit(1);
});
