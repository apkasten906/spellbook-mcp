# Add aliases + input validation

**Status:** Completed

**Goal:** Support legacy dotted tool names and improve arg validation UX.

## Tasks

- [x] Normalize dotted names → underscored via alias map.
- [x] Central JSON Schemas per tool; return MCP InvalidParams with friendly messages.
- [x] Add minimal value validations (enum checks, required combos).

## Solution

We implemented alias normalization and input validation as follows:

- `mcp-starter/lib/aliases.mjs` exports an `aliasMap` and `normalizeToolName(name)` which maps legacy dotted names (e.g. `prompt.read`) to the canonical underscored names (e.g. `prompt_read`). Unknown names with dots are normalized by replacing dots with underscores.
- `mcp-starter/lib/schema-to-zod.mjs` converts the tool's JSON-schema-like `inputSchema` into a Zod schema.
- `mcp-starter/lib/validate-args.mjs` exports `validateWithZod(schema, data)` which returns a normalized result { ok, value } or { ok, errors } and normalizes Zod error shapes (supports `e.errors` and `e.issues`).
- `mcp-starter/server.js` now calls `normalizeToolName()` for incoming tool calls and validates arguments using the converted Zod schema. On invalid input the server throws an MCP `InvalidParams` error with a human-friendly JSON-array of issues.

## Usage examples

- Calling with a dotted alias:

	- Request name: `prompt.read`
	- Server resolves to `prompt_read` via `normalizeToolName`.

- Validation failure example (missing required):

	- Request: `pdca_generate` without `phase` or `artifact`.
	- Response: MCP `InvalidParams` with details: `[{ path: ['phase'], message: 'Required', ... }, ...]`

## Notes

- Unit tests for alias normalization and `validateWithZod` are in `mcp-starter/test` and run via `npm --prefix mcp-starter run test:unit`.

/labels polish, mcp
/milestone 0.4.0
