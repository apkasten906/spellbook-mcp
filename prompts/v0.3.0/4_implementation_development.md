---
version: 0.3.0
phase: Implementation / Development
preferred_model: Copilot Plus (GPT-5 Codex)
backup_model: GPT-4o / Grok Code Fast 1
---

### Prompt: Feature Stub Generator
> Implement the function {{function_name}} based on the following specification.  
> Provide full docstrings, parameter validation, and one example call.

**Spec:**  
{{function_spec}}

### Prompt: Refactor Advisor
> Review this code for readability, testability, and SOLID adherence.
> Suggest incremental refactors without altering behavior.
