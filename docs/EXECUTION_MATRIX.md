# Prompt Execution Matrix (v0.3.0)

> **Goal:** maximize quality per token and reserve your ~300 paid x1 prompts for the highest-impact reasoning.
> **Shorthand:**
> - **Copilot** = GitHub Copilot (chat/inline/agents; repo-aware)
> - **Codex** = Copilot’s code-specialized backend where exposed
> - **GPT-5** = ChatGPT “GPT-5 Thinking” (use for hardest tradeoffs)
> - **GPT-4.1** = top general reasoning in Plus
> - **GPT-4o** = fast, multimodal, cheaper
> - **o3-mini** = low-cost bulk/drafts

## Routing Heuristics
- **Code touching the repo** → **Copilot/Codex** first (inline, PRs, context).
- **Architecture, gnarly bugs, incident analysis** → **GPT-5** or **GPT-4.1**.
- **Bulk transforms / scaffolds** → **Copilot** or **o3-mini**.
- **Vision/UI copy iteration** → **GPT-4o**.
- **Unsure?** → Use the router prompt (see `prompts/router.md`).

---

## SDLC Phases

### 1) Requirements & Planning
| Task | Primary | Why | Fallbacks |
|---|---|---|---|
| Convert stakeholder notes → SMART requirements & acceptance criteria | **GPT-4.1 / GPT-5** | best reasoning & traceability | 4o (cheaper), o3-mini (outline first) |
| Risk register & assumptions list | **GPT-4.1** | causal reasoning | GPT-5 for tricky tradeoffs |
| User story slicing + INVEST checks | **GPT-4.1** | consistent, concise | Copilot (repo-aware labels) |

**Starter prompt**  
> *You are a product analyst. Convert these notes into SMART requirements + acceptance criteria + open questions. Flag ambiguities and missing dependencies. Output: table + bullet risks.*

---

### 2) Design & Architecture
| Task | Primary | Why | Fallbacks |
|---|---|---|---|
| ADRs for key decisions | **GPT-5** | long-horizon tradeoffs | 4.1 |
| Sequence/data-flow (text-first) | **4o** | fast iterations | 4.1 to validate |
| NFRs/SLA/SLO tradeoffs | **GPT-5** | nuanced constraints | 4.1 |

**ADR prompt**  
> *Produce an ADR for {decision}. Options, tradeoffs, rationale, consequences, rollback. Reference requirements {IDs}. Keep to 400 tokens.*

---

### 3) Implementation
| Task | Primary | Why | Fallbacks |
|---|---|---|---|
| Functions, tests, small refactors | **Copilot / Codex** | repo context + speed | o3-mini for boilerplate |
| Multi-file refactors, interface design | **Copilot → GPT-4.1 review** | context + quality review | 4o |
| CLIs/scripts | **Copilot** | great at patterns | o3-mini |

**Copilot cue**  
> *Refactor this module to pure functions with identical behavior; add unit tests; surface TODOs as comments.*

---

### 4) Testing & QA
| Task | Primary | Why | Fallbacks |
|---|---|---|---|
| Unit test scaffolds & fixtures | **Copilot** | fast, local context | o3-mini |
| Property/edge-case generation | **GPT-4.1** | stronger reasoning | 4o |
| Test failure triage (logs) | **GPT-4.1** | explanation quality | GPT-5 for heisenbugs |

**Triage prompt**  
> *Given these logs + diff, hypothesize root cause, reproduction steps, and a minimal fix. Include confidence and alt hypotheses.*

---

### 5) Security & Compliance
| Task | Primary | Why | Fallbacks |
|---|---|---|---|
| Threat modeling (STRIDE/LINDDUN) | **GPT-5** | thoroughness | 4.1 |
| Fix insecure patterns in diff | **Copilot** | inline & contextual | 4.1 for policy checks |
| License/compliance summary | **4.1** | structured outputs | 4o |

---

### 6) DevOps & Release
| Task | Primary | Why | Fallbacks |
|---|---|---|---|
| CI/CD YAML & pipeline edits | **Copilot** | syntax + patterns | o3-mini |
| Release notes from commits | **4o** | concise summaries | 4.1 for enterprise tone |
| Rollbacks & runbooks | **4.1** | clarity under stress | GPT-5 for critical systems |

---

### 7) Maintenance & Support
| Task | Primary | Why | Fallbacks |
|---|---|---|---|
| Bug repro from user reports | **4.1** | inference from noisy input | 4o |
| Deprecation plans & comms | **4.1** | stakeholder tone | GPT-5 |
| Changelogs & docs sync | **4o** | terse | o3-mini |

---

## PDCA (Deming) Overlay — use in every phase

| Step | Task | Primary | Output |
|---|---|---|---|
| **Plan** | Hypothesis, metrics, risks | **4.1 / 5** | checklist + metric targets |
| **Do** | Implement scoped change | **Copilot** | PR with tests |
| **Check** | Analyze telemetry/experiments | **4.1** | table + decision |
| **Act** | Update runbooks/prompts | **4o** | diffs + action items |

**PDCA prompt**  
> *Given change X and metrics M, propose PLAN (hypothesis, metrics, risks), then CHECK analysis template and ACT updates. Keep to ≤200 tokens.*

---

## Budget Tiers (token triage)
- **Tier A (scarce):** architecture, prod incident analysis, threat modeling → **4.1 / 5**
- **Tier B:** release notes, requirement polishing, design critique → **4o**
- **Tier C:** boilerplate, scaffolds → **Copilot, o3-mini**

---

## Quick Fallback Rules
- If Copilot stalls/confabulates → escalate to **4.1** with explicit context.
- If 4o’s summary seems shallow → escalate to **4.1** for deeper reasoning.
- If time is tight but risk is high → go straight to **GPT-5**.

---

## Files
- This doc: `docs/EXECUTION_MATRIX.md`
- Router prompt: `prompts/router.md`
