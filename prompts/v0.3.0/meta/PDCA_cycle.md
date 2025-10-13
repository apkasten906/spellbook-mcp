---
version: 0.3.0
purpose: Embed continuous improvement via Plan–Do–Check–Act
preferred_model: GPT-4.1 (ChatGPT Plus)
backup_model: Claude Sonnet 4
---

### Prompt: Apply the PDCA cycle to this task

> For the given SDLC phase {{phase_name}} and artifact {{artifact_name}},
> create a PDCA loop with PLAN, DO, CHECK, ACT.

**Context:**  
{{context_details}}

**Output (YAML):**

```yaml
plan: { goals: [], deliverables: [] }
do: { actions: [] }
check: { evaluation: [] }
act: { followup_actions: [] }
```
