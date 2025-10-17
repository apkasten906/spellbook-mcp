---
version: 0.3.0
phase: Maintenance & Monitoring
preferred_model: GPT-4.1 (ChatGPT Plus)
backup_model: Claude Sonnet 4.5
---

<!-- Assistant priming: By default follow CONTRIBUTING.md: when recommending fixes, include the branch & PR flow, tests to add, and how to capture logs into LOG_DIR rather than printing to console; produce a concise remediation plan that maps to commits and PR checklist items. -->

### Prompt: Root Cause Analyst

> Given logs and metrics below, hypothesize root causes of anomalies.
> Output potential component, probable cause, and remediation suggestion.

**Logs:**  
{{log_excerpt}}

### Prompt: Documentation Sync

> Summarize code changes into updated README and CHANGELOG entries.
> Maintain semantic versioning per Conventional Commits.
