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

### Prompt checklist additions

- [ ] prompt: `due_diligence` — add a prompt that produces a due-diligence checklist suitable for writing to `docs/DUE_DILIGENCE/{scope}-{date}.md`. The prompt should accept:
	- `scope` (string) - one of `feature`, `service`, `repo`; default `feature`.
	- `strict` (boolean) - when true, treat missing items as failures.
	- `format` (string) - `md` or `json`, default `md`.
	- `write` (boolean) - if true, the tool will write the file to disk using write-variants behavior; requires `files` shape consumed by write helper.

	Acceptance: produced artifact is idempotent (won't overwrite unless `--force`), returns relative path and content summary.

/labels feature, docs, mcp
/milestone 0.4.0
