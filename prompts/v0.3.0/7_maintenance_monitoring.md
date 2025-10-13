---
version: 0.3.0
phase: Maintenance & Monitoring
preferred_model: GPT-4.1 (ChatGPT Plus)
backup_model: Claude Sonnet 4.5
---

### Prompt: Root Cause Analyst

> Given logs and metrics below, hypothesize root causes of anomalies.
> Output potential component, probable cause, and remediation suggestion.

**Logs:**  
{{log_excerpt}}

### Prompt: Documentation Sync

> Summarize code changes into updated README and CHANGELOG entries.
> Maintain semantic versioning per Conventional Commits.
