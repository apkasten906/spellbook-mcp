# Quick AI guidance for contributors working in this repo

This file contains concise, actionable notes for an AI coding agent (Copilot-style assistant) to be productive in spellbook-mcp.

1. Big picture

- This repo is a prompt library + a lightweight MCP server that exposes prompts as tools (`mcp-starter/server.js`).
- Prompts live under `prompts/v0.3.0/`; meta prompts live in `prompts/v0.3.0/meta/` and are indexed by `prompt.catalog.json`.
- The server exposes tools (pdca_generate, due_check, prompt_read, tests_plan, etc.) and validates incoming args using a json-schema→Zod flow (`mcp-starter/lib/schema-to-zod.mjs` + `mcp-starter/lib/validate-args.mjs`).

2. Important files and why they matter

- `mcp-starter/server.js` — main entry for the MCP server. Read this first to learn tool names, inputSchemas, aliases, and error-handling behavior.
- `mcp-starter/lib/*.mjs` — small helpers: `pdca.mjs`, `due_check.mjs`, `graceful-shutdown.mjs`, `aliases.mjs`, `git-ops.mjs`, `schema-to-zod.mjs`, `validate-args.mjs`. Use these to implement or extend tools.
- `Dockerfile.mcp` — multi-stage image: `test` stage installs devDependencies (used by CI) and `runtime` stage contains production runtime. CI runs acceptance inside the `test` image.
- `.github/workflows/acceptance-smoke.yml` — shows how CI builds the test image, runs unit tests inside a container, and copies `mcp-starter/logs/**` as artifacts.
- `prompt.catalog.json` — machine-friendly index of available prompts and tags; update when adding new prompts.

3. Conventions & patterns to follow

- Prompts are versioned by folder (v0.3.0). New prompt files go under `prompts/vX.Y.Z/` and must be added to `prompt.catalog.json`.
- Do not assume prompts are executable code — `prompt_read` returns raw markdown; the server tools generate artifacts from prompts.
- Validation: server converts each tool `inputSchema` to a Zod schema with `jsonSchemaToZod`. Use `validateWithZod` when adding new tools to produce consistent MCP InvalidParams errors.
- Aliases: allow dotted aliases (e.g., `prompt.read`) via `normalizeToolName` in `aliases.mjs`.
- File writes: write-variants are planned; use `mcp-starter/lib/git-ops.mjs` helpers (`writeFiles`, `commitAndPush`) if you implement file-write tools. Respect safety: `gitPush` will not push if no remote.
- Path safety: server uses `assertInside(base, candidate)` to prevent path escape — ensure any file paths are resolved under `promptsRoot` or repo root.

-- Branching & issue association (required)

- When working on a new GitHub issue always create a dedicated branch and associate the work with that issue. Use a clear branch naming pattern that includes the issue number or a short descriptor (examples below). This helps CI, PRs, and traceability.
- Preferred branch names:
  - `feat/25-sdlc-orchestrator`
  - `fix/42-git-ops-windows`
  - `chore/issue-123-update-docs`
- Recommended workflow (PowerShell):

```powershell
# create branch from dev (or the designated base branch)
git checkout dev; git pull
git checkout -b feat/25-sdlc-orchestrator
# work, commit locally
git add <files>; git commit -m "feat(sdlc): add orchestrator prompt (issue-25)"
git push --set-upstream origin feat/25-sdlc-orchestrator
```

When opening a PR, link it to the GitHub issue (use the issue number in the PR title/body or the branch name). If you prefer the agent to create the branch/PR for you, include explicit permission in the issue body or a config flag in the task.

4. Build / test / acceptance workflows (concrete)

- Install and start server locally (PowerShell):

```powershell
npm --prefix mcp-starter i
node mcp-starter/server.js
```

- Run unit tests (Vitest):

```powershell
npm --prefix mcp-starter run test:unit
```

- Run the CI-like quick acceptance smoke locally in Docker (mirrors GitHub Actions):

```powershell
# build the test image (contains dev deps)
docker build -f Dockerfile.mcp -t spellbook-mcp:test --target test .
# run the quick acceptance (writes logs to ./mcp-starter/logs)
docker run --rm -it -v ${PWD}\mcp-starter\logs:/app/mcp-starter/logs spellbook-mcp:test /bin/sh -c "cd /app && npm run acceptance:quick:logging"
```

5. Testing conventions

- Unit tests use Vitest and live under `mcp-starter/test/*.mjs`. Keep tests fast and deterministic; many helpers are designed for in-process testing (e.g., `graceful-shutdown` exposes `createShutdown` for deterministic shutdown tests).
- Acceptance tests are BDD Cucumber features under `features/` and executed in CI inside the Docker `test` image. Logs are copied back from containers to `mcp-starter/logs/` and uploaded as artifacts.

6. Integration points & external dependencies

- MCP SDK: `@modelcontextprotocol/sdk` (server and types) — server uses `StdioServerTransport` for stdio-based CI execution.
- Docker: CI builds `spellbook-mcp:test` and runs tests inside it to ensure devDependencies are available.
- GitHub Actions: see `.github/workflows/acceptance-smoke.yml` for caching and container usage.

7. Typical agent tasks and examples

- Add a new prompt: create `prompts/vX.Y.Z/<name>.md`, add an entry to `prompt.catalog.json`, and add a feature test under `features/` if it's used by acceptance tests.
- Add a new MCP tool: declare tool in `mcp-starter/server.js` (name, description, inputSchema), convert inputSchema using `jsonSchemaToZod`, validate via `validateWithZod`, implement handler using existing helpers where possible, and add unit tests under `mcp-starter/test`.

8. Error modes & logging

- Enable verbose MCP logging via environment `LOG_MCP=1`. Logs are written to `mcp-starter/logs/` when running inside Docker/CI.
- When a tool throws, server wraps in `McpError(ErrorCode.InternalError, ...)`; for invalid inputs it raises `ErrorCode.InvalidParams`.

9. Small gotchas

- Tests in CI run inside a Docker image built from the repo; adding devDependencies requires they be available in the `test` stage of `Dockerfile.mcp` (CI reproduces that). Running acceptance locally should use the same image.
- When editing `server.js` tool list, keep the tool names stable (clients rely on tool names in `ListToolsRequestSchema`).

If something here is unclear or you want more examples (e.g., a template for adding a tool + unit test + feature), tell me which area and I will expand with concrete code snippets.
