# 🪄 Spellbook MCP

A Model Context Protocol server that serves AI prompts as spells — structured, reusable incantations for every phase of the Software Development Life Cycle.

Version: **v0.3.0**  
License: **MIT**

> _Where every prompt is a spell and every build a ritual._

A reusable, versioned toolkit of prompts + a lightweight **Model Context Protocol (MCP)** server for AI‑assisted software development. Includes SDLC prompts, PDCA (Deming cycle) meta‑prompts, model routing, and an MCP server exposing everything as tools.

## Quick Start (Local)

```bash
npm -C mcp-starter i
node mcp-starter/server.js
```

## Quick Start (Docker)

```bash
docker build -f Dockerfile.mcp -t spellbook-mcp:0.3.0 .
docker run --rm -it spellbook-mcp:0.3.0
```

### Local acceptance smoke (PowerShell)

If you want to run the quick acceptance smoke locally inside Docker (mirrors CI), use the included PowerShell helper or the npm `smoketest` script:

```powershell
# Build a local image
docker build -f Dockerfile.mcp -t spellbook-mcp:local .

# Run the smoke test with mounted logs directory (writes to ./mcp-starter/logs)
docker run --rm -it -v ${PWD}\mcp-starter\logs:/app/mcp-starter/logs spellbook-mcp:local /bin/sh -c "cd /app && npm run acceptance:quick:logging"

# Or use the included helper that wraps the same logic
npm run smoketest
```

### MCP Client Setup

Point your MCP-enabled client (Claude desktop, Cursor, VS Code MCP bridge) at **.mcp.json**.

## Repo Structure

```
/
├── prompts/
│   └── v0.3.0/               # SDLC + PDCA prompts for this release
│       ├── 1_requirements_planning.md
│       ├── 2_analysis_specification.md
│       ├── 3_architecture_design.md
│       ├── 4_implementation_development.md
│       ├── 5_testing_quality_assurance.md
│       ├── 6_deployment_release.md
│       ├── 7_maintenance_monitoring.md
│       └── meta/
│           ├── PDCA_cycle.md
│           ├── due_diligence_checklist.md
│           ├── retrospective_review.md
│           ├── error_learning_protocol.md
│           └── continuous_improvement_tracker.md
├── docs/
│   └── learning-log.md
├── mcp-starter/
│   ├── package.json
│   └── server.js
├── .mcp.json
├── Dockerfile.mcp
├── router.config.json
├── prompt.catalog.json
├── PROMPT_EXECUTION_MATRIX.md
├── COMMANDS.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
└── .github/workflows/release.yml
```

## Versioning & Releases

- **SemVer**: MAJOR.MINOR.PATCH
- Tag releases with `vX.Y.Z`. A GitHub Action creates a release and attaches a zip.
- See **CONTRIBUTING.md** for branching and PR guidance and **CHANGELOG.md** for history.

## Model Budgeting

See **PROMPT_EXECUTION_MATRIX.md**. Prefer Copilot (GPT‑5 Codex) for code, use GPT‑4.1/5 for deep reasoning, and fall back to 4o/o3‑mini when acceptable.

## Commands

See **COMMANDS.md** for slash commands and how they map to MCP tools.

## Learning & postmortems

We keep a lightweight team learning log for acceptance/CI failures and important troubleshooting notes. If an acceptance test or CI run reveals a bug, flaky test, or operational lesson, add a short entry to `docs/learning-log.md` describing:

- The run id or timestamp and branch/PR affected
- Short summary of the issue and root cause (if known)
- Steps taken to investigate and the final remediation
- References to commits, artifacts (uploaded `mcp-starter/logs/**`), and PRs

Keeping this information close to the repo helps accelerate future debugging and captures institutional knowledge. The `prompts/v0.3.0/meta/` directory also contains policy artifacts like `due_diligence_checklist.md` and `retrospective_review.md` you can reference when filing learnings.
