---
version: 0.3.0
phase: Requirements & Planning
preferred_model: GPT-4.1 (ChatGPT Plus)
backup_model: Claude Sonnet 4
---

### Prompt: Feature Scoping & Story Generation

> You are a product strategist AI. Based on the context below, generate:
>
> 1. A concise product vision statement
> 2. Epics and user stories (INVEST format)
> 3. Acceptance Criteria (Gherkin)
> 4. Technical assumptions and risks

**Context:**  
{{project_description}}

**Output format:**

```yaml
epics:
  - name: ...
    stories:
      - as_a: ...
        i_want: ...
        so_that: ...
acceptance_criteria:
  - given: ...
    when: ...
    then: ...
risks:
  - ...
```
