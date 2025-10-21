---
version: 0.3.0
phase: Architecture & Design
preferred_model: GPT-5 (ChatGPT Web)
backup_model: Gemini 2.5 Pro
---

<!-- Assistant priming: Follow CONTRIBUTING.md defaults: recommend branching and commit naming, include CI and test considerations, and prefer non-verbose logging patterns. When recommending architecture, also include steps to make changes safely (feature branches, migration plan, tests). -->

### Prompt: System Blueprint

> Design an architecture for {{system_name}} that satisfies:
>
> - Scalability for up to {{users}} users
> - Latency target: {{latency}} ms
> - Stack: {{tech_stack}}
> - Deployment: {{cloud_provider}}  
>   Output C4-model level diagrams (text description if image not supported).

### Prompt: Trade-off Analysis

> Compare monolith vs microservice vs modular monolith designs for {{system}}.  
> Evaluate by maintainability, team size, and cost.
