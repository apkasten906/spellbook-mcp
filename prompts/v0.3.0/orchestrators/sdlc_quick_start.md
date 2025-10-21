---
version: 0.3.0
phase: Orchestrator
tags: [sdlc, workflow, orchestrator, quick-start]
---

# Quick Start: SDLC Orchestrator

This prompt guides you through running the SDLC orchestrator for your project.

## What This Does

Generates a complete SDLC workflow plan with artifacts for:
- Requirements planning (PDCA)
- Analysis & specification
- Architecture decisions (ADR)
- Testing plan
- CI/CD configuration
- Maintenance & monitoring

## How to Use

**Just tell me your goal!** For example:
- "Run SDLC orchestrator for: Add async retry to client"
- "Generate SDLC plan for: User authentication service"
- "Plan the full lifecycle for: Payment processing API"

I'll:
1. Show you the plan with all phases and artifacts
2. Ask if you want to write the artifacts to disk
3. Optionally commit and push if you approve

## Example Invocation

```json
{
  "goal": "Add async retry to client",
  "scope": "feature",
  "write": false,
  "phases": null
}
```

## Advanced Options

- **scope**: `feature` (default), `service`, or `repo`
- **phases**: Leave empty for all 7 phases, or specify: `["requirements", "testing", "deployment"]`
- **write**: `false` (preview only) or `true` (write to disk)
- **branch**: Leave empty for current branch, or specify target
- **push**: `false` (default, commit only) or `true` (commit + push)

## Safety

- Write is **opt-in** (disabled by default)
- Push is **opt-in** (disabled by default)
- All paths are validated to stay within repo
- You review the plan before artifacts are written

---

**Ready?** Just type your goal and I'll orchestrate the full SDLC workflow!
