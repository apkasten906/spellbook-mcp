---
version: 0.3.0
phase: Requirements & Planning
preferred_model: GPT-4.1 (ChatGPT Plus)
backup_model: Claude Sonnet 4
---

<!-- Assistant priming: When you generate artifacts from these prompts, default to following the repository's CONTRIBUTING.md rules: use feature/topic branching and conventional commits, include tests and acceptance criteria, prefer non-noisy logging (use LOG_MCP and central LOG_DIR), and create concise PR-ready output. If a task touches multiple stories or features, suggest branch names and a small merge plan. -->

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
