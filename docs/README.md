# Documentation Index

**Purpose:** This folder is the **authoritative** product and technical library for Working Hours Tracker. Use it for requirements, UX rules, metrics, variable definitions, API contracts, and release governance.

**Current state:** All mandatory documents listed in `PRODUCT_DOCUMENTATION_STANDARD.md` are maintained here or at repo root (`README.md`, `CHANGELOG.md`, `PRODUCT_DOCUMENTATION_STANDARD.md`).

**Operational guidance:** Start from `PRD.md` for intent, then use `TRACEABILITY_MATRIX.md` to confirm coverage before release. Update `CHANGELOG.md` whenever you change behavior or documentation in a user-visible way.

---

## Document map

| Document | Description |
|----------|-------------|
| `ARCHITECTURE.md` | System architecture, module boundaries, runtime model, data flow, Infographic and tooltip subsystems. |
| `API_CONTRACTS.md` | Backend endpoints, payload shapes, status codes, merge rules. |
| `DATA_SCHEMA_EXAMPLES.md` | Example root payloads, entries, and formula walkthroughs. |
| `PRD.md` | Product requirements, scope, functional and non-functional requirements, documentation index. |
| `USER_PERSONAS.md` | Personas, goals, pain points, workflows, persona-to-feature matrix. |
| `USER_STORIES.md` | User stories, acceptance criteria, Infographic and UX story coverage. |
| `VARIABLES.md` | Variable dictionary (name, friendly name, definition, formula, location, example), Mermaid relationship charts. |
| `PRODUCT_METRICS.md` | KPI definitions (PM-xx), monitoring and alert guidance. |
| `METRICS_AND_OKRS.md` | Product OKRs and supporting team metrics. |
| `DESIGN_GUIDELINES.md` | UX/UI principles, responsive rules, components, **global tokens**, **named themes**, Infographic toolbar behavior. |
| `TRACEABILITY_MATRIX.md` | TM-xx mapping: requirements → stories → code → metrics → validation. |
| `GUARDRAILS.md` | Technical and business constraints and release gate checklist. |
| `RELEASE_SIGNOFF_TEMPLATES.md` | Sign-off checklists for product, design, engineering, QA, documentation. |
| `RELEASE_NOTES_DRAFT.md` | Draft text for external release notes. |

## Cross-cutting topics

The following behaviors are described across several files (keep them consistent when editing):

- **Statistics custom tooltips** — `ARCHITECTURE.md` §5b, `DESIGN_GUIDELINES.md` §6, `GUARDRAILS.md`, `VARIABLES.md` §3b–3c, `TRACEABILITY_MATRIX.md` (TM-011, TM-014).
- **Infographic clusters, timeframe bucketing, CSV parity** — `PRD.md` FR-05, `VARIABLES.md` §3e–3f, `DESIGN_GUIDELINES.md` Infographic section, `ARCHITECTURE.md`, `USER_STORIES.md` US-016–US-020, `TRACEABILITY_MATRIX.md` TM-016–TM-020.
- **Internet speed telemetry** — `ARCHITECTURE.md` §5c, `VARIABLES.md` §3d, `GUARDRAILS.md`, `PRODUCT_METRICS.md` PM-14.

## Cross-file workflows

| If you need to… | Read first… |
|-----------------|-------------|
| Scope a feature | `PRD.md` |
| Write acceptance tests | `USER_STORIES.md`, `TRACEABILITY_MATRIX.md` |
| Define or audit a number | `VARIABLES.md`, `PRODUCT_METRICS.md` |
| Change colors or modals | `DESIGN_GUIDELINES.md`, `index.html` theme block |
| Change API behavior | `API_CONTRACTS.md`, `server.js` |
| Release | `CHANGELOG.md`, `RELEASE_SIGNOFF_TEMPLATES.md`, `GUARDRAILS.md` §8 |

## Repository root (related)

| File | Role |
|------|------|
| `../README.md` | Product overview, setup, documentation map for stakeholders. |
| `../CHANGELOG.md` | Historical and unreleased change log. |
| `../PRODUCT_DOCUMENTATION_STANDARD.md` | Documentation governance and mandatory set. |

## Change governance

All major documentation updates should include a corresponding entry in `../CHANGELOG.md`.
