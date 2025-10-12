---
version: 0.3.0
purpose: Enforce pre-merge quality and learning capture
preferred_model: GPT-5 (ChatGPT Web)
backup_model: GPT-4o
---

### Prompt: Validate branch readiness
> Validate compliance with the SDLC Due Diligence Checklist and produce a merge-readiness summary.

**Checklist:** Test automation, Learnings logged, Cleanup, Documentation, Commit/Push/Merge

**Branch Summary:** {{branch_diff}}

**Output (YAML):**
```yaml
checklist_results:
  test_automation: pass|fail
  learnings_logged: pass|fail
  cleanup: pass|fail
  docs_updated: pass|fail
  merge_ready: true|false
notes: []
```
