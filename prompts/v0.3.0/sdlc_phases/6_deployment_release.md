---
version: 0.3.0
phase: Deployment & Release
preferred_model: GPT-4.1 (ChatGPT Plus)
backup_model: Claude Sonnet 4
---

### Prompt: Deployment checklist and CI/CD configuration

Given project context, produce a CI/CD pipeline checklist, a minimal pipeline YAML for GitHub Actions, and a short rollback plan.

**Context:**
{{project_description}}

**Output format:**

```yaml
ci:
  - job: build
    steps: [...]
  - job: test
    steps: [...]
```
