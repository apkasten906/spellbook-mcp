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
    name: 'prompt.read',
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
    name: 'prompt.list',
    description: 'List available prompt templates (markdown) under a base folder.',
    inputSchema: {
      type: 'object',
      properties: {
        base: { type: 'string', default: '.' },
      },
    },
  },
  {
    name: 'prompt.commands',
    description: 'List slash-style commands for quick prompting.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

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
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'prompt.read': {
        const { file } = args;
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

      case 'prompt.list': {
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

      case 'prompt.commands': {
        const content = await fs.readFile(path.resolve(promptsRoot, 'COMMANDS.md'), 'utf-8');
        return {
          content: [{ type: 'text', text: content }],
        };
      }

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
