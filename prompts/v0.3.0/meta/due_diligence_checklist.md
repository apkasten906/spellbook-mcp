---
version: 0.3.0
purpose: Enforce pre-merge quality and learning capture
preferred_model: GPT-5 (ChatGPT Web)
backup_model: GPT-4o
---

<!-- Assistant priming: When running the due diligence checklist, ensure the branch and PR follow CONTRIBUTING.md: branch naming, tests, docs, and logging best practices. Suggest fixes and branch steps if any item fails. -->

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
