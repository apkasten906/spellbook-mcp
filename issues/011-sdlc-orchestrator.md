# SDLC Orchestrator

**Status:** Proposed / In Progress

**Goal:** Provide a canonical, runnable orchestration prompt and companion documentation that sequences the Software Development Life Cycle (Requirements → Analysis → Design → Implementation → Testing → Deployment → Maintenance) and ties into existing PDCA, due‑diligence, and write‑variants tooling.

## Motivation

The repository contains high quality per‑phase prompts, PDCA meta‑prompts, and a due‑diligence checklist. However there is no single, canonical prompt or document that coordinates these steps into a repeatable workflow. An orchestrator will make it easy to run an end‑to‑end SDLC flow and emit the recommended artifacts and write targets.

## Acceptance Criteria

- A meta‑prompt at `prompts/v0.3.0/meta/sdlc_orchestrator.md` that:
  - Accepts inputs: `scope` (feature|service|repo), `goal` (short description), `phases` (optional list of SDLC phases to run), and `output_format` (`md`|`json`).
  - For each requested phase, produces:
    - The per‑phase prompt to run (filename and short description).
    - Recommended MCP tool call(s) and arguments (e.g. `pdca_generate`, `tests_plan`, `due_check`).
    - Suggested artifact write targets (e.g. `docs/PDCA/...`, `docs/DUE_DILIGENCE/...`).
  - Integrates PDCA priming and recommends due‑diligence checks at appropriate handoffs.

- A human doc at `docs/SDLC_ORCHESTRATION.md` explaining how to use the orchestrator, example MCP tool calls, and an example run (feature → PDCA + due_diligence + test plan). Include idempotency and write‑variant guidance.

- Example usage (in the doc) showing at least one sequence that produces:
  - PDCA plan for `plan` phase (via `pdca_generate`).
  - Due diligence report (via `due_check`) in `docs/DUE_DILIGENCE/`.
  - Test plan (via `tests_plan`).

- A minimal acceptance test (feature or unit) that calls the orchestrator prompt (or parses its output) and asserts it contains tool call suggestions for PDCA and due_diligence.

## Implementation checklist

- [ ] Create `prompts/v0.3.0/meta/sdlc_orchestrator.md` (meta-prompt).
- [ ] Create `docs/SDLC_ORCHESTRATION.md` with usage, examples, and MCP tool calls.
- [ ] Add the orchestrator to `prompt.catalog.json` with tags `meta`, `sdlc`, `orchestrator`.
- [ ] Add a small Vitest unit test in `mcp-starter/test` that runs `generatePdca` and `generateDueCheck` integration (or asserts orchestrator output mentions them).
- [ ] Wire any small server-side helper if needed (e.g., `mcp-starter/lib/sdlc-orchestrator.mjs`) — prefer a prompt‑only implementation first.
- [ ] Commit, push to branch `feat/sdlc-orchestrator` and open a PR with description and checklist.

## Notes

- This work should temporarily pause work on write‑variants (issue 003) until orchestration is in place. Once the orchestrator exists, we will implement write‑variants to be used by its recommended artifacts.
