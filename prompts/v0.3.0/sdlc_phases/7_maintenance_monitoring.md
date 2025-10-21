---
version: 0.3.0
phase: Maintenance & Monitoring
preferred_model: GPT-4.1 (ChatGPT Plus)
backup_model: Claude Sonnet 4
---

### Prompt: Monitoring and maintenance plan

Produce a monitoring plan, recommended alerting thresholds, and a small runbook for common incidents.

**Context:**
{{project_description}}

**Output format:**

```yaml
monitoring:
  - metric: error_rate
    threshold: 0.05
    owner: ...
```
