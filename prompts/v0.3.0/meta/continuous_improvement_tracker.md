---
version: 0.3.0
purpose: Track evolving process improvements across releases
preferred_model: GPT-5 (ChatGPT Web)
backup_model: Claude Sonnet 4.5
---

<!-- Assistant priming: Default to repository CONTRIBUTING.md: when recommending process improvements, align suggestions with branching, PR size, tests, logging, and commit conventions. -->

### Prompt: Improvement Delta Report

> Compare {{release_tag}} vs {{previous_release_tag}} across coverage, quality, docs, learning entries.
