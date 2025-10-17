# feat(logging): introduce winston rotating logger and consolidate logs under LOG_DIR

## Summary

This PR introduces a production-grade file-backed logging architecture for the MCP server and Cucumber test harness.

## What changed

- Added `mcp-starter/lib/logger.mjs` using `winston` + `winston-daily-rotate-file`.
- Server (`mcp-starter/server.js`) now uses the centralized logger instead of ad-hoc file writes/rotation.
- Acceptance test harness (`features/support/world.cjs` and `features/step_definitions/tools.steps.cjs`) now write `cucumber-verbose.log` into `LOG_DIR` when `LOG_MCP=1`.
- Created `docs/LOGGING.md` documenting log locations and env vars.
- Added `.env.example` and updated local `.env` for development guidance.
- Introduced the Cucumber acceptance test suite and supporting files (features, step definitions, and support code). The test suite exercises the MCP tools and runs the acceptance scenarios used during validation.

## Testing

- Manual acceptance run performed locally (PowerShell):
  - `$env:LOG_MCP = '1'; npm run acceptance:logging`
  - Verified `mcp-starter/logs/mcp-<DATE>.log` and `mcp-starter/logs/cucumber-verbose.log` are created and populated.
- Lint pass for edited files.

Additional test notes

- The repository includes a Cucumber-based acceptance suite under `features/` with support code in `features/support/` and step definitions in `features/step_definitions/`.
- Running `npm run acceptance` executes the suite. Use `npm run acceptance:logging` or set `LOG_MCP=1` for verbose test logs written to `LOG_DIR`.

## Checklist

- [x] Acceptance tests run locally with verbose logging
- [x] Documentation updated (`docs/LOGGING.md` and `.env.example`)
- [x] Changes committed on `feature/dev-pr`

## Notes for reviewers

- Default `LOG_DIR` is `mcp-starter/logs`. If you'd prefer top-level `./logs`, set `LOG_DIR` accordingly or we can change the default.
- The current rotation policy uses daily rotation + size-based rollover with `maxFiles` configured via `LOG_ROTATE_BACKUPS`.
- Follow-ups (optional): add CI smoke job that runs a short acceptance scenario and asserts log files were created.
