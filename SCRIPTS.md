# Scripts & Testing Infrastructure

> **Purpose:** Documentation for npm scripts, test infrastructure, and important files for AI assistants (GitHub Copilot, Claude, etc.)

## NPM Scripts

### Production & Development

- **`npm start`** - Start the MCP server (Unix/Linux/Mac)
- **`npm run start:ps`** - Start the MCP server (Windows PowerShell)
- **`npm run dev`** - Start the MCP server with nodemon auto-reload (Windows PowerShell)

### Docker

- **`npm run docker:build`** - Build Docker image `spellbook-mcp:0.3.0`
- **`npm run docker:run`** - Run the MCP server in Docker container

### Code Quality

- **`npm run lint`** - Run ESLint on all files
- **`npm run lint:fix`** - Auto-fix ESLint issues
- **`npm run format`** - Format all files with Prettier
- **`npm run format:check`** - Check formatting without modifying files

### Testing (BDD Acceptance Tests)

- **`npm run acceptance`** - Run all Cucumber acceptance tests (24 scenarios, ~11s)
  - No debug logging
  - Clean output suitable for CI/CD
  - Tests all 11 MCP tools

- **`npm run acceptance:logging`** - Run tests with full MCP protocol logging
  - Sets `LOG_MCP=1` environment variable
  - Shows all JSON-RPC messages between client/server
  - Useful for debugging test failures or protocol issues

## Test Infrastructure Files

### Critical Files (DO NOT DELETE)

These files are essential for the test suite and should be preserved:

#### Configuration

- **`cucumber.cjs`** - Cucumber.js configuration (requires step definitions and support files)
- **`package.json`** - Contains test scripts and dependencies
- **`.env`** - Environment variables (optional, not currently used)
- **`.gitattributes`** - Line ending consistency (LF for code, CRLF for Windows scripts)

#### Test Features (BDD Scenarios)

- **`features/*.feature`** - Gherkin feature files (24 scenarios total)
  - `api-scaffold.feature` - API scaffolding tool tests
  - `arch-adr.feature` - Architecture decision record tests
  - `ci-cd.feature` - CI/CD pipeline generation tests
  - `due-diligence.feature` - SDLC checklist validation tests
  - `mcp-server-tools.feature` - Core MCP server functionality tests
  - `pdca.feature` - PDCA cycle artifact generation tests
  - `prompt-library.feature` - Prompt listing and reading tests
  - `rca.feature` - Root cause analysis tests
  - `retrospective.feature` - Retrospective generation tests
  - `slash-commands.feature` - Slash command documentation tests
  - `test-planning.feature` - Test planning tool tests

#### Step Definitions (Test Logic)

- **`features/step_definitions/tools.steps.cjs`** - Step definitions for all MCP tool tests
  - Contains 48+ step implementations (When/Then)
  - Handles MCP content format parsing
  - Helper functions: `toText()`, `isMdList()`

#### Support Files (Test Infrastructure)

- **`features/support/world.cjs`** - Cucumber World context (test state management)
  - Manages MCP client lifecycle
  - Provides `startClient()`, `stopClient()`, `runTool()` helpers
- **`features/support/mcp-client.cjs`** - MCP client wrapper for tests
  - Uses official `@modelcontextprotocol/sdk`
  - Handles stdio transport and JSON-RPC communication
  - Provides `start()`, `stop()`, `callTool()` methods

- **`features/support/hooks.cjs`** - Cucumber lifecycle hooks
  - After hooks to ensure cleanup after each scenario
  - Prevents zombie processes from hanging

### Requirements & Issues

- **`requirements/requirements-planning.yaml`** - Feature specifications and acceptance criteria
- **`issues/README.md`** - Work item and blocker tracking

### Documentation

- **`docs/learning-log.md`** - Error learning protocol entries
  - Contains post-mortems from debugging sessions
  - Prevention steps and key takeaways

## Environment Variables

### MCP Server

- **`LOG_MCP=1`** - Enable detailed MCP protocol logging
  - Used by `npm run acceptance:logging`
  - Logs all JSON-RPC messages to stderr
  - Default: disabled (only enabled for debugging)

### Test Configuration (Optional)

- **`MCP_CMD`** - Override MCP server command (default: `node`)
- **`MCP_ARGS`** - Override MCP server args (default: `["mcp-starter/server.js"]`)
  - Must be valid JSON array if provided

## Test Execution Flow

1. **Test starts** → `world.cjs` creates `TestWorld` instance
2. **Scenario begins** → Step calls `this.runTool(name, args)`
3. **Client initialization** → `mcp-client.cjs` spawns MCP server process via stdio
4. **Protocol handshake** → Client sends `initialize` request, server responds with capabilities
5. **Tool invocation** → Client sends `tools/call` request with tool name and args
6. **Server processing** → Server executes tool logic and returns result
7. **Result validation** → Step definition asserts on returned content
8. **Scenario cleanup** → `hooks.cjs` ensures `stopClient()` is called
9. **Process termination** → Client kills server process and closes stdio streams

## Debugging Tips

### Test Failures

1. Run with logging: `npm run acceptance:logging`
2. Check stderr output for JSON-RPC messages
3. Review `docs/learning-log.md` for similar issues
4. Verify MCP server starts correctly: `node mcp-starter/server.js`

### Hanging Processes

- Check for zombie node processes: `Get-Process node` (Windows) or `ps aux | grep node` (Unix)
- Ensure `hooks.cjs` cleanup is working
- Verify `stopClient()` is called in all code paths

### Protocol Issues

- Ensure server implements required handlers:
  - `InitializeRequestSchema` (required for handshake)
  - `ListToolsRequestSchema` (required for tool discovery)
  - `CallToolRequestSchema` (required for tool invocation)
- Check protocol version compatibility (client uses `2025-06-18`)

## CI/CD Integration

The test suite is designed for CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run acceptance tests
  run: npm run acceptance

# For debugging failed CI runs
- name: Run acceptance tests with logging
  run: npm run acceptance:logging
  if: failure()
```

## Important for AI Assistants

### When Modifying Test Files

- Always run `npm run acceptance` after changes
- Verify all 24 scenarios still pass
- Update this documentation if adding new scripts or files

### When Adding New MCP Tools

1. Add feature file in `features/` with Gherkin scenarios
2. Add step definitions in `features/step_definitions/tools.steps.cjs`
3. Update `requirements/requirements-planning.yaml` with new feature specs
4. Run `npm run acceptance` to verify integration
5. Update CHANGELOG.md with new functionality

### When Debugging

- Use `npm run acceptance:logging` to see full protocol messages
- Check `docs/learning-log.md` for patterns of common issues
- Verify server.js LOG_MCP check is correct (should default to false)
- Ensure hooks.cjs cleanup is executed after each scenario

### Files to Preserve

- All `features/**/*.feature` files (test scenarios)
- All `features/support/*.cjs` files (test infrastructure)
- All `features/step_definitions/*.cjs` files (step implementations)
- `cucumber.cjs` (test configuration)
- `requirements/requirements-planning.yaml` (traceability)
- `docs/learning-log.md` (institutional knowledge)

### Files OK to Delete

- `*.log` files (regenerated on each test run)
- `debug-*.ps1` scripts (temporary debugging aids)
- `test-*.js` files (temporary test harnesses)
- `node_modules/` (regenerated by npm install)
- `.vscode/setting.json` (typo, should be settings.json)

---

**Version:** 0.3.1  
**Last Updated:** 2025-10-14  
**Maintained by:** Spellbook MCP Team
