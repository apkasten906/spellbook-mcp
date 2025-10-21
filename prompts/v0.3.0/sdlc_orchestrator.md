---
version: 0.3.0
phase: Orchestrator
preferred_model: GPT-4.1 (ChatGPT Plus)
backup_model: Claude Sonnet 4
---

## SDLC Orchestrator

Run the SDLC orchestrator to guide a user through the full software lifecycle. This prompt is a workflow entrypoint: it will ask for the required inputs (goal, scope, phases) and then invoke the phase prompts to generate artifacts.

Usage (example):

```json
{
  "scope": "feature",
  "goal": "spellbook-mcp",
  "phases": null,
  "write": true,
  "branch": null,
  "message": "sdlc-orchestrate: spellbook-mcp",
  "push": false
}
```

See `sdlc_orchestrator.form.yaml` for a guided form and `sdlc_orchestrator_run.md` for quick-run instructions.
