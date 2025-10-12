---
version: 0.3.0
phase: Analysis & Specification
preferred_model: GPT-4.1 (ChatGPT Plus)
backup_model: GPT-5 Codex (Preview)
---

### Prompt: API Contract Draft
> Given the requirements below, draft an **OpenAPI 3.1** spec for all major endpoints.
> Include authentication, pagination, and error response conventions.

**Requirements:**  
{{requirements_text}}

**Output:**  
YAML OpenAPI snippet

### Prompt: Data Model Extraction
> From this domain description, derive a relational schema and corresponding ORM entity models.
> Highlight normalization issues and indexes to optimize queries.
