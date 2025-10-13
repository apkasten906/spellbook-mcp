# Slash Commands · Spellbook MCP (v0.3.0)

Concise chat commands for SDLC + PDCA work. Each command includes a short description, required/optional arguments, and model routing hints (from the Execution Matrix).

> **Routing shorthand:**  **COPILOT** = repo-aware code; **4.1** = GPT-4.1; **4o** = GPT-4o; **o3** = o3-mini; **5** = GPT-5

---

## Quick Index

- **PDCA & Due Diligence**
  - [/pdca](#pdca) · [/due-diligence](#due-diligence) · [/retro](#retro)
- **Delivery & Quality**
  - [/tests](#tests) · [/rca](#rca)
- **Architecture**
  - [/arch](#arch)
- **Platform & Pipelines**
  - [/api](#api) · [/ci-cd](#ci-cd)
- **Prompt Utilities**
  - [/prompt list](#prompt) · [/prompt read](#prompt)

---

## /pdca
**Purpose:** Create or update a PDCA artifact for a given phase and target document.

**Syntax**
```
/pdca {phase} {artifact} [--scope <feature|service|repo>] [--metrics <csv>] [--risk <level>]
```

**Args**
- `phase` *(plan|do|check|act)* — required  
- `artifact` *(e.g., plan.md, results.md, actions.md)* — required  
- `--scope` *(feature|service|repo)* — optional, default: `feature`  
- `--metrics` CSV *(e.g., p95,p99,error_rate)* — optional  
- `--risk` *(low|med|high)* — optional, nudges routing toward **5** if `high`

**Output**
- Templated PDCA section with: hypothesis/metrics/risks (Plan), change list (Do), findings (Check), updates (Act)

**Routing**
- **4.1** default; **5** if `--risk high`; **4o** if summary-only

---

## /due-diligence
**Purpose:** Enforce merge-readiness using the SDLC due-diligence checklist.

**Syntax**
```
/due-diligence [--path <dir|file>] [--strict] [--format <md|json>]
```

**Behavior**
- Validates: tests present & passing, learnings log updated, cleanup complete, docs refreshed, commits conventional, PR ready

**Output**
- Markdown or JSON report with pass/fail and action items

**Routing**
- **4.1** (reasoning + structure). **COPILOT** may auto-fix code tasks following the report.

---

## /retro
**Purpose:** Generate or append to a retrospective (iteration, incident, or release).

**Syntax**
```
/retro [--type <iteration|incident|release>] [--window <7d|30d|YYYY-MM-DD:YYYY-MM-DD>] [--include <commits|issues|alerts>]
```

**Output**
- What went well / risks / proposals / owners / next steps

**Routing**
- **4.1** (synthesis). **4o** for quick summaries.

---

## /api
**Purpose:** Produce or update API specs, stubs, and tests.

**Syntax**
```
/api {name} [--style <openapi|grpc|tsoa>] [--lang <ts|go|py|java>] [--tests] [--client] [--examples]
```

**Output**
- OpenAPI/Proto draft + controllers/stubs + example requests/tests (if flags provided)

**Routing**
- **COPILOT** for code scaffolds; **4.1** to reason about resources & contracts.

---

## /ci-cd
**Purpose:** Create or edit CI/CD pipelines and policies.

**Syntax**
```
/ci-cd {service} {env} [--template <minimal|full>] [--gates <lint,test,security,perf>] [--secrets <name,...>]
```

**Examples**
```
/ci-cd github actions --template full --gates lint,test,security
/ci-cd azure prod --gates test,perf --secrets REGISTRY_TOKEN
```

**Routing**
- **COPILOT** for YAML & patterns; **4.1** for gate/risk strategy.

---

## /tests
**Purpose:** Generate or enhance tests (unit/integration/property/e2e).

**Syntax**
```
/tests [--scope <file|dir|changed>] [--type <unit|integration|property|e2e>] [--framework <jest|vitest|pytest|junit>] [--coverage <target%>]
```

**Behavior**
- Suggests edge cases; scaffolds fixtures/mocks; optional property-based examples

**Routing**
- **COPILOT** for scaffolds; **4.1** for edge-case design.

---

## /rca
**Purpose:** Root cause analysis for failing tests/incidents.

**Syntax**
```
/rca [--log <path>] [--since <iso|1h|24h>] [--diff <commit|range>] [--system <name>]
```

**Output**
- Hypotheses, reproduction steps, narrow fix, risk/impact, confidence

**Routing**
- **4.1** default; escalate to **5** for intermittent or systemic failures.

---

## /arch
**Purpose:** Architecture decision records (ADRs), diagrams, NFRs.

**Syntax**
```
/arch {system} [--adr <decision-title>] [--diagram <sequence|c4|dfd>] [--nfr <latency,p99,availability>]
```

**Output**
- ADR with options/tradeoffs/rollback; text-first diagram snippet; NFR matrix

**Routing**
- **5** for high-risk tradeoffs; **4.1** otherwise; **4o** for diagram iteration.

---

## /prompt
**Purpose:** Utilities to explore and read project prompts.

**Syntax**
```
/prompt list [--base <dir>]
/prompt read {relative-path}
```

**Behavior**
- Bridges to MCP tools `prompt.list` and `prompt.read`

**Routing**
- **4o** or **4.1** (light). MCP server handles the file IO.

---

## Conventions & Defaults

- **Paths** are relative to repo root unless specified.
- **Artifacts** live under `docs/` or `prompts/` by default.
- Use flags to **nudge routing** (e.g., `--risk high` → consider **5**).
- All commands support `--format json` for machine-readable outputs where applicable.

---

## Examples (copy/paste)

```bash
/pdca plan plan.md --scope service --metrics p95,error_rate --risk high
/due-diligence --path services/payments --strict --format md
/retro --type iteration --window 30d --include commits,issues
/api orders --style openapi --lang ts --tests --examples
/ci-cd github actions --template full --gates lint,test,security
/tests --scope changed --type property --framework jest --coverage 85
/rca --log logs/api.log --since 24h --diff HEAD~10:HEAD --system orders
/arch checkout --adr "Adopt event sourcing" --diagram sequence --nfr "latency,availability"
/prompt list --base prompts/v0.3.0
/prompt read prompts/v0.3.0/1_requirements_planning.md
```

---

## MCP Mapping (for your server)

- `/prompt list` → `prompt.list` (args: `base?: string`)
- `/prompt read` → `prompt.read` (args: `file: string`)
- Others can be implemented as tools that output Markdown reports/files:
  - `pdca.generate`, `due.check`, `retro.create`, `api.scaffold`, `ci.configure`, `tests.plan`, `rca.analyze`, `arch.adr`

---

*Version:* v0.3.0 · *Owner:* Spellbook MCP · *Change policy:* append new commands; don’t rename without alias.
