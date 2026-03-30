# Product Documentation Standard

**Purpose:** This standard defines how product and technical documentation must be authored, reviewed, and maintained for Working Hours Tracker so that product, design, engineering, QA, and operations share one accurate source of truth.

**Current state:** The mandatory document set listed in Section 2 is maintained in-repo; feature work is not complete until impacted documents and `CHANGELOG.md` are updated in the same delivery cycle as code.

**Operational guidance:** Use Section 4 (Update Triggers) as a checklist when opening a PR. Use Section 9 (Release Readiness) before tagging a release.

---

## 1. Objectives

- Keep documentation aligned with current shipped behavior.
- Provide consistent, enterprise-ready structure across all product docs.
- Enable traceability from business goals to implementation artifacts.
- Reduce ambiguity for product, design, engineering, QA, and operations teams.

## 2. Mandatory Documentation Set

The following files are required and treated as first-class product artifacts:

- `README.md`
- `docs/README.md`
- `docs/ARCHITECTURE.md`
- `docs/PRD.md`
- `docs/USER_PERSONAS.md`
- `docs/USER_STORIES.md`
- `docs/VARIABLES.md`
- `docs/PRODUCT_METRICS.md`
- `docs/METRICS_AND_OKRS.md`
- `docs/DESIGN_GUIDELINES.md`
- `docs/TRACEABILITY_MATRIX.md`
- `docs/GUARDRAILS.md`
- `CHANGELOG.md`

## 3. Content Quality Requirements

Each document must be:

- Accurate to latest logic and UI behavior.
- Written in plain, professional language.
- Structured with headings, short paragraphs, and scannable tables.
- Version-aware (what changed, when, and why).
- Actionable for implementation and QA.

## 4. Update Triggers

Documentation updates are mandatory when changes affect:

- User flows, UX structure, or visual behavior.
- Data model, variables, formulas, or metrics definitions.
- APIs, integration points, storage schema, or sync logic.
- Localization strategy, accessibility behavior, or responsive rules.
- Any change to tooltip systems (especially Statistics custom tooltips) or hover micro-label content must update docs and be validated against locale pack completeness.
- Any new/changed i18n dependencies must be reflected in the Variables/Traceability/Guardrails docs so all locale packs remain consistent.
- Any change to semantic filter ordering (month/weekday/day/week) must be documented in PRD, stories, and UX guidance to prevent regression to alphabetical sorting.
- Any modal size-parity change across major analytics modals (Statistics, Infographic, PPT generator) must be reflected in architecture and design guidelines.
- Any internet-status telemetry change (real-time speed display, daily min/max/avg logic) must update variables, metrics, and guardrails documentation.
- Any change to **Infographic** behavior (cluster names, timeframe buckets, period sort order, CSV export columns, clock grid layout, duration display rules in the modal) must update `PRD.md`, `USER_STORIES.md`, `VARIABLES.md`, `DESIGN_GUIDELINES.md`, `ARCHITECTURE.md`, and `TRACEABILITY_MATRIX.md` as applicable.
- Any change to **which Infographic clusters show the timeframe control** (visibility, disabled state, or panel mapping) must update `PRD.md` (**FR-05**), `USER_STORIES.md` (Infographic stories), `VARIABLES.md` (UI-state variables), `DESIGN_GUIDELINES.md` (toolbar behavior), `GUARDRAILS.md`, and `TRACEABILITY_MATRIX.md`.
- Product goals, KPIs, OKRs, or release scope.

## 5. Minimum Sections Per Document

- **Purpose**: scope and intent of the document.
- **Current State**: latest validated behavior.
- **Definitions**: key terms and domain language.
- **Operational Guidance**: how teams should apply the content.
- **Change Notes**: links to affected release entries in `CHANGELOG.md`.

## 6. Traceability Rules

- Every PRD requirement must map to user stories and implementation artifacts.
- Every major feature must map to at least one measurable metric.
- Every metric must reference its source variables and calculation formula.
- Traceability IDs must be stable and referenced in `docs/TRACEABILITY_MATRIX.md`.

## 7. Writing Conventions

- Use active voice and present tense.
- Avoid vague qualifiers (for example: “might”, “somehow”, “etc.”) in normative sections.
- Define acronyms on first use.
- Use consistent naming with source code identifiers where applicable.

## 8. Review and Governance

- Product owner approves PRD, personas, stories, and metrics intent.
- Design owner approves design-system and responsive behavior updates.
- Engineering owner approves architecture, variables, guardrails, and technical limits.
- Documentation review is part of done criteria for feature-complete work.

## 8b. Definitions (governance vocabulary)

| Term | Meaning |
|------|---------|
| **Mandatory set** | Files in Section 2; treated as release artifacts, not optional notes. |
| **Traceability ID** | Stable IDs in `docs/TRACEABILITY_MATRIX.md` (for example `TM-0xx`) linking requirements to stories and code. |
| **Variable** | A named quantity or field documented in `docs/VARIABLES.md` with formula and UI location. |

## 9. Change Notes

When you update this standard, add a short entry to `CHANGELOG.md` under **Unreleased** or the active version so teams know governance rules shifted.

## 10. Release Readiness Checklist

- [ ] Docs reflect current feature behavior and constraints.
- [ ] Traceability matrix includes newly added or changed requirements.
- [ ] Variables and metrics definitions are complete and formula-verified.
- [ ] Guardrails list technical and business limitations for the release.
- [ ] Changelog entry includes summary, impact, and migration notes (if needed).

---

## Document history

Updates to this file are recorded in `CHANGELOG.md`. For product intent, always prefer `docs/PRD.md` and the traceability matrix over this governance layer alone.
