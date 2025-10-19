# SDLC Orchestration

This document describes the SDLC Orchestrator tool and conventions used by the `feat/sdlc-orchestrator` work.

## Purpose

The SDLC Orchestrator produces a per-phase plan that maps phases to prompts, recommended MCP tool calls, and deterministic artifact write targets. The orchestrator is intentionally conservative: it returns suggested artifacts and toolCalls, and will only write files when an explicit write/commit flag is provided.

## Tool: `sdlc_orchestrate`

- Input (JSON):
  - `goal` (string) — human goal/slug for which artifacts are generated (e.g., "Example Service").
  - `scope` (optional string) — feature/service/repo.
  - `phases` (optional array) — subset of phases to include (defaults to full SDLC phases).
  - `write` (optional boolean) — if true, server may call the `repo_commit` tool to persist artifacts (disabled by default).

- Output: JSON text containing `{ scope, goal, plan }` where `plan` is an array of:
  - `phase` — phase name (e.g., `requirements`).
  - `prompt` — relative path to the prompt template (e.g., `prompts/v0.3.0/1_requirements_planning.md`).
  - `toolCalls` — recommended MCP tool calls (array of { tool, args }).
  - `artifact` — deterministic artifact path (object or string) to be used when writing artifacts.

## Deterministic artifact naming

We use a deterministic, reproducible naming pattern for artifacts to make them easy to reference in tests and documentation. The naming convention is:

`docs/<SUBFOLDER>/<goal-slug>-<phase>.<ext>`

Rules & examples:
- `goal-slug` is the goal lowercased and slugified (spaces -> `-`, non-alphanumerics removed, truncated to 64 chars).
- `phase` is the canonical phase name (e.g., `requirements`, `architecture`, `testing`).
- Extension depends on artifact type (`.md` for markdown, `.yaml` for CI files, etc.).

Examples:
- `docs/PDCA/example-service-requirements.md`
- `docs/ADR/example-service-architecture.md`
- `docs/TESTS/example-service-testing.md`

Notes:
- Filenames do NOT include git SHAs, timestamps, or random tokens. This is intentional: artifacts should be predictable.
- Avoid write collisions by design: callers can inspect the file system or consult VCS history before persisting; the server will not auto-push unless explicitly requested.

## Writing & committing artifacts

Writing artifacts is opt-in. If you pass `write: true` to `sdlc_orchestrate` the server may take the recommended artifact contents and call the `repo_commit` helper. Behavior:

- `write: false` (default) — no writes, orchestrator returns plan only.
- `write: true` — server will prepare files and call `repo_commit` with `push: false` by default. The server will only attempt to push if the caller passes an explicit `push: true` and a remote is configured.

Security & safety:
- Commits are local by default; push must be explicit.
- The `repo_commit` helper validates paths to remain inside the repository and refuses to write outside safe boundaries.

## Example usage

Call via MCP tool with arguments (JSON):

```
{
  "name": "sdlc_orchestrate",
  "arguments": {
    "goal": "Example Service",
    "phases": ["requirements","architecture","testing"],
    "write": false
  }
}
```

The tool returns JSON text. If you later want to persist artifacts, call again with `write: true` and optionally `push: true`.

## Where prompts live

Prompts are under `prompts/v0.3.0/` and meta-prompts are under `prompts/v0.3.0/meta/`. The orchestrator references these files directly for phase guidance.

## Recommended follow-ups

- Add an acceptance-level feature that runs `sdlc_orchestrate` with `write: true` in a disposable container (test image) and verifies the files are created and committed locally (no push).
- Add a `--dry-run` or explicit preview mode that emits the file manifest but does not perform repo commits.
