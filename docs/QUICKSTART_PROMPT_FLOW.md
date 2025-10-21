# Quickstart — Prompt-driven flow

This quickstart shows a minimal prompt-driven workflow using the MCP server in this repository.
It demonstrates listing prompts, reading a prompt, calling the SDLC orchestrator, and optionally persisting artifacts.

PowerShell examples (local dev)

1. List available prompts

```powershell
# Call the `prompt_list` tool via your MCP client or by invoking the server directly if you have a client.
# Example payload (MCP CallToolRequest):
{
  "name": "prompt_list",
  "arguments": { "base": "prompts/v0.3.0" }
}

# In practice use your MCP client or the CLI helper (not bundled here) to make the call.
```

2. Read a prompt template

```powershell
# Example request payload
{
  "name": "prompt_read",
  "arguments": { "file": "prompts/v0.3.0/1_requirements_planning.md" }
}

# The server returns the prompt content as text in the MCP response. Parse and send to your LLM client.
```

3. Run the SDLC orchestrator (preview)

```powershell
{
  "name": "sdlc_orchestrate",
  "arguments": {
    "goal": "Example Service",
    "phases": ["requirements","architecture","testing"],
    "write": false
  }
}

# The response contains JSON text with `scope`, `goal`, and `plan` (array of { phase, prompt, toolCalls, artifact }).
```

4. Persist artifacts (explicit write)

```powershell
{
  "name": "sdlc_orchestrate",
  "arguments": {
    "goal": "Example Service",
    "phases": ["requirements","architecture"],
    "write": true,
    "push": false
  }
}

# This will prepare files and create a local git commit using the repo_commit helper. Push is disabled by default.
```

Notes and guidance

- The orchestrator returns deterministic artifact paths: `docs/<SECTION>/<goal-slug>-<phase>.md`.
- Writing is opt-in and safe by default: commits are local unless `push:true` and a remote exists.
- For local development, run unit tests with:

```powershell
npm --prefix mcp-starter run test:unit
```

Where to go next

- To make client scripts easier, consider adding a small CLI wrapper in `mcp-starter/bin/` that formats MCP requests and parses responses.
- To validate outputs programmatically, parse the JSON text in the tool response and inspect `plan[].artifact` paths.

Troubleshooting

- If the orchestrator can't read a prompt file, it will include a minimal scaffold in the generated artifact; ensure `prompts/v0.3.0/` exists.
- If commits fail, check repository write permissions and `git` configuration (user.name/user.email), and ensure you're on a branch.
