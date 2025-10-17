---
version: 0.3.0
phase: Testing & QA
preferred_model: GPT-4.1 (ChatGPT Plus)
backup_model: GPT-5 Codex
---

<!-- Assistant priming: Follow CONTRIBUTING.md by default: prefer tests with clear setup/teardown, include CI guidance, and avoid noisy console output (use LOG_MCP for verbose logs). When generating tests, also include minimal CI job snippets and where to place tests in the repo. -->

### Prompt: Unit Test Generator

> For the provided module, generate complete unit tests with:
>
> - Edge cases
> - Mocked dependencies
> - Negative tests
>   Include concise docstrings summarizing test intent.

**Code:**  
{{code_snippet}}

### Prompt: Test Plan Summary

> From the following requirements, produce a test matrix (Functional / Non-Functional / Regression).
