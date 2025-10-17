# Implement core MCP tools (underscored names)

**Status:** In Progress

**Goal:** Ship the first usable tool set aligned with `COMMANDS.md` and the Execution Matrix.

## Tools to finalize

- [x] `pdca_generate` — PDCA artifact generator (plan|do|check|act)
- [x] `due_check` — due-diligence checklist report (md|json)
- [x] `retro_create` — retrospective skeleton
- [x] `api_scaffold` — API draft (openapi|grpc|tsoa)
- [x] `ci_configure` — CI/CD template output (service/env)
- [x] `tests_plan` — test plan scaffolder
- [x] `rca_analyze` — RCA skeleton (+ optional log tail)
- [x] `arch_adr` — ADR template

## Acceptance criteria

- Tools listed by `ListTools` and runnable via VS Code MCP.
- All handlers return Markdown (or JSON where specified) and never throw on user input validation (use structured error via MCP).
- Basic unit tests for pure helpers.

/labels enhancement, mcp, v0.3.0
/assignees @apkasten906
/milestone 0.4.0

## Progress

- Added `mcp-starter/lib/pdca.mjs` and `mcp-starter/test/pdca.test.mjs`.
- Updated `server.js` to call into `generatePdca` helper for `pdca_generate`.
- Local unit tests (`npm run test:unit` inside `mcp-starter`) run shutdown and pdca tests and are passing locally.
