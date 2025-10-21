# SDLC Orchestrator - User Guide

## 🎯 Best User Experience (Recommended)

### Option 1: Natural Language (Easiest!)

**Just describe what you want in chat:**

```
Run SDLC orchestrator for: Add async retry to client
```

```
Generate SDLC plan for my feature: User authentication service
```

```
Plan the full lifecycle for: Payment processing API
```

**What happens:**
1. Copilot loads the orchestrator prompt context
2. Calls the `sdlc_orchestrate` tool with your goal
3. Shows you the plan with all phases and artifact paths
4. Asks: "Would you like me to write these artifacts to disk?"
5. If yes, calls the tool again with `write: true`

**Why this is best:** No tool names, no schemas, no forms. Just natural conversation.

---

### Option 2: Reference the Quick Start Prompt

**In chat, type:**

```
#sdlc_quick_start.md
```

Then describe your goal. This loads the full instructions into context for Copilot.

**Benefit:** Copilot has complete context about options (scope, phases, write, push).

---

### Option 3: Direct Tool Call (Power Users)

**Use the wrench icon (🔧) in chat:**

1. Type or click: `sdlc_orchestrate`
2. If you call with **no arguments**, the tool returns the YAML form
3. Fill in the form (goal is required, rest are optional)
4. Tool executes and returns the plan

**Current blocker:** The MCP extension is validating the `repo_commit` tool schema client-side and seeing a cached version without proper `items`. This should resolve after:
- Restarting the MCP server (Developer → Reload Window in VS Code)
- Or clearing the extension cache

---

## 📋 What the Orchestrator Generates

For a goal like **"Add async retry to client"**, you get:

1. **Requirements** → `docs/PDCA/add-async-retry-to-client-requirements.md`
   - PDCA plan with metrics and acceptance criteria
   
2. **Analysis** → `docs/API/add-async-retry-to-client-analysis.md`
   - Specification and API surface analysis
   
3. **Architecture** → `docs/ADR/add-async-retry-to-client-architecture.md`
   - Architecture Decision Record with options and tradeoffs
   
4. **Implementation** → *(No artifact - this is code work)*
   
5. **Testing** → `docs/TESTS/add-async-retry-to-client-testing.md`
   - Test plan with coverage targets and framework recommendations
   
6. **Deployment** → `docs/CI/add-async-retry-to-client-deployment.yaml`
   - CI/CD pipeline configuration
   
7. **Maintenance** → `docs/RCA/add-async-retry-to-client-maintenance.md`
   - Monitoring and due-diligence checklist

---

## 🛡️ Safety & Control

### Write Mode (Opt-in)
- **Default:** `write: false` (preview only, no files written)
- **To write:** Set `write: true` or respond "yes" when Copilot asks

### Push Mode (Double Opt-in)
- **Default:** `push: false` (commit locally only)
- **To push:** Set `push: true` (requires write: true)
- **Safety:** Won't push if no remote configured

### Path Validation
- All artifact paths are validated to stay within your repository
- Server rejects any attempt to write outside safe boundaries

---

## ⚙️ Advanced Options

### Customize Scope
```json
{
  "goal": "User auth service",
  "scope": "service"  // Options: feature, service, repo
}
```

### Select Specific Phases
```json
{
  "goal": "Fix login bug",
  "phases": ["requirements", "testing", "deployment"]
}
```

### Custom Branch & Message
```json
{
  "goal": "Add retry logic",
  "write": true,
  "branch": "feat/retry-logic",
  "message": "docs: add SDLC artifacts for retry feature",
  "push": false
}
```

---

## 🚀 Quick Test (Without MCP Server)

Run the orchestrator locally to see what it generates:

```powershell
# Test with default goal
node scripts/test-orchestrator.js

# Test with custom goal
node scripts/test-orchestrator.js "Your feature name here"
```

This prints the plan JSON and lists all artifacts that would be created.

---

## 🔧 Troubleshooting

### "Failed to validate tool repo_commit"

**Cause:** The MCP extension cached an older tool schema.

**Fix:**
1. In VS Code: `Developer: Reload Window` (Ctrl+R)
2. Or restart the MCP server via Command Palette:
   - `MCP Servers: List`
   - Find `spellbook-mcp`
   - Click `Restart Server`

### "Tool not found: sdlc_orchestrate"

**Cause:** Server isn't running or didn't load the updated tool list.

**Fix:**
1. Check MCP server is running: `MCP Servers: List` → `spellbook-mcp` → `Start Server`
2. Verify tools loaded: Click `List Tools` button

### Server exits with code 1

**Common causes:**
- SIGINT received (you stopped it with Ctrl+C) - normal
- Missing dependencies - run `npm --prefix mcp-starter install`
- Syntax error in server.js - check `get_errors` output

---

## 📚 Related Files

- **Orchestrator Logic:** `mcp-starter/lib/sdlc-orchestrator.mjs`
- **Server Tool:** `mcp-starter/server.js` (search for `sdlc_orchestrate`)
- **Form Schema:** `prompts/v0.3.0/orchestrators/sdlc_orchestrator.form.yaml`
- **Quick Start Prompt:** `prompts/v0.3.0/orchestrators/sdlc_quick_start.md`
- **Phase Prompts:** `prompts/v0.3.0/sdlc_phases/1_requirements_planning.md` (and 2-7)

---

## 🎬 Example Session

**User:** Run SDLC orchestrator for: Add rate limiting to API

**Copilot:** I'll generate an SDLC plan for "Add rate limiting to API". This will create artifacts for all 7 phases.

*[Calls sdlc_orchestrate tool with goal, shows plan JSON]*

Here's the plan:
- Requirements: `docs/PDCA/add-rate-limiting-to-api-requirements.md`
- Analysis: `docs/API/add-rate-limiting-to-api-analysis.md`
- ... (all 7 phases)

Would you like me to write these artifacts to disk?

**User:** Yes

**Copilot:** *[Calls tool again with write: true, commits files]*

✅ Written 6 artifacts and committed to branch `feat/sdlc-orchestrator`.

---

**🎉 That's it! Start with natural language and let Copilot handle the rest.**
