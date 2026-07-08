# Product Requirements Document (PRD)

**Product:** Working Hours Tracker  
**Version:** 2.2  
**Last updated:** 2026-07-08  
**Status:** Active

---

## 1. Executive Summary

Working Hours Tracker is a browser-based application for capturing, synchronizing, analyzing, and exporting structured working-time records across multiple user profiles. It targets individuals and small teams who need reliable time logs, management-ready reports, and portable data—without payroll processing or enterprise identity federation.

---

## 2. Product Vision

Provide a **dependable, low-friction** platform where every minute of work is recorded in a canonical format, protected when needed, and exportable for operational and strategic decisions.

---

## 3. Problem Statement

| Stakeholder | Problem | Current workaround pain |
|-------------|---------|-------------------------|
| Individual contributor | Daily logging is repetitive | Spreadsheets, missed days |
| Team lead | Summaries are inconsistent | Manual pivot tables |
| Operations analyst | Schema drifts between exports | Rework pipelines, failed imports |
| Shared-device user | Wrong profile edits | No isolation, trust issues |

---

## 4. Product Objectives

| ID | Objective | Success signal |
|----|-----------|----------------|
| O1 | Minimize daily logging friction | Median time-to-log < 2 minutes |
| O2 | Increase trust in saved data | Save reliability ≥ 99% |
| O3 | Support global users | 100% i18n key coverage at release |
| O4 | Enable manager-ready outputs | Export success ≥ 98% |
| O5 | Maintain governance traceability | 100% FR coverage in traceability matrix |

---

## 5. Scope

### 5.1 In scope

- Multi-profile lifecycle (create, edit, delete, role metadata)
- Optional profile password lock (client-side hash)
- Entry CRUD: single, bulk, batch edit/delete
- Clock in / clock out shortcuts
- Voice-assisted entry with review-before-apply
- Filters (basic/advanced), calendar, entries search
- Stats summary, infographic, Key Highlights PPT
- CSV / JSON import and export
- Startup sync and autosave to `/api/working-hours-data`
- 36 UI themes, 25+ languages
- Timezone-aware storage and view-timezone display
- Vacation allowance per profile/year
- Enterprise documentation suite

### 5.2 Out of scope

- Enterprise SSO / SAML / OAuth identity
- Payroll calculation and disbursement
- Native iOS/Android applications
- Multi-tenant SaaS billing
- Real-time collaborative editing (multi-user simultaneous)

---

## 6. User Personas (summary)

See `USER_PERSONAS.md` for full detail.

| Persona | Primary need |
|---------|--------------|
| Individual Contributor | Fast accurate daily logs |
| Team Lead / Manager | Trustworthy summaries and exports |
| Operations Analyst | Stable schema and traceability |
| Shared Device User | Profile isolation and lock |

---

## 7. Functional Requirements

| ID | Requirement | Priority | Primary modules |
|----|-------------|----------|-----------------|
| **FR-01** | Multi-profile data isolation with role metadata | P0 | `profile.js`, `handlers.js` |
| **FR-02** | Password-protected profiles gate sensitive actions | P0 | `profile.js`, `export.js`, `entries.js` |
| **FR-03** | Entries persisted in canonical normalized format | P0 | `form.js`, `modal.js`, `lib/merge-working-hours.js` |
| **FR-04** | Voice input parses multilingual speech; stores canonical values | P1 | `voice-entry.js` |
| **FR-05** | Autosave and startup sync with graceful retry and status badge | P0 | `storage.js`, `sync-status.js`, `data-sync.js`, `init.js` |
| **FR-06** | CSV/JSON export/import with metadata integrity | P0 | `export.js`, `import.js` |
| **FR-07** | Full manual i18n for shipped UI strings | P0 | `i18n.js`, `i18n-*-locale.js` |
| **FR-08** | Filterable entries table with sort and timezone view | P1 | `filters.js`, `render.js`, `time.js` |
| **FR-09** | Calendar month navigation and multi-date selection | P1 | `calendar.js` |
| **FR-10** | Stats summary charts and infographic reporting | P1 | `stats-summary.js`, `infographic.js` |
| **FR-11** | Key Highlights PowerPoint export | P2 | `highlights-ppt.js` |
| **FR-12** | Vacation allowance configuration per year | P1 | `vacation-days.js` |
| **FR-13** | Theme and language personalization | P2 | `init.js`, `i18n.js` |
| **FR-14** | Production API persistence via Redis snapshot | P0 | `api/working-hours-data.js` |

---

## 8. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| **NFR-01** Reliability | Save success rate (incl. retries) | ≥ 99.0% monthly |
| **NFR-02** Performance | No >10% regression on save/render critical paths without approval | Per release benchmark |
| **NFR-03** Security | No plaintext passwords; optional API write key | Zero plaintext incidents |
| **NFR-04** Maintainability | Shared merge logic for client and server | Single `lib/merge-working-hours.js` |
| **NFR-05** Deployability | Repeatable Vercel deploy with smoke checklist | 100% gate adherence |
| **NFR-06** Accessibility | Keyboard navigable modals; AA contrast on themes | WCAG 2.1 AA target |
| **NFR-07** Portability | Export includes profile id, role, vacation, entries | Schema documented in VARIABLES.md |

---

## 9. Key Business Rules

1. **One entry per canonical date per profile** after merge (latest `updatedAt` wins).
2. **Overtime** applies only when `dayStatus === 'work'` and `netWorkMinutes > 480`.
3. **Non-work statuses** (`sick`, `holiday`, `vacation`) default location to `Anywhere` and apply `NON_WORK_DEFAULTS` times when selected in forms.
4. **Production POST** replaces full snapshot—absent profiles/entries in payload are deletions.
5. **Locked profiles** block view/edit/export until password unlock (session in memory only).

---

## 10. User Journeys (high level)

### Journey A — Daily log (single entry)
Select profile → fill date/times/break/status → Save → autosave → optional cloud sync.

### Journey B — Bulk week planning
Open bulk panel → add rows or use example → save all → duplicate hints shown per date.

### Journey C — Manager monthly report
Apply year/month filters → Stats Summary or Infographic → export chart or PPT.

### Journey D — Device handoff
Lock profile with password → next user cannot edit without unlock.

---

## 11. Dependencies and Integrations

| Dependency | Type | Notes |
|------------|------|-------|
| Redis | Infrastructure | Production persistence |
| Vercel | Hosting | Static + serverless API |
| Chart.js | CDN | Stats charts |
| Luxon | CDN | Timezone conversion |
| PptxGenJS | npm/vendor | PPT export |
| Browser Speech API | Client | Voice entry (browser-dependent) |
| ipapi.co / ipwho.is | Optional network | Timezone/location hints |

---

## 12. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Voice parse ambiguity | Medium | Wrong entries | Review modal; editable fields |
| Shared device profile leakage | Medium | Data exposure | Profile password lock |
| Snapshot overwrite deletes data | Low | Data loss | Merge on client; document POST semantics |
| i18n key drift | Medium | Raw keys in UI | `verify:i18n` scripts; release gate; `remove-dead-i18n-keys.js` for verified orphans (`VARIABLES.md` §17) |
| API key not sent from client | Medium | POST fails in prod | Document `WORKHOURS_API_KEY`; client header TODO |

---

## 13. Acceptance and Release Criteria

- All automated tests pass (`npm test`).
- Documentation suite updated per `PRODUCT_DOCUMENTATION_STANDARD.md`.
- Manual smoke: profile CRUD, entry save, sync, export CSV, language switch.
- No P0/P1 open defects in release scope.
- Changelog and traceability matrix updated.

---

## 14. Roadmap Considerations (not committed)

- Client `X-API-Key` header support in `data-sync.js`
- Expanded automated frontend tests
- E2E browser test suite
- Optional end-to-end encryption for exports

---

## 15. References

- `USER_STORIES.md` — detailed acceptance criteria
- `VARIABLES.md` — data dictionary
- `TRACEABILITY_MATRIX.md` — requirement mapping
- `ARCHITECTURE.md` — technical topology
