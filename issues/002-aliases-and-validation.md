# Add aliases + input validation

**Status:** In Progress

**Goal:** Support legacy dotted tool names and improve arg validation UX.

## Tasks

- [ ] Normalize dotted names → underscored via alias map.
- [ ] Central JSON Schemas per tool; return MCP InvalidParams with friendly messages.
- [ ] Add minimal value validations (enum checks, required combos).

## Acceptance

- Calling either `prompt.read` or `prompt_read` works.
- Helpful error messages for missing/invalid args.

/labels polish, mcp
/milestone 0.4.0
