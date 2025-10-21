# 🪄 Spellbook MCP

A Model Context Protocol server that serves AI prompts as spells — structured, reusable incantations for every phase of the Software Development Life Cycle.

Version: **v0.3.0**  
License: **MIT**

> _Where every prompt is a spell and every build a ritual._

A reusable, versioned toolkit of prompts + a lightweight **Model Context Protocol (MCP)** server for AI‑assisted software development. Includes SDLC prompts, PDCA (Deming cycle) meta‑prompts, model routing, and an MCP server exposing everything as tools.

---

## ✨ New: SDLC Orchestrator

**Automate your entire software development lifecycle with a single command.**

The SDLC Orchestrator generates structured artifacts for all 7 SDLC phases — from requirements to maintenance — with deterministic naming, built-in safety, and optional git integration.

### 🎯 Quickest Way to Use It

Just describe your goal in natural language:

```
Run SDLC orchestrator for: Add async retry to client
```

The orchestrator will:
1. Generate a complete plan with all 7 phases
2. Show you exactly what artifacts will be created
3. Ask if you want to write them to disk
4. Optionally commit and push

**Artifacts generated** (example for "Add async retry to client"):
- `docs/PDCA/add-async-retry-to-client-requirements.md` - Requirements & planning
- `docs/API/add-async-retry-to-client-analysis.md` - Analysis & specification
- `docs/ADR/add-async-retry-to-client-architecture.md` - Architecture decisions
- `docs/TESTS/add-async-retry-to-client-testing.md` - Test plan
- `docs/CI/add-async-retry-to-client-deployment.yaml` - CI/CD config
- `docs/RCA/add-async-retry-to-client-maintenance.md` - Monitoring & RCA

### 📖 Learn More

- **User Guide:** [docs/SDLC_ORCHESTRATOR_USER_GUIDE.md](docs/SDLC_ORCHESTRATOR_USER_GUIDE.md)
- **Implementation:** [docs/SDLC_ORCHESTRATOR_SUMMARY.md](docs/SDLC_ORCHESTRATOR_SUMMARY.md)
- **Quick Start Prompt:** [prompts/v0.3.0/orchestrators/sdlc_quick_start.md](prompts/v0.3.0/orchestrators/sdlc_quick_start.md)

---

---

## 🚀 Features

### SDLC Orchestrator
- **One-command workflow:** Generate complete SDLC artifacts from requirements to maintenance
- **Deterministic naming:** Artifact paths based on goal + phase (e.g., `add-retry-logic-testing.md`)
- **Safety built-in:** Write and push are opt-in, path validation prevents escapes
- **Git integration:** Optional commit and push with safe defaults
- **Natural language UX:** Just describe your goal, no tool knowledge needed

### MCP Tools
- `sdlc_orchestrate` - Run the full SDLC workflow
- `prompt_read` / `prompt_list` - Browse and read prompts
- `pdca_generate` - Generate PDCA (Plan-Do-Check-Act) artifacts
- `due_check` - Run due-diligence checklist against code
- `tests_plan` - Plan tests for files/directories
- `api_scaffold` - Generate API specs and stubs
- `ci_configure` - Create CI/CD pipeline templates
- `arch_adr` - Generate Architecture Decision Records
- `rca_analyze` - Root cause analysis for incidents
- `retro_create` - Create retrospective templates
- `repo_commit` - Safe file writing with git integration

### Prompt Library
- **7 SDLC phases:** Requirements → Analysis → Architecture → Implementation → Testing → Deployment → Maintenance
- **5 PDCA meta-prompts:** Continuous improvement, error learning, retrospectives, due diligence
- **Versioned:** All prompts under `prompts/v0.3.0/` with catalog index

---

## Quick Start (Local)

```bash
npm -C mcp-starter i
node mcp-starter/server.js
```

### Test the Orchestrator (No MCP Server Needed)

```bash
node scripts/test-orchestrator.js "Your feature name"
```

This will show you the complete plan and artifact paths without writing files.

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
│   └── v0.3.0/                # SDLC + PDCA prompts for this release
│       ├── sdlc_orchestrator.md
│       ├── orchestrators/     # Orchestrator prompts & forms
│       │   ├── sdlc_quick_start.md
│       │   ├── sdlc_orchestrator.form.yaml
│       │   └── sdlc_orchestrator_run.md
│       ├── sdlc_phases/       # Individual phase prompts
│       │   ├── 1_requirements_planning.md
│       │   ├── 2_analysis_specification.md
│       │   ├── 3_architecture_design.md
│       │   ├── 4_implementation_development.md
│       │   ├── 5_testing_quality_assurance.md
│       │   ├── 6_deployment_release.md
│       │   └── 7_maintenance_monitoring.md
│       └── meta/               # PDCA meta-prompts
│           ├── PDCA_cycle.md
│           ├── due_diligence_checklist.md
│           ├── retrospective_review.md
│           ├── error_learning_protocol.md
│           └── continuous_improvement_tracker.md
├── docs/
│   ├── SDLC_ORCHESTRATOR_USER_GUIDE.md
│   ├── SDLC_ORCHESTRATOR_SUMMARY.md
│   └── learning-log.md
├── scripts/
│   └── test-orchestrator.js   # Quick test without MCP server
├── mcp-starter/
│   ├── package.json
│   ├── server.js              # MCP server with sdlc_orchestrate tool
│   └── lib/
│       └── sdlc-orchestrator.mjs
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
