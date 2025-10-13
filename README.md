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
