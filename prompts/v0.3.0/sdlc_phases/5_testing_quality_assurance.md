---
version: 0.3.0
phase: Testing & Quality Assurance
preferred_model: GPT-4.1 (ChatGPT Plus)
backup_model: Claude Sonnet 4
---

### Prompt: Testing plan and QA checklist

Provide a testing plan for the following context and list test types, priorities, and owners. Include simple commands to run unit and integration tests where appropriate.

**Context:**
{{project_description}}

**Output format:**

```yaml
tests:
  - type: unit
    scope: ...
    owner: ...
  - type: integration
    scope: ...
    owner: ...
```
