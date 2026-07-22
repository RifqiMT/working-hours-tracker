# Documentation Hub

**Working Hours Tracker** — enterprise documentation suite  
**Last updated:** 2026-07-22  
**Standard:** [PRODUCT_DOCUMENTATION_STANDARD.md](../PRODUCT_DOCUMENTATION_STANDARD.md) v2.4

Use this index as the **navigation source of truth** for product, engineering, design, and operations teams.

---

## Quick start by role

| Role | Start here |
|------|------------|
| **New developer** | [../README.md](../README.md) → [ARCHITECTURE.md](ARCHITECTURE.md) → [MODULE_REFERENCE.md](MODULE_REFERENCE.md) → [VARIABLES.md](VARIABLES.md) |
| **Product manager** | [PRD.md](PRD.md) → [USER_STORIES.md](USER_STORIES.md) → [PRODUCT_METRICS.md](PRODUCT_METRICS.md) |
| **Designer** | [DESIGN_GUIDELINES.md](DESIGN_GUIDELINES.md) → [USER_PERSONAS.md](USER_PERSONAS.md) |
| **Operations / SRE** | [OPERATIONS_RUNBOOK.md](OPERATIONS_RUNBOOK.md) → [DEPLOYMENT_VERCEL.md](DEPLOYMENT_VERCEL.md) |
| **QA** | [TEST_STRATEGY.md](TEST_STRATEGY.md) → [TRACEABILITY_MATRIX.md](TRACEABILITY_MATRIX.md) |
| **Compliance / analyst** | [VARIABLES.md](VARIABLES.md) → [DATA_SCHEMA_EXAMPLES.md](DATA_SCHEMA_EXAMPLES.md) → [GUARDRAILS.md](GUARDRAILS.md) |

---

## 1. Product strategy and requirements

| Document | Description |
|----------|-------------|
| [PRD.md](PRD.md) | Vision, scope, functional/non-functional requirements, risks |
| [USER_PERSONAS.md](USER_PERSONAS.md) | Five personas with goals, pains, success criteria |
| [USER_STORIES.md](USER_STORIES.md) | Epics E1–E6, stories US-101+, acceptance criteria |
| [PRODUCT_METRICS.md](PRODUCT_METRICS.md) | KPI definitions, formulas, targets, collection methods |
| [METRICS_AND_OKRS.md](METRICS_AND_OKRS.md) | Quarterly objectives and key results |

---

## 2. Data, logic, and traceability

| Document | Description |
|----------|-------------|
| [MODULE_REFERENCE.md](MODULE_REFERENCE.md) | Per-module catalog, exports, dependencies (52 JS files) |
| [VARIABLES.md](VARIABLES.md) | Complete variable dictionary + Mermaid relationship chart |
| [DATA_SCHEMA_EXAMPLES.md](DATA_SCHEMA_EXAMPLES.md) | JSON examples and enum reference |
| [FEATURE_LOGIC_CATALOG.md](FEATURE_LOGIC_CATALOG.md) | Behavioral logic by feature area |
| [TRACEABILITY_MATRIX.md](TRACEABILITY_MATRIX.md) | Req → story → code → test → metric |

---

## 3. Design and governance

| Document | Description |
|----------|-------------|
| [DESIGN_GUIDELINES.md](DESIGN_GUIDELINES.md) | 36 themes, tokens, components, accessibility |
| [GUARDRAILS.md](GUARDRAILS.md) | Business and technical limitations |
| [SECURITY_MODEL.md](SECURITY_MODEL.md) | Threat model and controls |
| [BUSINESS_GUIDELINES.md](BUSINESS_GUIDELINES.md) | Positioning and decision principles |
| [TECHNICAL_GUIDELINES.md](TECHNICAL_GUIDELINES.md) | Engineering and quality norms |

---

## 4. Engineering and operations

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System topology and data flow |
| [API_CONTRACTS.md](API_CONTRACTS.md) | REST endpoint semantics and errors |
| [DEPLOYMENT_VERCEL.md](DEPLOYMENT_VERCEL.md) | Production deployment on Vercel |
| [TEST_STRATEGY.md](TEST_STRATEGY.md) | Automated and manual test coverage |
| [OPERATIONS_RUNBOOK.md](OPERATIONS_RUNBOOK.md) | Incidents, monitoring, rollback |

---

## 5. Release control

| Document | Description |
|----------|-------------|
| [RELEASE_NOTES_DRAFT.md](RELEASE_NOTES_DRAFT.md) | Draft notes for next release |
| [RELEASE_SIGNOFF_TEMPLATES.md](RELEASE_SIGNOFF_TEMPLATES.md) | Checklists for release approval |
| [../CHANGELOG.md](../CHANGELOG.md) | Historical development log |

---

## 6. Root-level meta documents

| Document | Description |
|----------|-------------|
| [../README.md](../README.md) | Project overview and quick setup |
| [../PRODUCT_DOCUMENTATION_STANDARD.md](../PRODUCT_DOCUMENTATION_STANDARD.md) | Documentation quality standard |
| [../scripts/README-i18n-tools.md](../scripts/README-i18n-tools.md) | i18n maintenance scripts |
| [../scripts/remove-dead-i18n-keys.js](../scripts/remove-dead-i18n-keys.js) | Orphaned i18n key removal (maintenance) |

---

## 7. Release documentation gate (summary)

Before production deploy:

- [ ] `npm test` passes
- [ ] Docs updated for scope changes (this index + affected files)
- [ ] `CHANGELOG.md` entry added
- [ ] `TRACEABILITY_MATRIX.md` reflects actual tests
- [ ] i18n verify clean if new UI strings

Full checklist: [PRODUCT_DOCUMENTATION_STANDARD.md §7](../PRODUCT_DOCUMENTATION_STANDARD.md)

---

## 8. Document freshness

| Area | Last major refresh |
|------|-------------------|
| Product docs | 2026-07-22 (v2.4) |
| Module reference | 2026-07-22 (v2.4) |
| Variables / schema | 2026-07-22 (v2.4) |
| Design / themes | 2026-07-22 (v2.4) |
| Traceability / tests | 2026-07-22 (v2.4) |
| Operations / security | 2026-07-22 (v2.4) |
| i18n / localization | 2026-07-22 (v2.4) |
