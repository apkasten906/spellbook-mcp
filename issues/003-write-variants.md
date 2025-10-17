# Add `*_write` variants to persist docs

**Status:** In Progress

**Goal:** Tools optionally write artifacts to repo (`docs/`), returning the path and content.

## Scope

- [ ] `pdca_generate_write` → `docs/PDCA/{phase}-{date}.md`
- [ ] `retro_create_write` → `docs/RETRO/retro-{date}.md`
- [ ] `api_scaffold_write` → `docs/API/{name}-{style}.md` or `{name}.yaml`
- [ ] `arch_adr_write` → `docs/ADR/NNNN-{slug}.md`
- [ ] `rca_analyze_write` → `docs/RCA/rca-{date}.md`

## Acceptance

- Idempotent overwrite guard (`--force` to replace).
- Relative paths returned as resource links from the tool.

/labels feature, docs, mcp
/milestone 0.4.0
