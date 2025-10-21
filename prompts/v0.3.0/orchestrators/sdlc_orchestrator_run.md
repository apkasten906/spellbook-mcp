## SDLC Orchestrator — running the tool (write → \_\_output_sample)

This document shows the exact MCP tool input (the "prompt") for calling the server's
`sdlc_orchestrate` tool in write mode and a convenient local helper to write artifacts to
`__output_sample` for inspection.

Use-case: you want to run the orchestrator from this repo, generate the per-phase artifacts,
and write them into a temporary folder without pushing anything to remote.

Tool name

- `sdlc_orchestrate`

Tool input (example JSON)

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

Meaning of fields

- `scope` — one of `feature|service|repo` (defaults to `feature`).
- `goal` — human-friendly name (will be slugified for filenames).
- `phases` — optional array of phase names; omit (null) to use the default full lifecycle.
- `write` — when true the handler prepares files and calls the repo write helper.
- `branch` — optional branch name for the commit; if `null` the helper uses current branch.
- `message` — commit message when `write:true` and a commit is performed.
- `push` — boolean; when `false` the commit is local only.

Quick run (recommended for local testing)

This repo includes a small helper script that calls the orchestrator logic directly and
writes artifacts into `__output_sample` at the repository root. It's useful for previewing
what will be written before committing.

1. Start the MCP server (if you want the full MCP flow):

```powershell
cd mcp-starter
npm start
```

2. Quick local write (no MCP client required) — run this from the repo root:

```powershell
node scripts/run-sdlc-to-output.js --goal spellbook-mcp
```

This script will create `__output_sample` and place the generated artifact files in the
same layout the `sdlc_orchestrate` tool uses (for example `__output_sample/docs/PDCA/...`).

Notes

- The helper is intentionally simple and calls the same `planSdlc` helper used by the server.
- If you want a true MCP client (CallTool request over the MCP protocol) let me know and I
  can add a small `scripts/call-sdlc-orchestrate.js` that talks to the running server.

---

File: prompts/v0.3.0/orchestrators/sdlc_orchestrator_run.md
