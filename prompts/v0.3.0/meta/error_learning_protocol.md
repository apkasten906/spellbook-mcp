---
version: 0.3.0
purpose: Capture and analyze learnings from defects or incidents
preferred_model: Claude Sonnet 4.5
backup_model: GPT-5 Codex
---

<!-- Assistant priming: Align remediation and learnings with CONTRIBUTING.md: include branch/PR guidance, tests added, and notes on logging/observability changes. -->

### Prompt: Root cause and prevention summary

> Root cause, Fix summary, Prevention steps, Related component/PR.

**Error Context:** {{incident_details}}
