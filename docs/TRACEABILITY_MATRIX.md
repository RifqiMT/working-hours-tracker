# Enterprise Traceability Matrix

**Product:** Working Hours Tracker  
**Last updated:** 2026-07-22

Maps **requirements → user stories → code → automated tests → metrics**. Test references reflect **actual** files in `tests/` (no fictional test paths).

---

## 1. Functional Requirements

| Req ID | Requirement summary | User stories | Code references | Automated tests | KPI / metric |
|--------|---------------------|--------------|-----------------|-----------------|--------------|
| **FR-01** | Multi-profile isolation and lifecycle | US-101, US-102, US-103, US-105 | `js/profile.js`, `js/handlers.js`, `js/vacation-days.js` | Manual regression | `daily_active_profiles` |
| **FR-02** | Password-gated profile access | US-104 | `js/profile.js`, `js/entries.js`, `js/export.js`, `js/handlers.js` | Manual regression | `profile_lock_adoption` |
| **FR-03** | Canonical entry save/edit/delete | US-201, US-202, US-203, US-204 | `js/form.js`, `js/modal.js`, `js/entries.js`, `lib/merge-working-hours.js` | `tests/merge-working-hours.test.js` | `entry_accuracy_rate`, `save_reliability` |
| **FR-04** | Multilingual voice → canonical persistence | US-301, US-302 | `js/voice-entry.js`, `js/modal.js`; prod mic policy in `vercel.json` | Manual regression | `voice_parse_acceptance` |
| **FR-05** | Autosave and startup sync reliability | US-401, US-402, US-403 | `js/storage.js`, `js/sync-status.js`, `js/data-sync.js`, `js/init.js` | `tests/api-working-hours-data.test.js` (API path) | `save_reliability`, `startup_sync_success` |
| **FR-06** | CSV/JSON export/import integrity | US-501, US-502 | `js/export.js`, `js/import.js` | Manual regression | `export_success_rate`, `schema_rejection_incidents` |
| **FR-07** | Full manual i18n coverage | US-601 | `js/i18n.js`, `js/i18n-*-locale.js`, `scripts/verify-i18n-locales.js` | `npm run verify:i18n` (script) | `translation_coverage` |
| **FR-08** | Filters, sort, timezone view | US-205, US-206 | `js/filters.js`, `js/render.js`, `js/time.js`, `js/entries-search.js` | Manual regression | `entry_accuracy_rate` |
| **FR-09** | Calendar navigation and selection | US-205 | `js/calendar.js`, `js/filters.js` | Manual regression | — |
| **FR-10** | Stats and infographic reporting | US-503, US-504 | `js/stats-summary.js`, `js/infographic.js`, `js/render.js` | Manual regression | `export_success_rate` |
| **FR-11** | Key Highlights PPT export | US-505 | `js/highlights-ppt.js`, `vendor/pptxgen.bundle.js` | Manual regression | `export_success_rate` |
| **FR-12** | Vacation allowance per year | US-105 | `js/vacation-days.js`, `js/export.js` | Manual regression | — |
| **FR-13** | Theme and language personalization | US-601, US-602 | `js/init.js`, `js/i18n.js`, `index.html` | Manual regression | `translation_coverage` |
| **FR-14** | Production API Redis persistence | US-402 | `api/working-hours-data.js`, `vercel.json` | `tests/api-working-hours-data.test.js` | `api_error_rate`, `startup_sync_success` |

---

## 2. Non-Functional Requirements

| Req ID | Requirement summary | User stories | Code references | Automated tests | KPI / metric |
|--------|---------------------|--------------|-----------------|-----------------|--------------|
| **NFR-01** | Reliability ≥ 99% saves | US-401 | `js/storage.js`, `js/data-sync.js` | `tests/api-working-hours-data.test.js`, merge tests | `save_reliability` |
| **NFR-02** | Performance guardrail <10% regression | All | Critical paths: `render.js`, `data-sync.js` | Manual benchmark | `api_p95_latency` |
| **NFR-03** | Security: hash-only passwords, optional API key | US-104 | `js/profile.js`, `api/working-hours-data.js` | `tests/api-working-hours-data.test.js` (auth mode) | Security incidents (ops) |
| **NFR-04** | Shared merge logic | US-402, US-403 | `lib/merge-working-hours.js`, `js/data-sync.js` | `tests/merge-working-hours.test.js` | `merge_conflict_fallback_rate` |
| **NFR-05** | Vercel deployability | US-402 | `vercel.json`, `docs/DEPLOYMENT_VERCEL.md` | Manual smoke | Release gate checklist |
| **NFR-06** | Accessibility AA target | US-601 | `index.html`, `DESIGN_GUIDELINES.md` | Manual a11y check | UX defect count |
| **NFR-07** | Export schema portability | US-501 | `js/export.js`, `docs/VARIABLES.md` | Manual schema validation | `schema_rejection_incidents` |

---

## 3. Automated Test Inventory (actual)

| Test file | Cases | Covers |
|-----------|-------|--------|
| `tests/merge-working-hours.test.js` | 2 | Merge by id/`updatedAt`; one entry per date; clock normalization |
| `tests/api-working-hours-data.test.js` | 4 | GET 404; POST 204; snapshot deletion; auth write mode |

**Total:** 6 tests via `npm test`.

### Planned / manual-only coverage gaps

| Area | Current coverage | Recommended next test |
|------|------------------|----------------------|
| Profile password flow | Manual | Unit tests for hash/verify |
| Import/export CSV | Manual | Fixture-based round-trip |
| Voice parser | Manual | Parser unit tests with phrase fixtures |
| i18n keys | `verify:i18n` script | Add to CI optional job |

---

## 4. Documentation Traceability

| Requirement | Primary doc |
|-------------|-------------|
| Data schema | `VARIABLES.md`, `DATA_SCHEMA_EXAMPLES.md` |
| Module inventory | `MODULE_REFERENCE.md`, `ARCHITECTURE.md` |
| Feature behavior | `FEATURE_LOGIC_CATALOG.md` |
| API | `API_CONTRACTS.md` |
| Security | `SECURITY_MODEL.md` |
| Design | `DESIGN_GUIDELINES.md` |
| Limits | `GUARDRAILS.md` |
| Ops | `OPERATIONS_RUNBOOK.md` |

---

## 5. Release Change Protocol

When shipping a feature tied to FR-##:

1. Update this matrix row if code or test paths change.
2. Update `USER_STORIES.md` acceptance criteria if behavior changes.
3. Update `VARIABLES.md` if schema changes.
4. Update `CHANGELOG.md`.
5. Verify KPI impact in release notes if user-visible.

---

## 6. Matrix Maintenance Log

| Date | Change |
|------|--------|
| 2026-07-22 | v2.4 suite refresh; scripts inventory correction; microphone policy traceability |
| 2026-07-08 | v2.3 doc alignment; app-tooltip module; i18n dead-key registry |
| 2026-07-07 | Added `sync-status.js`; doc alignment v2.1 |
| 2026-07-06 | Corrected test file references; added FR-08–FR-14 |
| 2026-04-29 | Expanded NFR rows |
| 2026-04-28 | Initial matrix |
