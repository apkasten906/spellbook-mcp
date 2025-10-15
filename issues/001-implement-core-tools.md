# Implement core MCP tools (underscored names)

**Goal:** Ship the first usable tool set aligned with `COMMANDS.md` and the Execution Matrix.

## Tools to finalize

- [ ] `pdca_generate` — PDCA artifact generator (plan|do|check|act)
- [ ] `due_check` — due-diligence checklist report (md|json)
- [ ] `retro_create` — retrospective skeleton
- [ ] `api_scaffold` — API draft (openapi|grpc|tsoa)
- [ ] `ci_configure` — CI/CD template output (service/env)
- [ ] `tests_plan` — test plan scaffolder
- [ ] `rca_analyze` — RCA skeleton (+ optional log tail)
- [ ] `arch_adr` — ADR template

## Acceptance criteria

- Tools listed by `ListTools` and runnable via VS Code MCP.
- All handlers return Markdown (or JSON where specified) and never throw on user input validation (use structured error via MCP).
- Basic unit tests for pure helpers.

/labels enhancement, mcp, v0.3.0
/assignees @apkasten906
/milestone 0.4.0
