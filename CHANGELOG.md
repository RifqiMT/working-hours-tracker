# Changelog

All notable changes to Working Hours Tracker are documented in this file.

Format: **date** → category → impact summary → affected areas.

---

## 2026-07-22

### Documentation — Comprehensive enterprise audit (v2.4)

- Full suite re-audit against live codebase (28 feature modules, 24 locale packs, 36 themes, 7 maintenance scripts, 6 automated tests).
- **PRODUCT_DOCUMENTATION_STANDARD.md** → **v2.4**; all `docs/*` freshness dates set to 2026-07-22.
- **MODULE_REFERENCE.md:** Maintenance scripts count corrected **14 → 7**; `LEGACY_DEFAULT_TIMEZONE` listed in constants exports.
- **DATA_SCHEMA_EXAMPLES.md:** Documented `passwordEncrypted` alias alongside `passwordHash`.
- **SECURITY_MODEL.md**, **DEPLOYMENT_VERCEL.md**, **GUARDRAILS.md (SG-07):** Production `Permissions-Policy: microphone=()` vs voice entry (FR-04) explicitly documented.
- **PRD.md** → version 2.4; language count clarified to **25 UI languages**; microphone policy risk added.
- **README.md**, **docs/README.md**, **RELEASE_NOTES_DRAFT.md**, **TRACEABILITY_MATRIX.md**, **ARCHITECTURE.md** (env key aliases) aligned.
- Prefer precise wording: English embedded + 24 packs = 25 languages (not vague “25+”).

**Verification:** `npm test` 6/6 pass; `npm run verify:i18n` OK.

### Code hygiene — Dead code, unused CSS tokens, orphaned i18n, obsolete scripts

- Removed unused export `W.buildAppTooltipText` (`app-tooltip.js`); internal `buildTooltipText` retained.
- Removed unused helpers: `parseTimeToMinutes` (`data-sync.js`), `setLabelTextInContainer` (`modal.js`), `applyTooltipTemplate` (`render.js`).
- Removed unused CSS custom properties from `index.html`: `--entry-row-hover-bg`, `--entry-row-divider`, `--shadow-soft`, `--shadow-strong`, `--tip-pad-block`, `--tip-panel-bg`, `--tip-panel-border`, `--tip-section-gap`.
- Removed 39 verified orphaned i18n key paths from `translations.en` and all 24 locale packs (prior dead set plus unused infographic/modal/profileAuth leftovers). Extended `scripts/remove-dead-i18n-keys.js`.
- Deleted obsolete one-shot i18n patch scripts and `stats-summary-translations.json`; kept generate/verify/sync/remove tooling.
- Updated `docs/DESIGN_GUIDELINES.md`, `docs/MODULE_REFERENCE.md`, `scripts/README-i18n-tools.md`.

**Impact:** Smaller client payloads and cleaner maintenance surface; no intentional user-facing behavior change.

**Verification:** `npm test` 6/6 pass; `npm run verify:i18n` OK. Offline pack completeness check remains pre-existing incomplete (improved missing counts vs prior baseline).

---

## 2026-07-08

### Documentation — Comprehensive enterprise audit (v2.3)

- Full codebase audit of 52 `js/` files (28 feature modules + 24 locale packs), `lib/`, `api/`, `dev/`, and `scripts/`.
- **New `docs/MODULE_REFERENCE.md`:** Per-module catalog with exports, dependencies, dependency graph, and external library matrix.
- **VARIABLES.md:** Expanded §10 runtime state (28 variables with full column format); fixed `_entriesSort` → `_entriesSortBy` / `_entriesSortDir`; updated Mermaid relationship chart with runtime nodes.
- **README.md**, **docs/README.md**, **PRODUCT_DOCUMENTATION_STANDARD.md** bumped to v2.3.
- **ARCHITECTURE.md:** Cross-link to module reference.

**Verification:** `npm test` 6/6 pass; `npm run verify:i18n` OK.

### Documentation — Comprehensive enterprise refresh (v2.2)

- Re-aligned entire documentation suite with post-hygiene codebase (52 client modules, 24 locale packs, 6 automated tests).
- **README.md:** Complete module inventory, i18n maintenance scripts, v2.2 standard reference.
- **PRODUCT_DOCUMENTATION_STANDARD.md:** v2.2; added i18n dead-key tooling to inventory.
- **VARIABLES.md:** App tooltip module, removed i18n keys registry, relationship chart update.
- **ARCHITECTURE.md**, **FEATURE_LOGIC_CATALOG.md:** `app-tooltip.js`, `smart-select.js`, `entries-search.js` documented.
- **GUARDRAILS.md**, **TECHNICAL_GUIDELINES.md:** i18n hygiene guardrails and maintenance workflow.
- **RELEASE_NOTES_DRAFT.md:** v2.2 release summary.
- All `docs/*` freshness dates and cross-references updated to 2026-07-08.

### Code hygiene — Dead code and orphaned i18n cleanup

- Removed unused export `W.buildAppTooltipText` (`app-tooltip.js`).
- Removed unused `W._mainSectionsBottomEdgeObserver` assignment (`init.js`); `ResizeObserver` kept as local variable.
- Removed duplicate tooltip helpers in `render.js` `renderStatsBox`; now uses `W.buildAppTooltipAttr` / `W.buildAppTooltipData` directly.
- Removed 21 verified orphaned i18n keys from `i18n.js` and all 24 locale packs:
  - `layout.category3`, `profile.language.rolloutGroup.*`, superseded `clockEntry.clockInQuick*` / `entryExistsHint`, unused `filters.overtime|duration|description` labels and `filters.options.duration`, unused `render.descriptionAria|workingHoursLabel|breakLabel`, `common.saving|saved`, `ppt.selectYears`, `toasts.profilePasswordUpdated`.
- Added `scripts/remove-dead-i18n-keys.js` for repeatable orphaned-key removal.

**Impact:** Smaller translation payloads; no user-facing behavior change.

**Verification:** `npm test` 6/6 pass; `npm run verify:i18n` OK.

---

## 2026-07-07

### Documentation — Alignment with codebase (v2.1)

- Updated entire documentation suite to reflect **sync-status.js** module, autosave status badge, and 2026-07-07 code hygiene.
- **VARIABLES.md:** Added sync status keys, autosave constants, DOM data attributes.
- **ARCHITECTURE.md**, **FEATURE_LOGIC_CATALOG.md:** Documented sync status data flow.
- **DESIGN_GUIDELINES.md:** Added `save-data-status` component styles.
- **TRACEABILITY_MATRIX.md**, **USER_STORIES.md:** Mapped FR-05 to `sync-status.js`.
- **README.md**, **docs/README.md:** Updated project structure and latest changelog pointer.
- **RELEASE_NOTES_DRAFT.md:** Current release summary.

### Code hygiene — Orphaned i18n and exports

- Removed unused `profileAuth.configure*` translation keys (leftover from removed `configureProfilePassword`) from `i18n.js` and all 24 manual locale packs.
- Removed unused `profile.prewarmUiPack` UI strings (pre-cache button removed from UI; programmatic prewarm functions retained).
- Removed unnecessary public exports: `W.exportInfographicTable`, `W.getStatusIcon`, `W.moveEntriesModalsToCard` (functions remain internal where still used).

**Impact:** Smaller translation payloads; no user-facing behavior change.

**Verification:** `npm test` 6/6 pass; `npm run verify:i18n` OK.

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
