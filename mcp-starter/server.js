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
import fg from 'fast-glob';

import { info as logMessage, debug as logDebug } from './lib/logger.mjs';
import { createShutdown } from './lib/graceful-shutdown.mjs';
import { generateDueCheck } from './lib/due_check.mjs';
import { generatePdca } from './lib/pdca.mjs';
import { normalizeToolName } from './lib/aliases.mjs';
import { jsonSchemaToZod } from './lib/schema-to-zod.mjs';
import { validateWithZod } from './lib/validate-args.mjs';

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
);

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

async function handlePromptList(args = {}) {
  const { base = '.' } = args;
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
        throw new McpError(ErrorCode.InvalidParams, `Invalid arguments: ${JSON.stringify(validation.errors)}`);
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
