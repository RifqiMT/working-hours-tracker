# Product Documentation Standard

**Applies to:** Working Hours Tracker (`working-hours-tracker`)  
**Last updated:** 2026-03-24  
**Audience:** product, engineering, design, and compliance stakeholders

This standard defines how product-facing documentation is authored, structured, maintained, and validated so it stays trustworthy, traceable, and aligned with shipped behavior.

---

## 1. Purpose

- Provide a **single quality bar** for README, PRD, personas, stories, variables, metrics, design, architecture, guardrails, and traceability artifacts.
- Ensure documentation **reflects the current codebase**, not aspirational behavior.
- Enable **enterprise-style traceability** from intent → requirements → implementation → validation.

---

## 2. Document Set and Location

| Artifact | Path | Role |
|----------|------|------|
| Product overview & quick start | `README.md` (repository root) | First contact; stack, features, constraints, doc index |
| Change log | `CHANGELOG.md` (repository root) | Chronological record of shipped product and documentation changes |
| Documentation hub | `docs/README.md` | Curated index and cross-links |
| **This standard** | `PRODUCT_DOCUMENTATION_STANDARD.md` (root) | Governance for all product docs |
| Product Requirements | `docs/PRD.md` | Functional and non-functional requirements |
| User personas | `docs/USER_PERSONAS.md` | Who we build for; informs prioritization |
| User stories | `docs/USER_STORIES.md` | Behavior narratives and acceptance hooks |
| Traceability matrix | `docs/TRACEABILITY_MATRIX.md` | Requirement → story → code → metrics |
| Variables dictionary | `docs/VARIABLES.md` | Names, definitions, formulas, locations, examples, diagrams |
| Product metrics | `docs/PRODUCT_METRICS.md` | Operational and experience metrics |
| OKRs | `docs/METRICS_AND_OKRS.md` | Strategic objectives and key results |
| Design guidelines | `docs/DESIGN_GUIDELINES.md` | Themes, tokens, components, a11y, i18n UX |
| Architecture | `docs/ARCHITECTURE.md` | Runtime model, modules, data flow, integrations |
| Guardrails | `docs/GUARDRAILS.md` | Technical and business boundaries |
| i18n tooling | `scripts/README-i18n-tools.md` | Locale pack generation and verification |

---

## 3. Authoring Principles

1. **Accuracy over completeness:** Prefer a shorter doc that matches code over a long doc that drifts.
2. **One source of truth per fact:** Duplicated numbers (e.g. break caps, standard work minutes) must match `js/constants.js`, `js/time.js`, and `docs/VARIABLES.md`.
3. **Explicit uncertainty:** If behavior is undefined in code, document as “not implemented” or “TBD” rather than inventing rules.
4. **Stable identifiers:** Use story IDs (`US-xxx`), PRD section references, and module paths (`js/…`) for traceability.
5. **Professional tone:** Clear, neutral, present tense; define acronyms on first use (WFO, WFH, i18n, OKR, PPT).

---

## 4. Required Front Matter

Each governed document MUST begin with:

- **Title** (H1)
- **Last updated:** `YYYY-MM-DD` (update when substance changes, not typo fixes only)

Optional but recommended:

- **Owner** (team or role)
- **Related:** links to PRD section / traceability row

---

## 5. Structural Conventions

### 5.1 Tables

- Use Markdown tables for dictionaries (variables, metrics, traceability).
- Columns MUST be consistent within a file (same order and meaning as in `docs/VARIABLES.md` where applicable).

### 5.2 Code and paths

- Reference implementation with backticks: `js/init.js`, `server.js`, `GET /api/working-hours-data`.
- Do not paste large code blocks in PRD; point to module and function responsibility in one sentence.

### 5.3 Diagrams

- Prefer **Mermaid** for variable lineage and data flow (as in `docs/VARIABLES.md`).
- Keep diagrams maintainable: fewer than ~25 nodes where possible.

### 5.4 User stories

- Format: *As a [persona], I want [capability], so that [outcome].*
- Acceptance criteria MUST be testable and reference guardrails or variables when touching data rules.

---

## 6. Traceability Rules

- Any **new PRD requirement** that ships in code MUST have:
  - A story (or explicit amendment to an existing story) in `docs/USER_STORIES.md`
  - A row (or row update) in `docs/TRACEABILITY_MATRIX.md`
- Variable or formula changes MUST update `docs/VARIABLES.md` in the same change set when user-visible or persisted.

---

## 7. Quality Gates (Documentation)

Before release or significant merge:

| Gate | Command or action |
|------|-------------------|
| Locale list vs shell | `npm run verify:i18n` |
| Manual pack structure vs English | `node scripts/verify-manual-locale-packs-offline.js` |
| Quick i18n structural check | `npm run qa:i18n:quick` |
| Doc consistency | Spot-check PRD § vs `docs/VARIABLES.md` for break caps, overtime rule, `auto` language behavior |

---

## 8. Internationalization Documentation

- **UI/help:** File-based `js/i18n-*-locale.js` packs loaded before `js/i18n.js`; English canonical structure in `js/i18n.js` (`translations.en`).
- **User-authored text:** Dynamic translation is optional and documented in `docs/GUARDRAILS.md`; distinguish clearly from UI packs.
- **New English keys:** Update `translations.en`, regenerate or hand-update every manual locale pack, then run verification scripts (see `scripts/README-i18n-tools.md`).

---

## 9. Review Cadence

- **Each feature PR:** Update PRD / stories / variables / traceability as needed.
- **Monthly:** Scan README and metrics for drift.
- **Quarterly:** OKR and persona refresh with product leadership.

---

## 10. Versioning and Change Log

- `CHANGELOG.md` is required and must be updated for each meaningful product/documentation release increment.
- Each changelog entry must include:
  - date (`YYYY-MM-DD`)
  - scope (feature/fix/docs/refactor)
  - impacted files/modules
  - user-facing behavior changes
  - migration or QA notes when relevant.
- Git history remains authoritative for low-level diffs; `CHANGELOG.md` is the human-readable release narrative.
- Deprecations: keep deprecation note for one release cycle before removal, with backward-compatibility note if needed.

---

## Compliance

Documentation that does not meet this standard should be treated as **non-authoritative** for audit or delivery sign-off until brought into alignment.
