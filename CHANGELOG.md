# Changelog

All notable changes to Working Hours Tracker are documented in this file.

Format: **date** → category → impact summary → affected areas.

---

## 2026-07-06

### Documentation — Comprehensive enterprise refresh

- Re-authored all core documentation to **Product Documentation Standard v2.0**.
- **README.md:** Full product overview, benefits, features, logic summary, structure, setup, doc map.
- **PRODUCT_DOCUMENTATION_STANDARD.md:** Mandatory inventory, quality rules, release gate, ownership.
- **docs/PRD.md:** Expanded FR-01–FR-14, NFRs, journeys, risks, acceptance criteria.
- **docs/USER_PERSONAS.md:** Five personas with goals, pains, workflows, success criteria.
- **docs/USER_STORIES.md:** Six epics, 20+ stories with testable acceptance criteria.
- **docs/VARIABLES.md:** Full variable dictionary with formulas, locations, examples, Mermaid relationship chart.
- **docs/DESIGN_GUIDELINES.md:** All **36 themes** with CSS token tables; component and a11y rules.
- **docs/PRODUCT_METRICS.md** / **docs/METRICS_AND_OKRS.md:** KPI formulas, targets, OKR mapping.
- **docs/TRACEABILITY_MATRIX.md:** Corrected to actual test files; added FR-08–FR-14.
- **docs/GUARDRAILS.md:** Business, technical, performance, security, operational guardrails.
- Updated supporting docs: ARCHITECTURE, API_CONTRACTS, FEATURE_LOGIC_CATALOG, BUSINESS/TECHNICAL_GUIDELINES, SECURITY_MODEL, TEST_STRATEGY, OPERATIONS_RUNBOOK, DEPLOYMENT_VERCEL, DATA_SCHEMA_EXAMPLES, docs/README hub.

### Code hygiene — Dead code removal

- Removed unused `js/seed-csv.js` and script tag from `index.html` (~53 KB).
- Removed unused exports: `configureProfilePassword`, `getProfileId`, `setVacationDaysForYear`, `updateBulkRowDuplicateHint`, `buildCsvRows`, `formatTimeInZone`, `selectCalendarDate`.
- Removed duplicate `refreshVacationDaysModalStaticText` from `vacation-days.js` (canonical version in `modal.js`).
- Removed unused local variables in `render.js`, `infographic.js`, `voice-entry.js`.
- Deleted `data/.DS_Store`.

**Impact:** Smaller client bundle load; documentation aligned with live codebase; no functional feature removal.

**Verification:** `npm test` — 6/6 pass.

---

## 2026-04-29

### Documentation and governance refresh

- Re-audited repository documentation against product-documentation standard.
- Expanded: README, PRODUCT_DOCUMENTATION_STANDARD, PRD, USER_PERSONAS, USER_STORIES.
- Expanded: VARIABLES, PRODUCT_METRICS, METRICS_AND_OKRS, TRACEABILITY_MATRIX, GUARDRAILS.
- Expanded: SECURITY_MODEL, TEST_STRATEGY, OPERATIONS_RUNBOOK, DEPLOYMENT_VERCEL, API_CONTRACTS, ARCHITECTURE.
- Added: BUSINESS_GUIDELINES, TECHNICAL_GUIDELINES, FEATURE_LOGIC_CATALOG.

### Product and system context

- Documented profile security model, multilingual voice capture, save/sync reliability, deployment controls.
- Refreshed metric formulas and OKR targets.

---

## 2026-04-28

### Reliability and security

- Profile password-gated export behavior.
- Multilingual voice parsing normalization for canonical persistence.
- Initial enterprise documentation baseline.

---

## Document maintenance

When adding entries:

1. Use ISO date `YYYY-MM-DD`.
2. Group by: Features | Fixes | Documentation | Refactor | Security.
3. State **user impact** in plain language.
4. List primary files or modules affected.
